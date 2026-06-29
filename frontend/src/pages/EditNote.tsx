import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import NoteForm, { NoteFormData } from '../components/NoteForm';

const EditNote = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const res = await api.get(`/notes/${id}`);
      return res.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updatedNote: NoteFormData) => api.patch(`/notes/${id}`, updatedNote),
    onMutate: async (updatedNote) => {
      await queryClient.cancelQueries({ queryKey: ['note', id] });
      const previousNote = queryClient.getQueryData(['note', id]);
      
      queryClient.setQueryData(['note', id], (old: any) => {
        if (!old) return old;
        return { ...old, ...updatedNote };
      });
      
      return { previousNote };
    },
    onError: (_err, _newNote, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(['note', id], context.previousNote);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
    },
    onSuccess: () => {
      navigate(`/notes/${id}`);
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading note...</div>;
  if (!note) return <div className="text-center py-10">Note not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Note</h1>
      <NoteForm 
        initialData={note}
        onSubmit={(data) => updateMutation.mutate(data)} 
        isLoading={updateMutation.isPending} 
      />
    </div>
  );
};

export default EditNote;
