import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, ChevronRight, X, FileText, PenTool, ClipboardList, MapPin } from 'lucide-react';
import { textbookContent } from '@/data/textbookContent';

interface TextbookContentFinderProps {
  subject: string;
}

type ContentType = 'units' | 'activities' | 'exercises' | 'review_exercises';

const TextbookContentFinder = ({ subject }: TextbookContentFinderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const subjectKey = subject.toLowerCase().replace(/\s+/g, '');
  const content = textbookContent[subjectKey];

  const categories: { key: ContentType; label: string; icon: typeof BookOpen; color: string }[] = [
    { key: 'units', label: 'Units', icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
    { key: 'activities', label: 'Activities', icon: PenTool, color: 'from-emerald-500 to-teal-600' },
    { key: 'exercises', label: 'Exercises', icon: ClipboardList, color: 'from-amber-500 to-orange-600' },
    { key: 'review_exercises', label: 'Review Exercises', icon: FileText, color: 'from-rose-500 to-pink-600' },
  ];

  const filteredItems = useMemo(() => {
    if (!content || !selectedType) return [];
    const items = content[selectedType] || [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item: any) =>
      item.id.toLowerCase().includes(q) ||
      item.title?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q)
    );
  }, [content, selectedType, searchQuery]);

  const availableCategories = useMemo(() => {
    if (!content) return [];
    return categories.filter(c => (content[c.key]?.length || 0) > 0);
  }, [content]);

  if (!content || availableCategories.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setIsOpen(!isOpen); setSelectedType(null); setSelectedItem(null); }}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[65vh] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-cyan-500/20 border-b border-border flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate">
                  {selectedItem ? selectedItem.id : selectedType ? categories.find(c => c.key === selectedType)?.label : 'Content Finder'} - {subject}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedItem ? `Page ${selectedItem.page}` : selectedType ? `${filteredItems.length} items` : 'Browse textbook content'}
                </p>
              </div>
              {(selectedType || selectedItem) && (
                <button
                  onClick={() => { if (selectedItem) setSelectedItem(null); else { setSelectedType(null); setSearchQuery(''); } }}
                  className="text-xs px-2 py-1 rounded-lg bg-muted hover:bg-muted/80"
                >
                  ← Back
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {/* Category selection */}
              {!selectedType && !selectedItem && (
                <div className="space-y-2">
                  {availableCategories.map(cat => {
                    const Icon = cat.icon;
                    const count = content[cat.key]?.length || 0;
                    return (
                      <motion.button
                        key={cat.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType(cat.key)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{cat.label}</div>
                          <div className="text-xs text-muted-foreground">{count} items found</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Item list */}
              {selectedType && !selectedItem && (
                <div className="space-y-2">
                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={`Search ${selectedType === 'exercises' ? 'exercise number...' : '...'}`}
                      className="w-full text-sm bg-muted rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {filteredItems.map((item: any, i: number) => (
                    <motion.button
                      key={`${item.id}-${item.page}-${i}`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedItem(item)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{item.id}</div>
                        {item.title && <div className="text-xs text-muted-foreground truncate">{item.title}</div>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <MapPin className="w-3 h-3" />
                        p.{item.page}
                      </div>
                    </motion.button>
                  ))}
                  {filteredItems.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">No items found</div>
                  )}
                </div>
              )}

              {/* Item detail */}
              {selectedItem && (
                <div className="space-y-3">
                  <div className="bg-primary/10 rounded-xl p-3">
                    <div className="font-bold text-primary">{selectedItem.id}</div>
                    {selectedItem.title && <div className="text-sm text-muted-foreground mt-1">{selectedItem.title}</div>}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <MapPin className="w-3 h-3" />
                      Page {selectedItem.page}
                    </div>
                  </div>
                  {selectedItem.content && (
                    <div className="bg-muted/50 rounded-xl p-3">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">Content:</div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{selectedItem.content}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TextbookContentFinder;
