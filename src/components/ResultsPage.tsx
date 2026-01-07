import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Award, ImageIcon, X, HelpCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const ResultsPage = () => {
  const [studentId, setStudentId] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');

  // Sample result images mapping (in real app, this would be fetched from API)
  const resultImages: Record<string, string> = {
    '219353': 'https://i.postimg.cc/tJZBYQJf/photo-2025-06-26-19-11-47.jpg',
    '219354': 'https://i.postimg.cc/ZKBcKMVn/photo-2025-06-26-19-12-10.jpg',
    '219355': 'https://i.postimg.cc/Y0qLQMrf/photo-2025-06-26-19-13-48.jpg',
    '219356': 'https://i.postimg.cc/Y9h6zy2P/photo-2025-06-26-19-14-38.jpg',
    '219357': 'https://i.postimg.cc/3wbWjGVN/photo-2025-06-26-19-15-32.jpg',
    '219358': 'https://i.postimg.cc/jdRD4pDd/photo-2025-06-26-19-16-14.jpg',
    '219359': 'https://i.postimg.cc/PqCzQBJj/photo-2025-06-26-19-17-00.jpg',
    '219360': 'https://i.postimg.cc/BZNJjMfn/photo-2025-06-26-19-18-13.jpg',
  };

  const galleryImages = Object.values(resultImages);
  const studentIds = Object.keys(resultImages);

  const handleSearch = () => {
    setError('');
    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }
    if (resultImages[studentId]) {
      setShowResult(true);
    } else {
      setError('Student ID not found. Please check your ID or contact support.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen pt-28 pb-12 px-4"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Ministry</span> Results 2017
            </h1>
            <p className="text-muted-foreground">
              Enter your student ID to view your exam results
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-8 mb-6"
          >
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter your Student ID (e.g., 219353)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className={`input-glass pl-12 ${error ? 'border-destructive focus:ring-destructive/50' : ''}`}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm mb-4"
              >
                {error}
              </motion.p>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="btn-gradient flex-1"
              >
                <Search className="w-5 h-5 inline mr-2" />
                Search Result
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGallery(true)}
                className="btn-ghost"
              >
                <ImageIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowHelp(true)}
              className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Can't find your result?
            </motion.button>
          </motion.div>

          {/* Sample IDs */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">Try these sample IDs:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {studentIds.slice(0, 4).map((id) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStudentId(id)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-mono transition-colors"
                >
                  {id}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && resultImages[studentId] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResult(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowResult(false)}
                className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>

              <div className="glass-card p-4 overflow-hidden">
                <img
                  src={resultImages[studentId]}
                  alt="Ministry Result"
                  className="w-full rounded-xl"
                />
                <div className="mt-4 flex gap-3">
                  <motion.a
                    href={resultImages[studentId]}
                    download
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-gradient flex-1 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Result
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setGalleryIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setGalleryIndex((i) => (i + 1) % galleryImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            <motion.div
              key={galleryIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-4xl w-full"
            >
              <img
                src={galleryImages[galleryIndex]}
                alt={`Result ${galleryIndex + 1}`}
                className="w-full rounded-xl"
              />
              <div className="text-center mt-4 text-muted-foreground">
                {galleryIndex + 1} / {galleryImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full text-center"
            >
              <HelpCircle className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Help & Support</h3>
              <p className="text-muted-foreground mb-6">
                If you can't find your result, please contact us for assistance.
              </p>
              <div className="flex gap-3">
                <motion.a
                  href="https://t.me/NOPEOPLECANGUESSME"
                  target="_blank"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gradient flex-1"
                >
                  Contact Support
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowHelp(false)}
                  className="btn-ghost"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResultsPage;
