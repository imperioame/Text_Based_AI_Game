import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';

const ModelSelector = ({ models, selectedModel, onModelChange, isOpen, onClose }) => {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleModelSelect = (modelName) => {
    onModelChange(modelName);
    onClose();
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-64 bg-gray-800 z-50 text-white transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      ref={sidebarRef}
    >
      <div className="flex justify-between items-center p-4 border-b border-green-600">
        <h2 className="text-xl font-bold">Select AI Model</h2>
        <button onClick={onClose} className="text-white hover:text-green-200">
          <X size={24} />
        </button>
      </div>
      <div className="p-4">
        {models.map((model) => (
          <div
            key={model.name}
            className={`mb-4 p-3 rounded cursor-pointer ${
              model.name === selectedModel ? 'bg-green-600' : 'hover:bg-green-600'
            }`}
            onClick={() => handleModelSelect(model.name)}
          >
            <div className="font-semibold">{model.name}</div>
            <div className="text-sm text-green-200">{model.type}</div>
            <div className="text-sm text-green-300">{model.comments}</div>
            <a
              href={`https://huggingface.co/${model.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-200 hover:underline text-sm flex items-center mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              View on Hugging Face <ExternalLink size={12} className="ml-1" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;