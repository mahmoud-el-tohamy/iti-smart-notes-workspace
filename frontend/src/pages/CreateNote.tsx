import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import NoteForm, { NoteFormData } from '../components/NoteForm';

const CreateNote = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (newNote: NoteFormData) => api.post('/notes', newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate('/');
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create New Note</h1>
      <NoteForm 
        onSubmit={(data) => createMutation.mutate(data)} 
        isLoading={createMutation.isPending} 
      />
    </div>
  );
};

export default CreateNote;
