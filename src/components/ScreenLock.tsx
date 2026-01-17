import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface ScreenLockProps {
  onUnlock: () => void;
}

const ScreenLock = ({ onUnlock }: ScreenLockProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // 6 one-time-use passwords
  const allPasswords = [
    '18481848',
    '20242024',
    '12345678',
    '87654321',
    '11223344',
    '99887766'
  ];

  // Get used passwords from localStorage
  const getUsedPasswords = (): string[] => {
    try {
      const stored = localStorage.getItem('portal_used_passwords');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Mark a password as used
  const markPasswordAsUsed = (pwd: string) => {
    const used = getUsedPasswords();
    if (!used.includes(pwd)) {
      used.push(pwd);
      localStorage.setItem('portal_used_passwords', JSON.stringify(used));
    }
  };

  const handleSubmit = () => {
    const usedPasswords = getUsedPasswords();
    const availablePasswords = allPasswords.filter(p => !usedPasswords.includes(p));
    
    if (availablePasswords.includes(password)) {
      setError('');
      markPasswordAsUsed(password);
      onUnlock();
    } else if (allPasswords.includes(password) && usedPasswords.includes(password)) {
      setError('This password has already been used');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
    } else {
      setError('Incorrect password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    >
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          type: 'spring',
          x: { duration: 0.5 }
        }}
        className="glass-card p-8 max-w-md w-full mx-4 text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center mx-auto mb-6"
        >
          <Lock className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">
          <span className="gradient-text">Protected Access</span>
        </h1>
        <p className="text-muted-foreground mb-6">
          Enter the password to access the portal
        </p>

        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`input-glass text-center pr-12 ${error ? 'border-destructive' : ''}`}
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-destructive text-sm mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="btn-gradient w-full flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          Unlock Portal
        </motion.button>

        <p className="text-xs text-muted-foreground mt-6">
          🔒 This portal is protected for privacy
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ScreenLock;
