import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useState } from 'react';
import api from '../services/api';
import { setCredentials } from '../store/authSlice';
import { User as UserIcon, Upload, Check } from 'lucide-react';

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await api.post('/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (user) {
        dispatch(setCredentials({ ...user, profileImage: res.data.profileImage }));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <div className="glass-panel p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            {user.profileImage ? (
              <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-surface shadow-xl">
                <UserIcon className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-text-muted">{user.email}</p>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium">Update Profile Picture</label>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors cursor-pointer"
                />
              </div>
              <button 
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
              >
                {uploading ? 'Uploading...' : success ? <><Check className="w-4 h-4"/> Uploaded</> : <><Upload className="w-4 h-4"/> Upload</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
