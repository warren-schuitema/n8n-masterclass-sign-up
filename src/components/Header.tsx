// Header component with navigation and theme toggle
import React from 'react';
import { Bot, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onRegisterClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode, onRegisterClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-primary-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8 text-electric-400" />
            <span className="font-orbitron font-bold text-xl tracking-wider">
              N8N MASTERCLASS
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-navy-800/50 hover:bg-navy-700/50 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-400" />
              )}
            </button>
            
            <button
              onClick={onRegisterClick}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-electric-500 to-violet-500 rounded-lg font-inter font-semibold text-sm hover:from-electric-400 hover:to-violet-400 transition-all duration-200 transform hover:scale-105 animate-glow"
            >
              <span>REGISTER NOW</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};