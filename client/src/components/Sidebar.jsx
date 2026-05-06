import { NavLink } from 'react-router-dom';
import { Inbox, Send, File, AlertOctagon, Trash2, Edit3 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentFolder } from '../features/emailSlice';

const Sidebar = ({ isOpen, onCompose }) => {
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Inbox', icon: <Inbox size={20} />, path: '/inbox' },
    { name: 'Sent', icon: <Send size={20} />, path: '/sent' },
    { name: 'Drafts', icon: <File size={20} />, path: '/drafts' },
    { name: 'Spam', icon: <AlertOctagon size={20} />, path: '/spam' },
    { name: 'Trash', icon: <Trash2 size={20} />, path: '/trash' },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-bg transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-4 flex items-center mb-4">
        <span className="text-2xl font-semibold text-gray-700 dark:text-gray-200 ml-2">Gmail Clone</span>
      </div>

      <div className="px-3 mb-6">
        <button 
          onClick={onCompose}
          className="flex items-center gap-4 bg-[#c2e7ff] hover:bg-[#b0dcf8] dark:bg-primary/20 dark:hover:bg-primary/30 text-[#001d35] dark:text-primary-dark px-6 py-4 rounded-2xl font-medium transition-colors shadow-sm w-full"
        >
          <Edit3 size={20} />
          <span>Compose</span>
        </button>
      </div>

      <nav className="px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => dispatch(setCurrentFolder(item.name.toLowerCase()))}
            className={({ isActive }) => 
              `flex items-center gap-4 px-6 py-2 rounded-r-full font-medium transition-colors ${
                isActive 
                  ? 'bg-[#d3e3fd] text-[#0b57d0] dark:bg-primary/20 dark:text-primary-dark' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2e30]'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
