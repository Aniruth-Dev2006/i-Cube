import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Edit } from 'lucide-react';
import { authService } from '../services/authService';
import { useState } from 'react';
import EditProfile from './EditProfile';

const Header = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400" style={{fontFamily: "'Inter', 'Helvetica Neue', sans-serif"}}>
            LawBridge
          </span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            to="/chat"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            General Bot
          </Link>
          <Link
            to="/lawyer-tools"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Lawyer Suite
          </Link>
          <Link
            to="/law-student"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Law Student Hub
          </Link>
          
          <div className="relative group">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20">
              <User className="h-5 w-5" />
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-48 origin-top-right scale-0 rounded-lg border border-border bg-background/95 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-100">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email || ''}</p>
              </div>
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
    
    {showEditProfile && (
      <EditProfile
        user={currentUser}
        onUpdate={(updatedUser) => {
          setCurrentUser(updatedUser);
          setShowEditProfile(false);
        }}
        onCancel={() => setShowEditProfile(false)}
      />
    )}
  </>
  );
};

export default Header;
