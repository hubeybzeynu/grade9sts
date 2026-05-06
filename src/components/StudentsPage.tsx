import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User } from 'lucide-react';
import type { Student } from '@/data/students';
import StudentDetailModal from './StudentDetailModal';
import { supabase } from '@/integrations/supabase/client';

interface StudentsPageProps {
  onNavigate?: (page: string) => void;
}

const SECTIONS = ['all', '9A', '9B', '9C'] as const;

interface DbStudent {
  id: number;
  name: string;
  english_name: string;
  age: number | null;
  gender: string | null;
  section: string | null;
  image_url: string | null;
  download_url: string | null;
  telegram: string | null;
  instagram: string | null;
}

const mapRow = (r: DbStudent): Student => ({
  id: r.id,
  name: r.name,
  englishName: r.english_name,
  age: r.age ?? 0,
  gender: r.gender ?? '',
  section: r.section ?? '',
  imageUrl: r.image_url ?? '',
  downloadUrl: r.download_url ?? '',
  telegram: r.telegram,
  instagram: r.instagram,
});

const StudentsPage = ({ onNavigate }: StudentsPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id,name,english_name,age,gender,section,image_url,download_url,telegram,instagram')
        .order('id', { ascending: true });
      if (!active) return;
      if (error) { console.error('students fetch', error); setLoading(false); return; }
      setAllStudents(((data || []) as DbStudent[]).map(mapRow));
      setLoading(false);
    };
    fetchAll();
    const channel = supabase
      .channel('students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, fetchAll)
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  const filteredStudents = useMemo(() => {
    return allStudents
      .filter((student) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          student.name.toLowerCase().includes(q) ||
          student.englishName.toLowerCase().includes(q);
        const matchesGender = genderFilter === 'all' || student.gender === genderFilter;
        const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
        return matchesSearch && matchesGender && matchesSection;
      })
      .sort((a, b) => a.englishName.localeCompare(b.englishName));
  }, [allStudents, searchQuery, genderFilter, sectionFilter]);

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
              <span className="gradient-text">Student</span> Directory
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Explore Grade 9 student profiles · Total{' '}
              <span className="text-foreground font-semibold">{filteredStudents.length}</span>
              <span className="mx-2">·</span>
              <span className="text-blue-400">♂ {filteredStudents.filter(s => s.gender === 'Male').length}</span>
              <span className="mx-1.5">·</span>
              <span className="text-pink-400">♀ {filteredStudents.filter(s => s.gender === 'Female').length}</span>
            </p>
          </div>

          {/* Search + filters glass card */}
          <div className="glass-card p-4 sm:p-5 mb-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name (Amharic or English)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass pl-12"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'Male', 'Female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    genderFilter === g
                      ? g === 'Male' ? 'bg-blue-500 text-white shadow-md'
                      : g === 'Female' ? 'bg-pink-500 text-white shadow-md'
                      : 'btn-gradient'
                      : 'btn-ghost'
                  }`}
                >
                  {g === 'all' ? 'All' : g}
                </button>
              ))}
              <div className="w-px bg-border mx-1" />
              {SECTIONS.map(sec => (
                <button
                  key={sec}
                  onClick={() => setSectionFilter(sec)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    sectionFilter === sec
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'btn-ghost'
                  }`}
                >
                  {sec === 'all' ? 'All' : sec}
                </button>
              ))}
            </div>
          </div>

          {/* Student grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredStudents.map((student, i) => (
              <motion.button
                key={student.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedStudent(student)}
                className="glass-card-hover p-4 text-center"
              >
                <img
                  src={student.imageUrl}
                  alt={student.englishName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto mb-3 border-2 border-primary/30"
                />
                <h3 className="text-sm font-semibold text-foreground truncate">{student.englishName}</h3>
                <p className="text-[11px] text-muted-foreground truncate mb-2">{student.name}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    student.gender === 'Male' ? 'bg-blue-500/15 text-blue-400' : 'bg-pink-500/15 text-pink-400'
                  }`}>
                    {student.gender}
                  </span>
                  {student.section && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      {student.section}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-16">
              <User className="w-14 h-14 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No students found matching your criteria</p>
            </div>
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
