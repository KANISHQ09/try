import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  HardDrive, 
  Activity, 
  FileText, 
  Zap, 
  Moon, 
  Sun 
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  // Initialize state from localStorage or default to system preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Toggle logic
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Apply the 'dark' class to the html element and save to localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/assets', icon: HardDrive, label: 'Assets' },
    { path: '/monitoring', icon: Activity, label: 'Monitoring' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  return (
    // Main container background: light gradient in light mode, solid black in dark mode
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-white to-slate-100 dark:from-black dark:to-black text-slate-900 dark:text-white">
      
      {/* Navbar: White in light mode, Black in dark mode */}
      <nav className="bg-white dark:bg-black border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Shakti</h1>
                <p className="text-xs text-slate-500 dark:text-white/70 font-medium">AI-powered digital twin for substations</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 dark:bg-white/10 dark:text-white font-medium'
                          : 'text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Theme Toggle Button */}
              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2"></div>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-white dark:hover:bg-white/5 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}