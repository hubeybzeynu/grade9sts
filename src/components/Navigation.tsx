import { motion } from 'framer-motion';
import { Home, BookOpen, Users, Award, ChevronLeft } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'textbooks', label: 'Textbooks', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'results', label: 'Results', icon: Award },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card px-4 py-3 flex items-center justify-between gap-4"
        >
          {currentPage !== 'home' && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => onNavigate('home')}
              className="btn-ghost flex items-center gap-2 py-2 px-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
          )}
          
          <div className="flex items-center gap-2 flex-1 justify-center">
            <img 
              src="https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg" 
              alt="School Logo"
              className="w-10 h-10 rounded-full border-2 border-primary/30 object-cover"
            />
            <span className="font-bold text-lg gradient-text hidden sm:block">Grade 9 STS Portal</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:block text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-xl -z-10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navigation;
