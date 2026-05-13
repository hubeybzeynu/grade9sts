import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Award,
  ClipboardList,
  FileCheck,
  FileText,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  ClipboardEdit,
  FilePen,
  ExternalLink,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const features = [
  { key: 'textbooks', label: 'Textbooks', desc: 'All Grade 9 digital textbooks', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
  { key: 'students', label: 'Students', desc: 'Browse the student directory', icon: Users, gradient: 'from-violet-500 to-fuchsia-500' },
  { key: 'mid', label: 'Mid Exam', desc: 'Mid-term examination results', icon: ClipboardList, gradient: 'from-indigo-500 to-blue-500' },
  { key: 'final', label: 'Final Exam', desc: 'Final examination results', icon: FileCheck, gradient: 'from-rose-500 to-pink-500' },
  { key: 'report', label: 'Report Card', desc: 'Full academic report card', icon: FileText, gradient: 'from-teal-500 to-cyan-500' },
  { key: 'results', label: 'Ministry Results', desc: 'Official ministry exam scores', icon: Award, gradient: 'from-amber-500 to-orange-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-28 pb-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="hero-icon-container animate-float w-24 h-24 rounded-full mx-auto mb-6 p-[3px]"
               style={{ background: 'var(--gradient-primary)' }}>
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">Grade 9</span> Student Portal
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            St. Theresa School — Your gateway to academic resources, profiles, and exam results.
          </p>
        </motion.div>

        {/* Welcome card */}
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 mb-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
               style={{ background: 'var(--gradient-primary)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome, Students!</h2>
            </div>
            <p className="text-muted-foreground mb-5 text-sm sm:text-base">
              Access your textbooks, view classmates' profiles, and check your ministry exam results — all in one place.
            </p>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Academic Progress</span>
                <span className="text-xs font-semibold text-primary">75%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'var(--gradient-primary)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* About / Presentation */}
        <motion.section
          variants={itemVariants}
          aria-labelledby="about-portal"
          className="glass-card p-6 sm:p-8 mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-accent/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <h2 id="about-portal" className="text-xl sm:text-2xl font-bold">
              About the Portal
            </h2>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
            The <span className="text-foreground font-semibold">Grade 9 Student Portal</span> of
            St. Theresa School is the official digital hub for the 2025 academic year. It unifies
            the complete Grade 9 experience — digital textbooks, the verified student directory,
            mid-term and final examination results, full academic report cards, and the
            Ministry of Education national examination scores — into a single, secure, mobile-first
            platform built for students, parents, and staff.
          </p>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            The portal is paired with two dedicated administrative platforms operated by Grade 9
            teachers. Together they form a closed academic loop: teachers record results, the
            portal publishes them to verified students.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <a
              href="https://teacherssts.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover p-5 block"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <ClipboardEdit className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold">Mid Result Manager</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                A teachers-only platform for entering, reviewing, and publishing mid-term
                examination scores per subject and per section. Once a teacher submits the
                results, they appear instantly in the Mid Exam section of this portal for
                verified students.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                teacherssts.lovable.app <ExternalLink className="w-3 h-3" />
              </span>
            </a>

            <a
              href="https://reportcardsts.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover p-5 block"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <FilePen className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold">Report Card Manager</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                The official report card administration system used by Grade 9 homeroom
                teachers to compose quarterly grades, compute averages, assign section ranks,
                and finalize promotion decisions. Approved report cards are synced to this
                portal under the Report Card section.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                reportcardsts.lovable.app <ExternalLink className="w-3 h-3" />
              </span>
            </a>
          </div>
        </motion.section>

        {/* Feature grid */}
        <motion.div variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.key}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(feature.key)}
                className="glass-card-hover p-6 text-left group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{feature.label}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </motion.button>
            );
          })}
        </motion.div>

        <footer className="mt-12 text-center text-muted-foreground text-sm">
          <p>ቅዱስ ቴሬዛ ት/ቤት — ጥራት ያለው ለሁሉም</p>
          <p className="mt-1 text-xs">© 2025 St. Theresa School — Grade 9</p>
        </footer>
      </div>
    </motion.div>
  );
};

export default HomePage;
