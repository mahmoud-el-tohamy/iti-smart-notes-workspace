import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { Link } from 'react-router-dom';
import { Plus, Search, Pin, Trash2, Edit } from 'lucide-react';

const fetchNotes = async (params: any) => {
  const { data } = await api.get('/notes', { params });
  return data;
};

const CustomSelect = ({ value, onChange, options, placeholder }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative md:w-48 flex-shrink-0">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="input-field w-full text-left flex justify-between items-center cursor-pointer select-none"
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="text-xs opacity-50 ml-2">▼</span>
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1">
            {placeholder && (
              <div 
                className="px-4 py-2.5 hover:bg-primary/10 text-text cursor-pointer transition-colors text-sm"
                onClick={() => { onChange(''); setIsOpen(false); }}
              >
                {placeholder}
              </div>
            )}
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-2.5 hover:bg-primary/10 text-text cursor-pointer transition-colors text-sm ${value === opt.value ? 'bg-primary/5 text-primary font-medium' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/notes/categories');
      return data as string[];
    }
  });

  const categoryOptions = categoriesData 
    ? categoriesData.map((cat: string) => ({ value: cat, label: cat }))
    : [
        { value: 'General', label: 'General' },
        { value: 'Work', label: 'Work' },
        { value: 'Personal', label: 'Personal' }
      ];

  const { data, isLoading } = useQuery({
    queryKey: ['notes', { search: debouncedSearch, category, status, page, sortBy, order }],
    queryFn: () => fetchNotes({ search: debouncedSearch, category, status, page, limit: 9, sortBy, order }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onMutate: async (deletedId) => {
      const activeQueryKey = ['notes', { search: debouncedSearch, category, status, page, sortBy, order }];
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previousNotes = queryClient.getQueryData(activeQueryKey);
      
      queryClient.setQueryData(activeQueryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notes: old.notes.filter((note: any) => note._id !== deletedId)
        };
      });
      return { previousNotes, activeQueryKey };
    },
    onError: (_err, _deletedId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(context.activeQueryKey, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Link to="/notes/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </Link>
      </div>

      <div className="glass-panel p-4 flex flex-col md:flex-row flex-wrap gap-4 relative z-40">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CustomSelect 
          value={category} 
          onChange={setCategory} 
          placeholder="All Categories" 
          options={categoryOptions} 
        />
        <CustomSelect 
          value={status} 
          onChange={setStatus} 
          placeholder="All Statuses" 
          options={[
            { value: 'Draft', label: 'Draft' },
            { value: 'Published', label: 'Published' },
            { value: 'Archived', label: 'Archived' }
          ]} 
        />
        <CustomSelect 
          value={`${sortBy}-${order}`} 
          onChange={(val) => {
            if (!val) return;
            const [newSort, newOrder] = val.split('-');
            setSortBy(newSort);
            setOrder(newOrder);
          }} 
          placeholder="" 
          options={[
            { value: 'updatedAt-desc', label: 'Recently Updated' },
            { value: 'updatedAt-asc', label: 'Oldest' },
            { value: 'title-asc', label: 'A-Z' },
            { value: 'title-desc', label: 'Z-A' }
          ]} 
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading notes...</div>
      ) : data?.notes.length === 0 ? (
        <div className="text-center py-20 glass-panel">
          <h3 className="text-xl font-medium text-text-muted">No notes found</h3>
          <p className="mt-2 text-sm text-text-muted">Create a new note to get started</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.notes.map((note: any) => (
              <div key={note._id} className="glass-panel p-6 flex flex-col h-64 hover:shadow-2xl transition-all relative group">
                {note.isPinned && <Pin className="w-5 h-5 text-primary absolute top-4 right-4" />}
                
                <Link to={`/notes/${note._id}`} className="flex-1">
                  <div className="flex gap-2 mb-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">{note.category}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${note.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                      {note.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-primary transition-colors">{note.title}</h3>
                  <p className="text-text-muted text-sm line-clamp-3">{note.content}</p>
                </Link>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                  <span className="text-xs text-text-muted">{new Date(note.updatedAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Link to={`/notes/${note._id}/edit`} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(note._id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {data?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`w-10 h-10 rounded-xl font-medium transition-colors ${page === idx + 1 ? 'bg-primary text-white' : 'glass-panel hover:bg-primary/10'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
