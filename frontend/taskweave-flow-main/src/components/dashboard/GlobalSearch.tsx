import { useState, useEffect } from "react";
import { Search, FileText, Grid3x3, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "@/store/taskStore";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: 'task' | 'template';
  title: string;
  description: string;
}

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const tasks = useTaskStore((state) => state.tasks);
  
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    
    // Debounced search
    const timer = setTimeout(() => {
      const searchQuery = query.toLowerCase();
      
      // Search tasks
      const taskResults: SearchResult[] = tasks
        .filter(task => 
          task.title.toLowerCase().includes(searchQuery) ||
          task.description.toLowerCase().includes(searchQuery) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchQuery))
        )
        .slice(0, 5)
        .map(task => ({
          id: task.id,
          type: 'task' as const,
          title: task.title,
          description: task.description,
        }));
      
      setResults(taskResults);
      setIsOpen(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, tasks]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'task') {
      navigate(`/dashboard/tasks/${result.id}`);
    }
    setQuery('');
    setIsOpen(false);
  };
  
  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          id="global-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search tasks, templates..."
          className="w-full pl-10 pr-16 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] bg-muted border border-border rounded font-mono">
          <Command className="w-2.5 h-2.5" />
          K
        </kbd>
      </div>
      
      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
              Tasks
            </p>
            {results.map(result => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="w-full flex items-start gap-3 p-2 hover:bg-muted rounded-lg text-left transition-colors"
              >
                {result.type === 'task' ? (
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                ) : (
                  <Grid3x3 className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {result.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50">
          <div className="p-4 text-center text-muted-foreground text-sm">
            No results found
          </div>
        </div>
      )}
    </div>
  );
};
