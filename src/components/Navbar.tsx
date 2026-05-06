import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Users,
  Award,
  ClipboardList,
  FileCheck,
  FileText,
  Info,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navLinks = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'textbooks', label: 'Textbooks', icon: BookOpen },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'mid', label: 'Mid Exam', icon: ClipboardList },
  { key: 'final', label: 'Final Exam', icon: FileCheck },
  { key: 'report', label: 'Report Card', icon: FileText },
  { key: 'results', label: 'Ministry', icon: Award },
];

const Navbar = ({ currentPage, onNavigate }: NavbarProps) => {
  const [open, setOpen] = useState(false);

  const go = (key: string) => {
    setOpen(false);
    onNavigate(key);
  };

  return (
    <>
      {/* Top website-style nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-3 pt-3">
        <div className="max-w-7xl mx-auto glass-card flex items-center justify-between gap-3 px-4 py-2.5">
          <button
            onClick={() => go('home')}
            className="flex items-center gap-2 shrink-0"
            aria-label="Home"
          >
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-9 h-9 rounded-full border-2 border-primary/40 object-cover"
            />
            <span className="hidden sm:inline gradient-text font-bold text-base lg:text-lg whitespace-nowrap">
              Grade 9 STS Portal
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const active = currentPage === l.key;
              const Icon = l.icon;
              return (
                <button
                  key={l.key}
                  onClick={() => go(l.key)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground/80 hover:bg-white/10 hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{l.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => go('info')}
              aria-label="Info"
              className={`p-2 rounded-xl transition-colors ${
                currentPage === 'info'
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-white/10'
              }`}
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden max-w-7xl mx-auto mt-2 glass-card p-2 grid grid-cols-2 gap-1.5"
          >
            {navLinks.map((l) => {
              const active = currentPage === l.key;
              const Icon = l.icon;
              return (
                <button
                  key={l.key}
                  onClick={() => go(l.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {l.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
