import { useState, useRef } from 'react';
import { X, Minimize2, Paperclip, Clock, Trash, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useDispatch } from 'react-redux';
import { addEmail } from '../features/emailSlice';

const ComposeModal = ({ onClose }) => {
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const [isUndoing, setIsUndoing] = useState(false);
  const [undoTimeoutId, setUndoTimeoutId] = useState(null);

  const handleEnhance = async () => {
    if (!body) return;
    setIsEnhancing(true);
    try {
      const { data } = await api.post('/ai/enhance', { text: body });
      setBody(data.enhancedText);
    } catch (err) {
      console.error(err);
    }
    setIsEnhancing(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!receiver) return;

    setIsUndoing(true);
    
    const formData = new FormData();
    formData.append('receiver', receiver);
    formData.append('subject', subject);
    formData.append('body', body);
    if (isScheduled && scheduledTime) {
      formData.append('isScheduled', 'true');
      formData.append('scheduledAt', new Date(scheduledTime).toISOString());
    }
    
    Array.from(attachments).forEach(file => {
      formData.append('attachments', file);
    });

    const timeoutId = setTimeout(async () => {
      setIsSending(true);
      try {
        const { data } = await api.post('/emails', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (!isScheduled) {
           dispatch(addEmail(data));
        }

        setIsSending(false);
        onClose();
      } catch (err) {
        console.error('Error sending email:', err);
        setIsSending(false);
        setIsUndoing(false);
      }
    }, 5000);

    setUndoTimeoutId(timeoutId);
  };

  const handleUndo = () => {
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
      setUndoTimeoutId(null);
      setIsUndoing(false);
    }
  };

  if (isUndoing && !isSending) {
    return (
      <div className="fixed bottom-6 left-6 z-[60] bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-6">
        <span>Sending...</span>
        <button 
          onClick={handleUndo}
          className="text-yellow-400 font-semibold hover:underline"
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-8 md:right-24 w-full md:w-[500px] h-[600px] max-h-[80vh] glass-panel rounded-t-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      <div className="bg-black/5 dark:bg-white/5 px-4 py-3 flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">New Message</span>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <button className="hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded transition-colors"><Minimize2 size={16} /></button>
          <button onClick={onClose} className="hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded transition-colors"><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col bg-white/40 dark:bg-black/20">
        <input 
          type="email" 
          placeholder="To" 
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="w-full py-2 border-b border-black/5 dark:border-white/5 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200"
        />
        <input 
          type="text" 
          placeholder="Subject" 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full py-2 border-b border-black/5 dark:border-white/5 bg-transparent outline-none text-sm font-medium text-gray-800 dark:text-gray-200"
        />
        
        <textarea 
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full flex-1 mt-2 py-2 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 resize-none"
          placeholder="Write your email here..."
        />

        {isScheduled && (
          <div className="py-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
            <span className="text-sm text-gray-500">Send at:</span>
            <input 
              type="datetime-local" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none"
            />
          </div>
        )}

        {attachments.length > 0 && (
          <div className="py-2 flex gap-2 flex-wrap border-t border-black/5 dark:border-white/5">
            {Array.from(attachments).map((file, i) => (
              <div key={i} className="bg-black/5 dark:bg-white/10 text-xs px-2 py-1 rounded flex items-center gap-1">
                <span className="truncate max-w-[100px]">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/30">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="bg-[#0b57d0] hover:bg-[#084298] text-white px-6 py-2 rounded-full font-medium text-sm transition-colors disabled:opacity-50"
          >
            Send
          </button>
          
          <button 
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors relative"
            title="Attach files"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={18} />
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => setAttachments(e.target.files)}
            />
          </button>
          
          <button 
            className={`p-2 rounded-full transition-colors ${isScheduled ? 'text-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'}`}
            title="Schedule send"
            onClick={() => setIsScheduled(!isScheduled)}
          >
            <Clock size={18} />
          </button>

          <button 
            className={`p-2 rounded-full transition-colors text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 ${isEnhancing ? 'animate-pulse' : ''}`}
            title="Enhance with AI"
            onClick={handleEnhance}
            disabled={isEnhancing}
            type="button"
          >
            <Sparkles size={18} />
          </button>
        </div>

        <button 
          onClick={onClose}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
          title="Discard draft"
        >
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
};

export default ComposeModal;
