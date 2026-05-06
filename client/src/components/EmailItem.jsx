import { useState } from 'react';
import { Star, MoreVertical, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

const EmailItem = ({ email }) => {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const isUnread = email.status === 'unread';

  const handleExpand = async () => {
    if (!expanded && replies.length === 0) {
      setExpanded(true);
      setLoadingReplies(true);
      try {
        const { data } = await api.post('/ai/smart-reply', { emailBody: email.body });
        setReplies(data.replies);
      } catch (err) {
        console.error(err);
      }
      setLoadingReplies(false);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div className={`flex flex-col border-b border-black/5 dark:border-white/5 ${expanded ? 'bg-white/40 dark:bg-black/20' : ''}`}>
      <div 
        onClick={handleExpand}
        className={`flex items-center gap-4 px-4 py-3 cursor-pointer group border-l-4 transition-colors ${isUnread ? 'bg-white/60 dark:bg-[#202124]/60 border-[#0b57d0] font-semibold' : 'bg-transparent border-transparent font-normal'} hover:bg-black/5 dark:hover:bg-white/10 hover:shadow-sm`}
      >
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" onClick={e => e.stopPropagation()}>
          <input type="checkbox" className="rounded text-[#0b57d0] focus:ring-[#0b57d0] w-4 h-4 cursor-pointer" />
          <Star size={18} className="cursor-pointer hover:text-yellow-400 transition-colors" />
        </div>
        
        <div className="w-48 truncate text-sm text-gray-900 dark:text-gray-100">
          {email.sender?.name || email.receiver}
        </div>
        
        <div className="flex-1 truncate text-sm flex items-center gap-2">
          <span className="text-gray-900 dark:text-gray-100">{email.subject}</span>
          <span className="text-gray-600 dark:text-gray-400">-</span>
          <span className="text-gray-600 dark:text-gray-400 truncate">{email.body}</span>
        </div>

        <div className="w-24 text-right text-xs text-gray-600 dark:text-gray-400 group-hover:hidden">
          {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
        </div>
        
        <div className="w-24 text-right hidden group-hover:flex items-center justify-end gap-2 text-gray-600 dark:text-gray-400">
          <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors" onClick={e => e.stopPropagation()}><MoreVertical size={16} /></button>
        </div>
      </div>

      {expanded && (
        <div className="px-16 py-6 pb-8 border-l-4 border-transparent bg-white/20 dark:bg-black/10">
          <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">{email.subject}</h2>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{email.sender?.name || email.receiver} <span className="text-gray-600 font-normal">&lt;{email.sender?.email || email.receiver}&gt;</span></span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{new Date(email.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-8">
            {email.body}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 mb-3 uppercase tracking-wider">
              <Sparkles size={14} /> Smart Replies
            </div>
            {loadingReplies ? (
              <div className="flex gap-2 animate-pulse">
                <div className="h-8 w-24 bg-white/50 dark:bg-white/10 rounded-full"></div>
                <div className="h-8 w-32 bg-white/50 dark:bg-white/10 rounded-full"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {replies.map((reply, i) => (
                  <button 
                    key={i} 
                    className="px-4 py-2 text-sm text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/20 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailItem;
