import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { Moon, Sun, LogOut, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDark } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="glass-panel rounded-none border-x-0 border-t-0 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary-hover font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <span>Smart Notes</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
          
          {user && (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                {user.profileImage ? (
                  <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-medium">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
