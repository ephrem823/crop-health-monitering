import React, { useState } from 'react';
import { Leaf, Menu, X, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'history', label: 'History' },
    { id: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate('home')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Sprout size={24} />
            </div>
            <span className="text-xl font-bold text-emerald-900 hidden sm:inline-block">
              EthioCrop <span className="text-emerald-600">Health</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600",
                  currentPage === item.id ? "text-emerald-600" : "text-slate-600"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button 
              onClick={() => onNavigate('diagnosis')}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Start Diagnosis
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white py-4 px-4 shadow-lg animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "text-left text-base font-medium transition-colors p-2 rounded-md",
                  currentPage === item.id ? "bg-emerald-50 text-emerald-600" : "text-slate-600"
                )}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => {
                onNavigate('diagnosis');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white"
            >
              Start Diagnosis
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;