import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, X, ArrowLeft } from 'lucide-react';
import PdfViewer from './PdfViewer';
import TextbookContentFinder from './TextbookContentFinder';

const TextbooksPage = () => {
  const [openBook, setOpenBook] = useState<{ subject: string; url: string } | null>(null);
  const [targetPage, setTargetPage] = useState(1);

  const textbooks = [
    { subject: 'Amharic', localPdf: '/textbooks/amharic_grade_9.pdf' },
    { subject: 'English', localPdf: '/textbooks/english_grade_9.pdf' },
    { subject: 'Mathematics', localPdf: '/textbooks/mathematics_grade_9.pdf' },
    { subject: 'Physics', localPdf: '/textbooks/physics_grade_9.pdf' },
    { subject: 'Chemistry', localPdf: '/textbooks/chemistry_grade_9.pdf' },
    { subject: 'Biology', localPdf: '/textbooks/biology_grade_9.pdf' },
    { subject: 'Citizenship', localPdf: '/textbooks/citizenship_grade_9.pdf' },
    { subject: 'ICT', localPdf: '/textbooks/ict_grade_9.pdf' },
    { subject: 'Geography', localPdf: '/textbooks/geography_grade_9.pdf' },
    { subject: 'History', localPdf: '/textbooks/history_grade_9.pdf' },
    { subject: 'Economics', localPdf: '/textbooks/economics_grade_9.pdf' },
    { subject: 'HPE', localPdf: '/textbooks/hpe_grade_9.pdf' },
  ];

  const colors = [
    'bg-cyan-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-indigo-500', 'bg-lime-500', 'bg-sky-500',
    'bg-fuchsia-500', 'bg-yellow-500', 'bg-teal-500', 'bg-red-500',
  ];

  const handleGoToPage = (page: number) => {
    setTargetPage(page);
    // Force remount the PdfViewer by briefly closing and reopening
    if (openBook) {
      const book = openBook;
      setOpenBook(null);
      setTimeout(() => {
        setOpenBook(book);
        setTargetPage(page);
      }, 50);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-28 pb-16 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              <span className="gradient-text">Grade 9</span> Textbooks
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Select a subject to view or download the textbook · Available offline
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {textbooks.map((book, index) => (
              <motion.div
                key={book.subject}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                className="glass-card-hover p-5 flex flex-col"
              >
                <div className={`w-14 h-14 rounded-2xl ${colors[index]} flex items-center justify-center mb-4 shadow-lg`}>
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{book.subject}</h3>
                <p className="text-xs text-muted-foreground mb-4">Grade 9 Textbook</p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => { setTargetPage(1); setOpenBook({ subject: book.subject, url: book.localPdf }); }}
                    className="btn-gradient flex-1 text-sm py-2 px-3 flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    Open
                  </button>
                  <a
                    href={book.localPdf}
                    download={`${book.subject}_Grade9.pdf`}
                    className="btn-ghost px-3 py-2 flex items-center justify-center"
                    aria-label={`Download ${book.subject}`}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen PDF Reader */}
      <AnimatePresence>
        {openBook && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
          >
            {/* Reader top bar */}
            <div className="h-14 flex items-center px-3 bg-card border-b border-border shrink-0 gap-2">
              <button
                onClick={() => setOpenBook(null)}
                className="p-2 rounded-lg active:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold truncate">{openBook.subject}</h2>
                <p className="text-[10px] text-muted-foreground">Grade 9</p>
              </div>
              <button
                onClick={() => setOpenBook(null)}
                className="p-2 rounded-lg bg-destructive/10 active:bg-destructive/20 transition-colors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <PdfViewer url={openBook.url} initialPage={targetPage} subject={openBook.subject} />
            </div>

            {/* Content Finder FAB */}
            <TextbookContentFinder
              subject={openBook.subject}
              onGoToPage={handleGoToPage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TextbooksPage;
