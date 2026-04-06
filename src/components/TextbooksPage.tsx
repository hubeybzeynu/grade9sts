import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, ExternalLink, X } from 'lucide-react';
import TextbookContentFinder from './TextbookContentFinder';

const TextbooksPage = () => {
  const [openBook, setOpenBook] = useState<{ url: string; title: string; isLocal?: boolean } | null>(null);

  const textbooks = [
    { subject: 'Amharic', previewId: '12O7G_mzRs1sdQVXXpbrvi-smWTweU9gP', localPdf: '/textbooks/amharic_grade_9.pdf' },
    { subject: 'English', previewId: '15CEwoZFm6jYipL5sCJxDrWCQ8pPk0feQ' },
    { subject: 'Mathematics', previewId: '1n3laBT5EZwV3HeXrP7CTg-5o5NxORBQT', localPdf: '/textbooks/mathematics_grade_9.pdf' },
    { subject: 'Physics', previewId: '1nup-odQkaCPLQwenfU8XMbnvCnGq9WZk' },
    { subject: 'Chemistry', previewId: '1dXo2tcKMotSH7msnSjqimPz0GWsr-VH_', localPdf: '/textbooks/chemistry_grade_9.pdf' },
    { subject: 'Biology', previewId: '1z8T2F1seLWEUlL9gVH-VnzFPtwq6B8o7', localPdf: '/textbooks/biology_grade_9.pdf' },
    { subject: 'Citizenship', previewId: '1WqdnnoIapJkHyv-ZxM_OYZNK2cWz6N3K' },
    { subject: 'ICT', previewId: '1lLfW_hoRu84kgY_m_SljLPJ_V5hDCRkM' },
    { subject: 'Geography', previewId: '1uBjCz1yesrWG1PTfMk2T-__4KhRUpylH' },
    { subject: 'History', previewId: '1qtrNYeSU_0ZURVx4Fb4GMda2ENgoVPAY' },
    { subject: 'Economics', previewId: '1A_lpLOxw1BQMiAnTatBvAHLeYlOtLoU8', localPdf: '/textbooks/economics_grade_9.pdf' },
    { subject: 'HPE', previewId: '1fUg9sJlJyuWQxiBpT4oGwh9A8v0irdsS', localPdf: '/textbooks/hpe_grade_9.pdf' },
  ];

  const colors = [
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-blue-600',
    'from-lime-500 to-green-600',
    'from-sky-500 to-cyan-600',
    'from-fuchsia-500 to-pink-600',
    'from-yellow-500 to-amber-600',
    'from-teal-500 to-emerald-600',
    'from-red-500 to-rose-600',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const openLocalPdf = (book: typeof textbooks[0]) => {
    if (book.localPdf) {
      setOpenBook({ url: book.localPdf, title: book.subject, isLocal: true });
    } else {
      setOpenBook({
        url: `https://drive.google.com/file/d/${book.previewId}/preview`,
        title: book.subject,
      });
    }
  };

  const getDownloadUrl = (book: typeof textbooks[0]) => {
    if (book.localPdf) return book.localPdf;
    return `https://drive.google.com/uc?export=download&id=${book.previewId}`;
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen pt-28 pb-12 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Grade 9</span> Textbooks
            </h1>
            <p className="text-muted-foreground">
              Select a subject to view or download the textbook. Use the AI tutor to ask questions!
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {textbooks.map((book, index) => (
              <motion.div
                key={book.subject}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{book.subject}</h3>
                <p className="text-muted-foreground text-sm mb-1">
                  Grade 9 {book.subject} Textbook
                </p>
                {book.localPdf && (
                  <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-3">
                    📖 PDF Available + AI Tutor
                  </span>
                )}
                {!book.localPdf && <div className="mb-3" />}

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openLocalPdf(book)}
                    className="btn-gradient flex-1 flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </motion.button>
                  
                  <motion.a
                    href={getDownloadUrl(book)}
                    download={book.localPdf ? `${book.subject}_Grade9.pdf` : undefined}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-ghost flex items-center justify-center gap-2 text-sm py-2 px-4"
                  >
                    <Download className="w-4 h-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Fullscreen Reader Modal */}
      <AnimatePresence>
        {openBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="h-full flex flex-col">
              <div className="glass-card rounded-none px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {openBook.title} - Grade 9
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpenBook(null)}
                  className="p-2 rounded-xl bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex-1 p-4">
                {openBook.isLocal ? (
                  <iframe
                    src={openBook.url}
                    className="w-full h-full rounded-xl border-0"
                    style={{ boxShadow: '0 0 30px rgba(0,0,0,0.3)' }}
                    title={`${openBook.title} PDF`}
                  />
                ) : (
                  <iframe
                    src={openBook.url}
                    className="w-full h-full rounded-xl border-0"
                    style={{ boxShadow: '0 0 30px rgba(0,0,0,0.3)' }}
                    allow="autoplay"
                  />
                )}
              </div>
            </div>

            {/* AI Chat overlay when reading */}
            <TextbookContentFinder subject={openBook.title} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TextbooksPage;
