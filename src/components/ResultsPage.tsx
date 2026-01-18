import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Award, ImageIcon, X, HelpCircle, Download, User, ChevronLeft, ChevronRight } from 'lucide-react';

// Name to ID mapping for "Forgot ID" feature
const nameToIdMap: Record<string, string> = {
  "ሀሴት ደረጀ": "219335",
  "ሀናን አብዱልማሊክ ጄይላ": "219336",
  "ሀናን ጊኢደር ቃሲም": "219337",
  "ሀዊ ጀማል ሙሳ": "219338",
  "ሁበይብ ዘይኑ አባተ": "219339",
  "ሄመን ይትባረክ ታዬ": "219340",
  "ሄኖን ጌታቸው ካሳ": "219341",
  "ሊዲያ ሽፈራው ሀይሌ": "219342",
  "ሊዲያ ቴዎድሮስ ከበደ": "219343",
  "ልዑል ወንድፍራው ፍቃዱ": "219344",
  "መሐመድ ኢድሪስ አደን": "219345",
  "መሀመድ ዲምራኤል ሀምዳኤል": "219346",
  "ሙሀሙድ በሺር ሻፊ": "219347",
  "መሊካ ቃሲም ርጋ": "219348",
  "መና ታደሰ አርጋው": "219349",
  "መፅሔት አዲስ ፀጋዬ": "219350",
  "ሙስተቂም አብዱላሂ አደም": "219351",
  "ሙስተቂማ አብዱሰላም አህመድ": "219352",
  "ማህሌት አንድነት አየለ": "219353",
  "ማረፊያ ተስፋዬ በላቸው": "219354",
  "ማክቤል አብዱ አብዱረኡፍ": "219355",
  "ሜሮን ገዛኸኝ ጌታቸው": "219356",
  "ሠላም አንሙት ጋሹ": "219357",
  "ሰልማ ዩሱፍ መሀመድ": "219358",
  "ሲሀን ዚያድ አብዱማሊክ": "219359",
  "ሳሊም ዩሱፍ መሃመድ": "219360",
  "ሳሌም የኋላሸት በዳሶ": "219361",
  "ሳሙኤል የሻነው አለሙ": "219362",
  "ሳሮን መክብብ ብርሃኑ": "219363",
  "ሳሮን በሀይሉ ደርሶ": "219364",
  "ሶሊያና ደረጀ ከፍያለው": "219365",
  "ሶልያና ናትናኤል አሰፋ": "219366",
  "ሶልያና ከተማ ታምሩ": "219367",
  "ሩሽዳ ሳዲቅ ኡስማኤል": "219368",
  "ራኬብ ሳምሶን ደምሴ": "219369",
  "ራኬብ ዮናስ ደጉ": "219370",
  "ራኬብ ጌታቸው መታፈሪያ": "219371",
  "ቅዱስ አለኸኝ ስለሺ": "219372",
  "ቅዱስ ወንደሰን ጋሻው": "219373",
  "በአምላክ ውብዬ ተሰማ": "219374",
  "በእምነት ካሳሁን አበበ": "219375",
  "ቢላል ሙስጠፋ ጀማል": "219376",
  "ባህራን አበራ ለማ": "219377",
  "ባስልኤል አወቀ ለገሰ": "219378",
  "ቤተሳይዳ ሲሣይ ጉግሳ": "219379",
  "ቤቴልሔም ሽመልስ ግዛው": "219380",
  "ቤቴልሔም ቴዎድሮስ": "219381",
  "ቤኒያስ ተስፋዬ ተፈራ": "219382",
  "ብሌን ተፈሪ ሙሉጌታ": "219383",
  "ብሌን እንግዳ አለም": "219384",
  "ብስራት ሐብታሙ ታደሰ": "219385",
  "ብሩክነው ማርሸት ተስፋዬ": "219386",
  "ትንቢት በለጠ ወርቁ": "219387",
  "ቶማስ ስንታየሁ በቀለ": "219388",
  "ነጃ ኤርሚያስ ይሳቅ": "219389",
  "ነፃነት ግዛቸው አዘነ": "219390",
  "ኑራን አሪፍ ዘይዳን": "219391",
  "ናሂላ አዳነ ቢረሳ": "219392",
  "ናሆም አንተነህ ቸርነት": "219393",
  "ናታን ሰለሞን ማሞ": "219394",
  "ናታን አለማየሁ ሞላ": "219395",
  "ናትናኤል ባይሳ አለሙ": "219396",
  "ናኦድ ሠለሞን ወርቁ": "219397",
  "ናዮሚ ወጋየው ንጉሴ": "219398",
  "ንፍታሌም ዘመድኩን አጥናፉ": "219399",
  "አላዛር ዘውዱ ለማ": "219400",
  "አሚር ሙራድ አብዶ": "219401",
  "አማኑኤል ሰሙንጉስ ወልደስላሴ": "219402",
  "አማኑኤል ገብረህይወት ወስላሴ": "219403",
  "አማናዊት ብርሀነ በቀለ": "219404",
  "አማናዊት ቴዎድሮስ አምዴ": "219405",
  "አስቤል ቢኒያም አየሁ": "219406",
  "አቡበከር ፀጋዬ ዋሲሁን": "219407",
  "አብዱላሂ ሀሰን አብዱላሂ": "219408",
  "አዳም ዘመዴ የሺጥላ": "219409",
  "አዶኒያስ ወንዱ ግርማ": "219410",
  "አፍናን አፈንዲ ዩሱፍ": "219411",
  "አፎሚያ ሚካኤል ወርቁ": "219412",
  "አፎሚያ ሰላም ክበበው": "219413",
  "ኢምራን አብዱልአዚዝ አሊዩ": "219414",
  "ኢክማን አብዶ አሊ": "219415",
  "ኢዛና ደጀኔ ካሳ": "219416",
  "ኢዮሲያስ አለሙ ለቤቶ": "219417",
  "ኤሊያና መሳይ ተክሉ": "219418",
  "ኤልቤተል ተፈሪ መኮንን": "219419",
  "ኤልቤት ዳንኤል ተሾመ": "219420",
  "ኤልያና ሳምሶን ታዬ": "219421",
  "ኤልዳና መኳንንት ዘውዴ": "219422",
  "ኤደን ማንያዘዋል ከበደ": "219423",
  "ኤዶት ሽብሩ ተሰማ": "219424",
  "እስራኤል ሀይሉ ሁንዴ": "219425",
  "እዩኤል መላኩ ተካ": "219426",
  "ኦርዮን የትሻወርቅ ደጀኔ": "219427",
  "ካሌብ እንዳለ ደበላ": "219428",
  "ኬብሮን ስዩም ውብሸት": "219429",
  "ኬብሮን ኢሳያስ ሀይሉ": "219430",
  "ዘፀአት ፍሬው አድማሱ": "219431",
  "ዚክራ ባህሩዲን ዩሱፍ": "219432",
  "ዝማሬ ዳዊት ሞገስ": "219433",
  "የአብስራ ታሪኩ ፋንታሁን": "219434",
  "የእውነት ምስክር አበበ": "219435",
  "ዩስራ ሁሴን ሰማን": "219436",
  "ያቤፅ አክሊሉ ጥበበ": "219437",
  "ያብፀጋ ሔኖክ ነጋ": "219438",
  "ያፌት ዘመዴ ከበደ": "219439",
  "ይዲድያ መኮንን ደምሴ": "219440",
  "ዮሀና ሰብስቤ ዘሪሁን": "219441",
  "ዮሴፍ መሀሪ ይማም": "219442",
  "ዳግም ረታ ሽመልስ": "219443",
  "ገሊላ መስፍን ከበደ": "219444",
  "ገሊላ ተስፋዬ አበበ": "219445",
  "ጰንየኤል ወንደሰን ጀንበሬ": "219446",
  "ፂዮን ይልሙ ደሳለኝ": "219447",
  "ፅኑቃል ደመቀ ወጋየሁ": "219448",
  "ፊክራ ሀምዛ ሙክታር": "219449",
  "ፌቨን ሳሙኤል ይልማ": "219450",
  "ዮሀና ሰርክአለም ሲሳይ": "219451"
};

const ResultsPage = () => {
  const [studentId, setStudentId] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showForgetId, setShowForgetId] = useState(false);
  const [forgetNameInput, setForgetNameInput] = useState('');
  const [forgetFeedback, setForgetFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [error, setError] = useState('');

  // Sample result images mapping
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

  const studentIds = Object.keys(resultImages);

  // Download function for result images
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

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

  const handleForgetSubmit = () => {
    const nameInput = forgetNameInput.trim();
    
    if (!nameInput) {
      setForgetFeedback({ message: 'Please type your name', type: 'error' });
      return;
    }

    const normalizedInput = nameInput.normalize().toLowerCase();

    // Try exact match first
    for (const storedName in nameToIdMap) {
      const normalizedStoredName = storedName.normalize().toLowerCase();
      if (normalizedStoredName === normalizedInput) {
        const foundId = nameToIdMap[storedName];
        setForgetFeedback({ message: 'Result found — opening...', type: 'success' });
        setTimeout(() => {
          setShowForgetId(false);
          setForgetNameInput('');
          setForgetFeedback(null);
          setStudentId(foundId);
          setShowResult(true);
        }, 500);
        return;
      }
    }

    // Look for partial matches
    const partialMatches: { name: string; id: string }[] = [];
    for (const storedName in nameToIdMap) {
      const normalizedStoredName = storedName.normalize().toLowerCase();
      if (normalizedStoredName.includes(normalizedInput)) {
        partialMatches.push({ name: storedName, id: nameToIdMap[storedName] });
      }
    }

    if (partialMatches.length === 1) {
      const found = partialMatches[0];
      setForgetFeedback({ message: `Did you mean "${found.name}"? Opening...`, type: 'success' });
      setTimeout(() => {
        setShowForgetId(false);
        setForgetNameInput('');
        setForgetFeedback(null);
        setStudentId(found.id);
        setShowResult(true);
      }, 2000);
      return;
    } else if (partialMatches.length > 1) {
      const suggestions = partialMatches.slice(0, 5).map(match => match.name).join(', ');
      setForgetFeedback({ 
        message: `Multiple matches found: ${suggestions}${partialMatches.length > 5 ? '...' : ''}`, 
        type: 'error' 
      });
      return;
    }

    setForgetFeedback({ 
      message: 'Not found. Make sure you typed your name correctly in Amharic.', 
      type: 'error' 
    });
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
                title="View All Results"
              >
                <ImageIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Forgot ID Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForgetId(true)}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Forgot your ID? Find by name
            </motion.button>
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
            {/* Left Arrow */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = studentIds.indexOf(studentId);
                if (currentIndex > 0) {
                  setStudentId(studentIds[currentIndex - 1]);
                } else {
                  setStudentId(studentIds[studentIds.length - 1]);
                }
              }}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Right Arrow */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = studentIds.indexOf(studentId);
                if (currentIndex < studentIds.length - 1) {
                  setStudentId(studentIds[currentIndex + 1]);
                } else {
                  setStudentId(studentIds[0]);
                }
              }}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

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
                <div className="text-center mb-2">
                  <span className="text-sm text-muted-foreground font-mono">ID: {studentId}</span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {studentIds.indexOf(studentId) + 1} of {studentIds.length}
                  </span>
                </div>
                <img
                  src={resultImages[studentId]}
                  alt="Ministry Result"
                  className="w-full rounded-xl"
                />
                <div className="mt-4 flex gap-3">
                  <motion.button
                    onClick={() => handleDownload(resultImages[studentId], `result_${studentId}.jpg`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-gradient flex-1 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Result
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal - Grid View */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold gradient-text">All Results Gallery</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowGallery(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {studentIds.map((id, index) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowGallery(false);
                      setStudentId(id);
                      setShowResult(true);
                    }}
                    className="relative cursor-pointer group rounded-xl overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all"
                  >
                    <img
                      src={resultImages[id]}
                      alt={`Result ${id}`}
                      className="w-full h-32 object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                      <span className="text-white font-mono text-sm font-semibold">{id}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGallery(false)}
                  className="btn-ghost px-8"
                >
                  Exit Gallery
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot ID Modal */}
      <AnimatePresence>
        {showForgetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowForgetId(false);
              setForgetNameInput('');
              setForgetFeedback(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold gradient-text mb-2">Forgot your ID?</h3>
                <p className="text-muted-foreground text-sm">
                  Type your name in Amharic as saved in the ministry result.
                </p>
              </div>

              <input
                type="text"
                placeholder="ስምዎን ያስገቡ (Type your name)"
                value={forgetNameInput}
                onChange={(e) => setForgetNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleForgetSubmit()}
                className="input-glass mb-4 text-center"
                autoFocus
              />

              <AnimatePresence>
                {forgetFeedback && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-sm mb-4 text-center ${
                      forgetFeedback.type === 'success' ? 'text-emerald-400' : 'text-destructive'
                    }`}
                  >
                    {forgetFeedback.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleForgetSubmit}
                  className="btn-gradient flex-1"
                >
                  Find Result
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowForgetId(false);
                    setForgetNameInput('');
                    setForgetFeedback(null);
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </motion.button>
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
