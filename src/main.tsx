
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add the following styles to the document for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes scale-in {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes pulse-slow {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }

  .animate-scale-in {
    animation: scale-in 0.3s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s infinite;
  }

  .hover-scale {
    transition: transform 0.2s ease;
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
