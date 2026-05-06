import { Menu, Search, LogOut, Palette, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { setTheme } from '../features/themeSlice';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import ThemeModal from './ThemeModal';

const Topbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { id: 'default', name: 'Default' },
    { id: 'ocean', name: 'Ocean Breeze' },
    { id: 'sunset', name: 'Sunset Glow' },
    { id: 'midnight', name: 'Midnight Galaxy' }
  ];

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-transparent border-b border-white/20 dark:border-white/10 lg:border-none">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors lg:hidden"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex-1 max-w-3xl px-4 hidden sm:block">
        <div className="relative flex items-center w-full h-12 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-sm focus-within:bg-white focus-within:shadow-md focus-within:dark:bg-[#202124] focus-within:dark:shadow-md border border-white/30 dark:border-white/10 focus-within:border-gray-200 transition-all">
          <div className="absolute left-4 text-gray-600 dark:text-gray-400">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search mail" 
            className="w-full h-full pl-12 pr-4 bg-transparent outline-none text-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors"
            title="Themes"
          >
            <Palette size={20} />
          </button>
          
          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl py-2 z-50">
              <button
                onClick={() => { setShowAIModal(true); setShowThemeMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-purple-600 dark:text-purple-400 font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2 border-b border-black/5 dark:border-white/5"
              >
                <Sparkles size={16} /> Create AI Theme
              </button>
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => { dispatch(setTheme(t.id)); setShowThemeMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-medium"
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {showAIModal && <ThemeModal onClose={() => setShowAIModal(false)} />}

        <div className="flex items-center gap-2 mr-2 ml-2">
           <span className="text-sm font-medium text-gray-800 dark:text-gray-200 hidden md:block">{user?.name}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
