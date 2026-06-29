import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().optional(),
  tags: z.any().optional(), // accepts string from input, transformed to array on submit
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
  isPinned: z.boolean().optional(),
});

export type NoteFormData = z.infer<typeof noteSchema>;

interface Props {
  initialData?: NoteFormData;
  onSubmit: (data: NoteFormData) => void;
  isLoading: boolean;
}

const NoteForm = ({ initialData, onSubmit, isLoading }: Props) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      ...initialData,
      tags: initialData?.tags && Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      status: initialData?.status || 'Draft',
      category: initialData?.category || 'General',
      isPinned: initialData?.isPinned || false
    }
  });
  
  const content = watch('content');
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/notes/categories');
      return data as string[];
    }
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryValue = watch('category') || '';
  
  const allCategories = Array.from(new Set([
    ...(categories || []),
    'General', 'Work', 'Personal'
  ]));
  
  const filteredCategories = allCategories.filter(cat => cat.toLowerCase().includes(categoryValue.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit((data) => {
        const transformedData = {
          ...data,
          tags: typeof data.tags === 'string' 
            ? data.tags.split(',').map(t => t.trim()).filter(Boolean) 
            : data.tags || []
        };
        onSubmit(transformedData as any);
      })} className="space-y-6 glass-panel p-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input type="text" {...register('title')} className="input-field" placeholder="Note Title" />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div 
              className="relative"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsCategoryOpen(false);
                }
              }}
            >
              <input 
                type="text" 
                {...register('category')}
                onFocus={() => setIsCategoryOpen(true)}
                className="input-field w-full pr-10" 
                placeholder="Category"
                autoComplete="off"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-50">
                <span className="text-xs">▼</span>
              </div>
              
              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-60 overflow-y-auto">
                  {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`w-full text-left px-4 py-2.5 hover:bg-primary/10 text-text cursor-pointer transition-colors text-sm ${categoryValue === cat ? 'bg-primary/5 text-primary font-medium' : ''}`}
                      onClick={() => {
                        setValue('category', cat, { shouldValidate: true, shouldDirty: true });
                        setIsCategoryOpen(false);
                      }}
                    >
                      {cat}
                    </button>
                  )) : (
                    <div className="px-4 py-2.5 text-sm text-text-muted italic">
                      {categoryValue ? `Save note to create "${categoryValue}"` : 'No categories found'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select {...register('status')} className="input-field">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
          <input type="text" {...register('tags')} className="input-field" placeholder="e.g. react, node, tutorial" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPinned" {...register('isPinned')} className="w-4 h-4 text-primary" />
          <label htmlFor="isPinned" className="text-sm font-medium">Pin this note</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content (Markdown Supported)</label>
          <textarea 
            {...register('content')} 
            className="input-field min-h-[300px] font-mono text-sm" 
            placeholder="# Markdown Content Here..."
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-primary bg-slate-500 hover:bg-slate-600">Cancel</button>
          <button type="submit" disabled={isLoading} className="btn-primary flex-1">
            {isLoading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>

      <div className="glass-panel p-6 overflow-auto max-h-[800px]">
        <h3 className="text-sm font-medium mb-4 text-text-muted uppercase tracking-wider">Preview</h3>
        <div className="prose dark:prose-invert max-w-none">
          {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-text-muted italic">No content to preview...</p>}
        </div>
      </div>
    </div>
  );
};

export default NoteForm;
