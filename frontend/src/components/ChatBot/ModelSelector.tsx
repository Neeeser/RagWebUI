import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '../ui/card';

interface ModelOption {
  id: string;
  title: string;
  endpoint: string;
  logo: string;
  category: 'Local' | 'Paid';
}

const modelOptions: ModelOption[] = [
  { id: '1', title: 'Llama 3 8B (Desktop)', endpoint: 'llama3:instruct', logo: '/modelLogos/meta.png', category: 'Local' },
  { id: '2', title: 'Qwen 1.8B (Laptop)', endpoint: 'qwen:1.8b', logo: '/modelLogos/qwen.png', category: 'Local' },
  { id: '3', title: 'Mistral 7B (Desktop)', endpoint: 'mistral', logo: '/modelLogos/mistral.png', category: 'Local' },
  { id: '4', title: 'Zephyr 7B (Desktop)', endpoint: 'zephyr', logo: '/modelLogos/zephyr.png', category: 'Local' },
  { id: '5', title: 'GPT-4 Turbo', endpoint: 'openai/gpt-4-turbo-preview', logo: '/modelLogos/openai.png', category: 'Paid' },
  { id: '6', title: 'Claude 3: Opus', endpoint: 'anthropic/claude-3-opus:beta', logo: '/modelLogos/anthropic.png', category: 'Paid' },
  { id: '7', title: 'Claude 3: Sonnet', endpoint: 'anthropic/claude-3-sonnet:beta', logo: '/modelLogos/anthropic.png', category: 'Paid' },
  { id: '8', title: 'Claude 3: Haiku', endpoint: 'anthropic/claude-3-haiku:beta', logo: '/modelLogos/anthropic.png', category: 'Paid' },
];

const ModelSelector: React.FC<{ selectedModel?: ModelOption; onSelectModel?: (model: ModelOption) => void }> = ({ selectedModel, onSelectModel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelOption>(selectedModel || modelOptions[0]);
  const [includePaidModels, setIncludePaidModels] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPaidStatus = async () => {
      try {
        const response = await fetch('/api/chat/get_paid_status');
        const data = await response.json();
        if (data.status) {
          setIncludePaidModels(true);
        }
      } catch (error) {
        console.error('Error fetching paid status:', error);
      }
    };

    fetchPaidStatus();

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleModelSelect = async (model: ModelOption) => {
    setCurrentModel(model);
    onSelectModel?.(model);
    setIsOpen(false);
    try {
      const response = await fetch('/api/chat/switch_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model_name: model.endpoint }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update model');
      }
      console.log(`Model updated successfully: ${data.message}`);
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  return (
    <div className="model-selector border-2 border-gray-700 bg-[#282c34] relative w-1/3 p-3 cursor-pointer" ref={ref} onClick={() => setIsOpen(!isOpen)}>
      <h2 className="model-selector-header flex items-center text-xl">
        <img src={currentModel.logo} alt={currentModel.title} style={{ width: '30px', height: '30px', marginRight: '15px' }} />
        {currentModel.title}
      </h2>
      {isOpen && (
        <div className="dropdown-content absolute z-10 left-0 mt-px bg-[#282c34] shadow-lg w-full p-2" style={{ top: '100%', width: '100%', maxHeight: '50vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
          <h2 className="py-2 text-xl font-bold flex items-center gap-2 pl-4" style={{ cursor: 'default' }}>Local</h2>
          <div className="space-y-2">
            {modelOptions.filter(model => model.category === 'Local').map((model) => (
              <Card key={model.id} imgSrc={model.logo} onClick={() => handleModelSelect(model)} className={`model-item w-full mx-auto cursor-pointer ${currentModel && currentModel.id === model.id ? 'bg-lavender-light relative' : ''}`}>
                <CardContent className="p-2">
                  <span>{model.title}</span>
                  {currentModel && currentModel.id === model.id && (
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM7.293 10.707a1 1 0 0 0 1.414 0l3.5-3.5a1 1 0 0 0-1.414-1.414L8 8.586 6.707 7.293a1 1 0 0 0-1.414 1.414l1.5 1.5z"/>
                      </svg>
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {includePaidModels && (
            <>
              <h2 className="py-4 text-xl font-bold flex items-center gap-2 pl-4" style={{ cursor: 'default' }}>Paid</h2>
              <div className="space-y-2">
                {modelOptions.filter(model => model.category === 'Paid').map((model) => (
                  <Card key={model.id} imgSrc={model.logo} onClick={() => handleModelSelect(model)} className={`model-item w-full mx-auto cursor-pointer ${currentModel && currentModel.id === model.id ? 'bg-lavender-light relative' : ''}`}>
                    <CardContent className="p-2">
                      <span>{model.title}</span>
                      {currentModel && currentModel.id === model.id && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM7.293 10.707a1 1 0 0 0 1.414 0l3.5-3.5a1 1 0 0 0-1.414-1.414L8 8.586 6.707 7.293a1 1 0 0 0-1.414 1.414l1.5 1.5z"/>
                          </svg>
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
