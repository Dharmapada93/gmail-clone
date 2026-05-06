import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { setCustomTheme } from '../features/themeSlice';

const ThemeModal = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const dispatch = useDispatch();

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-theme', { prompt });
      dispatch(setCustomTheme(data));
      onClose();
    } catch (err) {
      console.error(err);
    }
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#202124] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="text-purple-500" /> AI Theme Generator
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Describe the aesthetic you want, and the AI will generate a beautiful custom background gradient and matching glass panels for your entire app.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A neon cyberpunk city at night with pink and cyan glows..."
            className="w-full h-24 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/50 focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none mb-4"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <span className="animate-pulse">Generating magic...</span>
            ) : (
              <>Generate Theme</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
