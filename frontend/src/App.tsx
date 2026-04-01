import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <div className="bg-scanline"></div>
      <Navbar />
      <main className="container animate-slide-up">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
      <Chatbot />
    </>
  );
}

export default App;
