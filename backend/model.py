import os
import io
import base64
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
from ultralytics import YOLO
from ultralytics.nn.modules import C2f

# SCConv Components

class SRU(nn.Module):
    def __init__(self, channels, group_num=4, gate_thr=0.5):
        super().__init__()
        self.gate_thr = gate_thr
        group_num = min(group_num, channels)
        while channels % group_num != 0:
            group_num -= 1
        self.norm = nn.GroupNorm(group_num, channels)

    def forward(self, x):
        normed = self.norm(x)
        w = torch.sigmoid(normed)
        x_info = x * (w >= self.gate_thr).float()
        x_redu = x * (w <  self.gate_thr).float()
        return x_info + x_redu * w


class CRU(nn.Module):
    def __init__(self, channels, alpha=0.5, squeeze_ratio=2):
        super().__init__()
        self.upper_ch = max(int(channels * alpha), 1)
        self.lower_ch = max(channels - self.upper_ch, 1)
        mid_ch = max(channels // squeeze_ratio, 1)

        groups = max(self.upper_ch // 16, 1)
        while self.upper_ch % groups != 0:
            groups -= 1
        self.gwc  = nn.Conv2d(self.upper_ch, mid_ch, 3, padding=1, groups=groups, bias=False)
        self.pwc1 = nn.Conv2d(self.upper_ch, mid_ch, 1, bias=False)
        self.pwc2 = nn.Conv2d(self.lower_ch, mid_ch, 1, bias=False)

        self.pool     = nn.AdaptiveAvgPool2d(1)
        self.bn       = nn.BatchNorm2d(mid_ch)
        self.relu     = nn.ReLU(inplace=True)
        self.out_conv = nn.Conv2d(mid_ch, channels, 1, bias=False)

    def forward(self, x):
        x_upper = x[:, :self.upper_ch]
        x_lower = x[:, self.upper_ch:]

        y1 = self.gwc(x_upper) + self.pwc1(x_upper)
        y2 = self.pwc2(x_lower)

        s1 = self.pool(y1)
        s2 = self.pool(y2)
        w  = torch.softmax(torch.cat([s1, s2], dim=1), dim=1)
        w1, w2 = w[:, :s1.shape[1]], w[:, s1.shape[1]:]

        fused = y1 * w1 + y2 * w2
        fused = self.relu(self.bn(fused))
        return self.out_conv(fused)


class SCConv(nn.Module):
    def __init__(self, in_channels, out_channels, group_num=4, gate_thr=0.5, alpha=0.5, squeeze_ratio=2):
        super().__init__()
        self.sru = SRU(in_channels, group_num=group_num, gate_thr=gate_thr)
        self.cru = CRU(in_channels, alpha=alpha, squeeze_ratio=squeeze_ratio)
        self.bn  = nn.BatchNorm2d(in_channels)
        self.act = nn.SiLU(inplace=True)

        self.proj = (nn.Sequential(
                         nn.Conv2d(in_channels, out_channels, 1, bias=False),
                         nn.BatchNorm2d(out_channels))
                     if in_channels != out_channels else nn.Identity())

    def forward(self, x):
        out = self.sru(x)
        out = self.cru(out)
        out = self.act(self.bn(out)) + x
        return self.proj(out)


class C2fWithSCConv(nn.Module):
    def __init__(self, c2f_block):
        super().__init__()
        self.c2f = c2f_block
        out_ch = c2f_block.cv2.conv.out_channels
        self.scconv = SCConv(out_ch, out_ch)

    def forward(self, x):
        return self.scconv(self.c2f(x))


def inject_scconv_into_head(yolo_model):
    seq = yolo_model.model.model
    HEAD_START = 10
    for idx in range(HEAD_START, len(seq)):
        layer = seq[idx]
        if isinstance(layer, C2f):
            seq[idx] = C2fWithSCConv(layer)
    return yolo_model


# Hack namespace for pickle if needed
import __main__
if not hasattr(__main__, 'C2fWithSCConv'):
    __main__.C2fWithSCConv = C2fWithSCConv
    __main__.SCConv = SCConv
    __main__.SRU = SRU
    __main__.CRU = CRU

# Globals
model = None

def get_model():
    global model
    if model is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'weights', 'best.pt')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Weights file not found at {model_path}. Please make sure you have the model weights.")
        model = YOLO(model_path)
    return model

def predict_image(image_bytes: bytes):
    # Load model
    m = get_model()
    
    # Read image
    img_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)

    # Run inference
    # YOLO returns a list of results (one per image)
    results = m.predict(source=img, conf=0.25)
    
    result = results[0]
    
    # Rendered image with bounding boxes
    annotated_img = result.plot()
    
    # Convert annotated image to base64
    _, buffer = cv2.imencode('.png', annotated_img)
    annotated_b64 = base64.b64encode(buffer).decode('utf-8')
    
    # Extract prediction data
    predictions = []
    if result.boxes:
        for box in result.boxes:
            conf = float(box.conf.cpu().numpy()[0])
            cls_idx = int(box.cls.cpu().numpy()[0])
            cls_name = m.names[cls_idx]
            xyxy = box.xyxy.cpu().numpy()[0].tolist()
            predictions.append({
                "class_name": cls_name,
                "confidence": conf,
                "box": xyxy
            })

    return {
        "annotated_image": f"data:image/png;base64,{annotated_b64}",
        "predictions": predictions
    }
