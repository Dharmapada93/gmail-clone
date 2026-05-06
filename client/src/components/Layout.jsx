import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ComposeModal from './ComposeModal';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addEmail } from '../features/emailSlice';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socket = io(`http://${window.location.hostname}:5000`, {
        transports: ['websocket']
      });
      
      socket.emit('join_room', user._id);

      socket.on('receive_email', (email) => {
        dispatch(addEmail(email));
      });

      return () => socket.disconnect();
    }
  }, [user, dispatch]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onCompose={() => setIsComposeOpen(true)} />
      
      <div className="flex-1 flex flex-col min-w-0 glass-panel rounded-3xl overflow-hidden mt-16 lg:mt-2 lg:ml-2 mr-2 mb-2 transition-all duration-300">
        <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-transparent">
          <Outlet />
        </main>
      </div>

      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
};

export default Layout;
