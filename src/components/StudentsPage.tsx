import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Filter } from 'lucide-react';
import { students as allStudents, Student } from '@/data/students';
import StudentDetailModal from './StudentDetailModal';

interface StudentsPageProps {
  onNavigate?: (page: string) => void;
}

const SECTIONS = ['all', '9A', '9B', '9C'] as const;

const StudentsPage = ({ onNavigate }: StudentsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return allStudents
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.englishName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGender = genderFilter === 'all' || student.gender === genderFilter;
        const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
        return matchesSearch && matchesGender && matchesSection;
      })
      .sort((a, b) => a.englishName.localeCompare(b.englishName));
  }, [searchQuery, genderFilter, sectionFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
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
            <p className="text-muted-foreground">Explore student profiles from Grade 9</p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div variants={itemVariants} className="glass-card p-4 mb-8 space-y-3">
            <div className="flex flex-wrap gap-4 items-center justify-center">
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
                    genderFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGenderFilter('Male')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    genderFilter === 'Male' ? 'bg-blue-500 text-white' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >Male</motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGenderFilter('Female')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    genderFilter === 'Female' ? 'bg-pink-500 text-white' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >Female</motion.button>
              </div>
            </div>

            {/* Section Filter */}
            <div className="flex gap-2 justify-center">
              {SECTIONS.map(sec => (
                <motion.button
                  key={sec}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSectionFilter(sec)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                    sectionFilter === sec
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {sec === 'all' ? 'All Sections' : sec}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Student Grid */}
          <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No students found matching your criteria</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentsPage;
