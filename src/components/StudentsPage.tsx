import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Download, Filter, Send, Instagram } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  englishName: string;
  age: number;
  gender: 'Male' | 'Female';
  section: string;
  telegram?: string;
  instagram?: string;
  imageUrl: string;
  downloadUrl: string;
}

const StudentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Sample student data (in real app, this would come from API)
  const students: Student[] = [
    { id: 1, name: 'አበበ ከበደ', englishName: 'Abebe Kebede', age: 15, gender: 'Male', section: '9A', telegram: 'https://t.me/example1', instagram: 'https://instagram.com/example1', imageUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg', downloadUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg' },
    { id: 2, name: 'ሰላም ተስፋዬ', englishName: 'Selam Tesfaye', age: 14, gender: 'Female', section: '9A', telegram: 'https://t.me/example2', instagram: 'https://instagram.com/example2', imageUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg', downloadUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg' },
    { id: 3, name: 'ዳዊት መኮንን', englishName: 'Dawit Mekonnen', age: 15, gender: 'Male', section: '9B', telegram: 'https://t.me/example3', instagram: 'https://instagram.com/example3', imageUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg', downloadUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg' },
    { id: 4, name: 'ሄለን ገብረ', englishName: 'Helen Gebre', age: 14, gender: 'Female', section: '9B', telegram: 'https://t.me/example4', instagram: 'https://instagram.com/example4', imageUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg', downloadUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg' },
    { id: 5, name: 'ሁበይብ ዘይኑ አባተ', englishName: 'Hubeyb Zeynu Abate', age: 15, gender: 'Male', section: '9B', telegram: 'https://t.me/HUBPROMAN', instagram: 'https://www.instagram.com/hubproman', imageUrl: 'https://i.postimg.cc/PJmN2qcr/photo-2025-06-16-07-25-19.jpg', downloadUrl: 'https://i.postimg.cc/dsfdQkjd/photo-2025-06-16-07-25-19.jpg?dl=1' },
    { id: 6, name: 'ማርያም በላቸው', englishName: 'Maryam Belachew', age: 14, gender: 'Female', section: '9C', telegram: 'https://t.me/example6', instagram: 'https://instagram.com/example6', imageUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg', downloadUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg' },
    { id: 7, name: 'ሳሙኤል ታደሰ', englishName: 'Samuel Tadese', age: 15, gender: 'Male', section: '9D', telegram: 'https://t.me/example7', instagram: 'https://instagram.com/example7', imageUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg', downloadUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg' },
    { id: 8, name: 'ብርቱካን ወርቁ', englishName: 'Birtukan Worku', age: 14, gender: 'Female', section: '9D', telegram: 'https://t.me/example8', instagram: 'https://instagram.com/example8', imageUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg', downloadUrl: 'https://i.postimg.cc/sfKMzbMn/photo-2025-06-12-19-39-13.jpg' },
  ];

  // Download function for student profile
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
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.englishName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = genderFilter === 'all' || student.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [searchQuery, genderFilter, students]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
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
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Student</span> Directory
            </h1>
            <p className="text-muted-foreground">
              Explore student profiles from Grade 9
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-4 mb-8 flex flex-wrap gap-4 items-center justify-center"
          >
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name (Amharic or English)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass pl-12"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGenderFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  genderFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGenderFilter('Male')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  genderFilter === 'Male'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Male
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGenderFilter('Female')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  genderFilter === 'Female'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Female
              </motion.button>
            </div>
          </motion.div>

          {/* Student Grid */}
          <motion.div
            variants={containerVariants}
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                onClick={() => setSelectedStudent(student)}
                className="glass-card-hover p-4 cursor-pointer group"
              >
                <div className="relative mb-4 overflow-hidden rounded-xl">
                  <img
                    src={student.imageUrl}
                    alt={student.englishName}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${
                    student.gender === 'Male' ? 'bg-blue-500/80' : 'bg-pink-500/80'
                  }`}>
                    {student.gender}
                  </div>
                </div>
                <h3 className="font-bold text-lg truncate">{student.name}</h3>
                <p className="text-muted-foreground text-sm truncate">{student.englishName}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>Section: {student.section}</span>
                  <span>Age: {student.age}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No students found matching your criteria</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStudent(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full relative"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={selectedStudent.imageUrl}
                    alt={selectedStudent.englishName}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-primary/30"
                  />
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                    selectedStudent.gender === 'Male' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}>
                    {selectedStudent.gender}
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-1">{selectedStudent.name}</h2>
                <p className="text-primary font-medium mb-4">{selectedStudent.englishName}</p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="glass-card p-3">
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-bold">{selectedStudent.age}</p>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-xs text-muted-foreground">Section</p>
                    <p className="font-bold">{selectedStudent.section}</p>
                  </div>
                  <div className="glass-card p-3">
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="font-bold">#{selectedStudent.id}</p>
                  </div>
                </div>

                {/* Social Links */}
                {(selectedStudent.telegram || selectedStudent.instagram) && (
                  <div className="flex gap-3 justify-center mb-4">
                    {selectedStudent.telegram && (
                      <motion.a
                        href={selectedStudent.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/30 transition-colors"
                        title="Telegram"
                      >
                        <Send className="w-5 h-5 text-[#0088cc]" />
                      </motion.a>
                    )}
                    {selectedStudent.instagram && (
                      <motion.a
                        href={selectedStudent.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-[#f09433]/20 via-[#e6683c]/20 to-[#bc1888]/20 hover:from-[#f09433]/30 hover:via-[#e6683c]/30 hover:to-[#bc1888]/30 border border-[#e6683c]/30 transition-colors"
                        title="Instagram"
                      >
                        <Instagram className="w-5 h-5 text-[#e6683c]" />
                      </motion.a>
                    )}
                  </div>
                )}

                <motion.button
                  onClick={() => handleDownload(selectedStudent.imageUrl, `${selectedStudent.englishName.replace(/\s+/g, '_')}_profile.jpg`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-gradient w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Photo
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentsPage;