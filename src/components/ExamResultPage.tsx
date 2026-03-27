import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Award, X, Download, ChevronLeft, ChevronRight, BookOpen, FileCheck, Filter } from 'lucide-react';
import { externalSupabase } from '@/integrations/supabase/externalClient';

interface ExamResult {
  student_id: string;
  result_image_url: string;
  answer_image_url: string | null;
  student_name: string | null;
  subject: string | null;
  grade_group: string | null;
  student_password: string | null;
}

interface ExamResultPageProps {
  type: 'mid' | 'final';
}

const ExamResultPage = ({ type }: ExamResultPageProps) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingResult, setPendingResult] = useState<ExamResult | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExamResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [gradeGroups, setGradeGroups] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGradeGroup, setSelectedGradeGroup] = useState<string>('all');

  const title = type === 'mid' ? 'Mid Exam' : 'Final Exam';
  const gradient = type === 'mid' ? 'from-violet-500 to-purple-600' : 'from-rose-500 to-red-600';
  const Icon = type === 'mid' ? BookOpen : FileCheck;
  const tableName = type === 'mid' ? 'mid_results' : 'final_results';

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      const { data, error } = await externalSupabase
        .from(tableName)
        .select('student_id, result_image_url, answer_image_url, student_name, subject, grade_group, student_password')
        .order('student_id');
      
      if (data) {
        setResults(data);
        setFilteredResults(data);
        // Extract unique subjects and grade groups
        const uniqueSubjects = [...new Set(data.map(r => r.subject).filter(Boolean))] as string[];
        const uniqueGrades = [...new Set(data.map(r => r.grade_group).filter(Boolean))] as string[];
        setSubjects(uniqueSubjects);
        setGradeGroups(uniqueGrades);
      }
      setLoading(false);
    };
    fetchResults();
  }, [tableName]);

  // Filter results when subject or grade_group changes
  useEffect(() => {
    let filtered = results;
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(r => r.subject === selectedSubject);
    }
    if (selectedGradeGroup !== 'all') {
      filtered = filtered.filter(r => r.grade_group === selectedGradeGroup);
    }
    setFilteredResults(filtered);
  }, [selectedSubject, selectedGradeGroup, results]);

  const studentIds = filteredResults.map(r => r.student_id);

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
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleSearch = () => {
    setError('');
    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }
    const found = filteredResults.find(r => r.student_id === studentId.trim());
    if (found) {
      if (found.student_password) {
        setPendingResult(found);
        setShowPasswordPrompt(true);
        setPassword('');
      } else {
        setCurrentResult(found);
        setShowResult(true);
        setShowAnswer(false);
      }
    } else {
      setError('Student ID not found. Try adjusting filters or check your ID.');
    }
  };

  const handlePasswordSubmit = () => {
    if (!pendingResult) return;
    if (password === pendingResult.student_password) {
      setCurrentResult(pendingResult);
      setShowResult(true);
      setShowAnswer(false);
      setShowPasswordPrompt(false);
      setPendingResult(null);
      setPassword('');
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const navigateResult = (direction: 'prev' | 'next') => {
    if (!currentResult) return;
    const idx = filteredResults.findIndex(r => r.student_id === currentResult.student_id && r.subject === currentResult.subject);
    let newIdx = direction === 'prev' ? idx - 1 : idx + 1;
    if (newIdx < 0) newIdx = filteredResults.length - 1;
    if (newIdx >= filteredResults.length) newIdx = 0;
    setCurrentResult(filteredResults[newIdx]);
    setStudentId(filteredResults[newIdx].student_id);
    setShowAnswer(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">{title}</span> Results
            </h1>
            <p className="text-muted-foreground">
              Enter your student ID to view your {title.toLowerCase()} results
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 mb-6">
            {loading ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-muted-foreground">Loading results...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <Icon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No {title.toLowerCase()} results available yet.</p>
                <p className="text-muted-foreground text-sm mt-2">Results will appear here once they are uploaded.</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                {(subjects.length > 0 || gradeGroups.length > 0) && (
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Filter className="w-4 h-4" />
                      <span>Filter Results</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {subjects.length > 0 && (
                        <div className="flex-1 min-w-[140px]">
                          <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                          <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          >
                            <option value="all">All Subjects</option>
                            {subjects.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {gradeGroups.length > 0 && (
                        <div className="flex-1 min-w-[140px]">
                          <label className="text-xs text-muted-foreground mb-1 block">Grade Group</label>
                          <select
                            value={selectedGradeGroup}
                            onChange={(e) => setSelectedGradeGroup(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          >
                            <option value="all">All Grades</option>
                            {gradeGroups.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={`Enter your Student ID (e.g., ${studentIds[0] || '219335'})`}
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSearch}
                  className="btn-gradient w-full flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Search Result
                </motion.button>

                {studentIds.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3 text-center">
                      {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                      {selectedSubject !== 'all' && ` for ${selectedSubject}`}
                      {selectedGradeGroup !== 'all' && ` (Grade ${selectedGradeGroup})`}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {studentIds.slice(0, 6).map((id) => (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setStudentId(id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono transition-colors"
                        >
                          {id}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && currentResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowResult(false); setShowAnswer(false); }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); navigateResult('prev'); }}
              className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); navigateResult('next'); }}
              className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setShowResult(false); setShowAnswer(false); }}
                className="absolute -top-12 right-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>

              <div className="glass-card p-4 overflow-hidden">
                <div className="text-center mb-2 space-y-1">
                  <div>
                    <span className="text-sm text-muted-foreground font-mono">ID: {currentResult.student_id}</span>
                    {currentResult.student_name && (
                      <>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{currentResult.student_name}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {currentResult.subject && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        {currentResult.subject}
                      </span>
                    )}
                    {currentResult.grade_group && (
                      <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium">
                        Grade {currentResult.grade_group}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {filteredResults.findIndex(r => r.student_id === currentResult.student_id && r.subject === currentResult.subject) + 1} of {filteredResults.length}
                    </span>
                  </div>
                </div>

                <img
                  src={showAnswer && currentResult.answer_image_url ? currentResult.answer_image_url : currentResult.result_image_url}
                  alt={showAnswer ? 'Answer Key' : `${title} Result`}
                  className="w-full rounded-xl"
                />

                <div className="mt-4 flex gap-3 flex-wrap">
                  <motion.button
                    onClick={() => handleDownload(currentResult.result_image_url, `${type}_result_${currentResult.student_id}_${currentResult.subject || ''}.jpg`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-gradient flex-1 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </motion.button>

                  {currentResult.answer_image_url && (
                    <motion.button
                      onClick={() => setShowAnswer(!showAnswer)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        showAnswer
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                      {showAnswer ? 'Show Result' : 'Show Answer'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExamResultPage;
