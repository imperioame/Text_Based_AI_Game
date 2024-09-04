import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-green-300 py-2 px-4 flex justify-between items-center">
      <div className="text-sm">AI Adventure Game</div>
      <div className="text-sm">
        Made by J. Mario Amé 
        <a href="#" className="ml-2 hover:text-green-200">Website</a>
        <a href="#" className="ml-2 hover:text-green-200">GitHub</a>
        <a href="#" className="ml-2 hover:text-green-200">LinkedIn</a>
      </div>
    </footer>
  );
}

export default Footer;