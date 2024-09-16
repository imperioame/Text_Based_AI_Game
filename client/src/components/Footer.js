import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-green-300 py-4 px-8 flex justify-between items-center border-t border-gray-600">
      <div className="text-sm">AI Adventure Game</div>
      <div className="text-sm text-center">Made by J. Mario Amé</div>
      <div className="text-sm flex flex-col items-end text-right">
        <a 
          href="https://julianmmame.com.ar/" 
          className="mb-1 hover:text-green-200 underline"
          target="_blank" 
          rel="noopener noreferrer"
        >
          Website
        </a>
        <a 
          href="https://github.com/imperioame" 
          className="mb-1 hover:text-green-200 underline"
          target="_blank" 
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a 
          href="https://www.linkedin.com/in/julian-ame/" 
          className="hover:text-green-200 underline"
          target="_blank" 
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}

export default Footer;
