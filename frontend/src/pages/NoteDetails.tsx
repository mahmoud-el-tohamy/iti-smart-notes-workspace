import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Edit, ArrowLeft, Trash2 } from 'lucide-react';

const NoteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const res = await api.get(`/notes/${id}`);
      return res.data;
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading note...</div>;
  if (!note) return <div className="text-center py-10">Note not found</div>;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await api.delete(`/notes/${id}`);
      navigate('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <div className="flex gap-3">
          <Link to={`/notes/${id}/edit`} className="btn-primary flex items-center gap-2 px-3 py-1.5 text-sm">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 transition-all">
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-8 md:p-12">
        <div className="flex gap-2 mb-6">
          <span className="text-sm font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full">{note.category}</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${note.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
            {note.status}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{note.title}</h1>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags.map((tag: string) => (
              <span key={tag} className="text-xs font-medium px-2.5 py-1 bg-surface border border-border text-text-muted rounded-md shadow-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-text-muted mb-12 border-b border-border pb-6">
          <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="prose dark:prose-invert max-w-none prose-lg">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;
