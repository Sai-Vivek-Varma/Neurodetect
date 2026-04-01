import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: "How does the SC-Convolution enhancement work?",
    answer: "SCConv enhances detection by filtering out redundant spatial and channel data. Using Spatial (SRU) and Channel (CRU) reconstruction, it forces the model to ignore normal brain tissue and lock strictly onto the irregular textures of tumors, increasing accuracy while saving computing power."
  },
  {
    question: "What types of tumors can this detect?",
    answer: "Our customized diagnostics model is trained to recognize and classify three major types of brain anomalies: Gliomas, Meningiomas, and Pituitary tumors. It classifies them automatically and returns a confidence percentage based on the specific morphological features isolated by the SCConv layers."
  },
  {
    question: "Is my medical data kept private?",
    answer: "Yes. All uploaded files and analyses are strictly stored locally on your machine within an encrypted SQLite database. No image data or metadata is transmitted to external servers, providing full HIPPA-compliant operational security on your own hardware."
  },
  {
    question: "Can I use this for clinical diagnosis?",
    answer: "No. This tool is built strictly for medical research, education, and preliminary screening. It serves as a decision-support system and must never be used as a final diagnostic tool without professional verification from a certified neurologist or radiologist."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }} className="animate-slide-up">
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Frequently Asked <span className="gradient-text">Questions</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Select a topic to securely learn more.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {faqData.map((faq, index) => (
          <div 
            key={index} 
            className="glass-panel" 
            style={{ padding: '1rem', cursor: 'pointer', transition: 'all 0.3s ease', border: openIndex === index ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid var(--border-light)' }}
            onClick={() => toggleFAQ(index)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: openIndex === index ? 'white' : 'var(--text-secondary)', transition: 'color 0.3s ease' }}>
                {faq.question}
              </h3>
              {openIndex === index ? <ChevronUp size={16} color="var(--accent-pu)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
            </div>
            
            {/* Smooth Growing Grid Container */}
            <div style={{
              display: 'grid',
              gridTemplateRows: openIndex === index ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: openIndex === index ? '0.75rem' : '0',
            }}>
              <div style={{ 
                overflow: 'hidden',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}>
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
