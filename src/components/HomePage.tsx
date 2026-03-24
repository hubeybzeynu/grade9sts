import { motion } from 'framer-motion';
import { BookOpen, Users, Award, GraduationCap, Sparkles, ClipboardList, FileCheck } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  const resources = [
    {
      id: 'textbooks',
      title: 'Textbooks',
      description: 'Access all digital textbooks',
      icon: BookOpen,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'students',
      title: 'Student Info',
      description: 'Explore student profiles',
      icon: Users,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'results',
      title: 'Ministry Results',
      description: 'View your exam results',
      icon: Award,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen pt-28 pb-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 mx-auto">
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-primary" />
              </div>
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            <span className="gradient-text">Grade 9</span> Student Portal
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            St. Theresa School - Your gateway to academic resources and information
          </motion.p>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Welcome, Students!</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Access your textbooks, view student profiles, and check your ministry exam results all in one place.
            </p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Academic Progress</span>
                <span className="text-primary font-medium">75%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: 'var(--gradient-primary)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resource Cards */}
        <motion.div 
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-3"
        >
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <motion.button
                key={resource.id}
                variants={itemVariants}
                onClick={() => onNavigate(resource.id)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card-hover p-6 text-left group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${resource.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {resource.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="mt-12 text-center text-muted-foreground text-sm"
        >
          <p>ቅዱስ ቴሬዛ ት/ቤት - እናንተ ራሳችሁን መሪዎች ናችሁ!</p>
          <p className="mt-2">© 2025 St. Theresa School - Grade 9</p>
        </motion.footer>
      </div>
    </motion.div>
  );
};

export default HomePage;
