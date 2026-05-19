import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Inbox from './pages/Inbox';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { activeTheme, customTheme } = useSelector((state) => state.theme);

  const getThemeClass = () => {
    switch (activeTheme) {
      case 'ocean': return 'theme-ocean';
      case 'sunset': return 'theme-sunset';
      case 'midnight': return 'theme-midnight dark';
      case 'custom': return customTheme?.textColor === 'text-white' ? 'theme-custom dark' : 'theme-custom';
      default: return 'bg-gray-50 dark:bg-dark-bg';
    }
  };

  const customStyle = activeTheme === 'custom' && customTheme ? {
    background: customTheme.backgroundGradient,
    '--glass-color': customTheme.glassColor,
  } : {};

  return (
    <div 
      className={`min-h-screen w-full transition-all duration-500 ${getThemeClass()} text-gray-900 dark:text-gray-100`}
      style={customStyle}
    >
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/inbox" />} />
            <Route path="login" element={<Navigate to="/inbox" />} />
            <Route path="register" element={<Navigate to="/inbox" />} />
            <Route path=":folder" element={<Inbox />} />
            <Route path="*" element={<Navigate to="/inbox" />} />
          </Route>
        )}
      </Routes>
    </div>
  );
}

export default App;
