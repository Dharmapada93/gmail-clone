import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setEmailsStart, setEmailsSuccess, setEmailsFailure, setCurrentFolder } from '../features/emailSlice';
import api from '../services/api';
import EmailItem from '../components/EmailItem';
import { RefreshCw } from 'lucide-react';

const Inbox = () => {
  const { folder } = useParams();
  const dispatch = useDispatch();
  const { emails, loading, error, page, totalPages } = useSelector((state) => state.emails);
  const activeFolder = folder || 'inbox';
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchEmails = async (pageNum = 1, append = false) => {
    if (!append) dispatch(setEmailsStart());
    else setLoadingMore(true);

    try {
      const { data } = await api.get(`/emails/folder/${activeFolder}?page=${pageNum}&limit=20`);
      dispatch(setEmailsSuccess({ data, append }));
      dispatch(setCurrentFolder(activeFolder));
    } catch (err) {
      dispatch(setEmailsFailure(err.response?.data?.message || 'Failed to fetch emails'));
    } finally {
      if (append) setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEmails(1, false);
  }, [activeFolder, dispatch]);

  const loadMore = () => {
    if (page < totalPages) {
      fetchEmails(page + 1, true);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/40 backdrop-blur-md px-4 py-2 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <button onClick={() => fetchEmails(1, false)} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
              <RefreshCw size={18} className={loading && !loadingMore ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && !loadingMore && <div className="p-4 text-center text-gray-500">Loading emails...</div>}
        {error && <div className="p-4 text-center text-red-500">{error}</div>}
        {!loading && !error && emails.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">Your {activeFolder} is empty</p>
          </div>
        )}
        <div className="divide-y divide-gray-200 dark:divide-white/5">
          {emails.map((email) => (
            <EmailItem key={email._id} email={email} />
          ))}
        </div>
        
        {page < totalPages && (
          <div className="p-4 flex justify-center">
            <button 
              onClick={loadMore} 
              disabled={loadingMore}
              className="px-6 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-sm font-medium transition-colors text-gray-800 dark:text-gray-200 disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
