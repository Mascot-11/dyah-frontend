// AdminBannerEditor.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, Eye, ImageIcon, X } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { ease: "easeOut" } },
};

export default function AdminBannerEditor() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [file, setFile] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchCurrentBanner();
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const fetchCurrentBanner = async () => {
    try {
      const token = getAuthToken();
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};

      const res = await axios.get('/banner', config);
      setCurrentBanner(res.data);
      setTitle(res.data.title || '');
      setSubtitle(res.data.subtitle || '');
    } catch (error) {
      console.error('Error fetching banner:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to fetch current banner data.');
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      toast.success('Image selected successfully!');
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    toast.info('Image removed');
  };

  const submit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      fd.append('title', title.trim());
      fd.append('subtitle', subtitle.trim());
      
      await axios.post('/banner', fd, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        } 
      });
      
      toast.success('Banner updated successfully!');
      fetchCurrentBanner(); // Refresh current banner data
      setFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error('Failed to update banner. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const BannerPreview = () => (
    <div className="relative min-h-[400px] bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-white/20">
      {(previewUrl || currentBanner?.image_url) && (
        <img 
          src={previewUrl || currentBanner?.image_url} 
          alt="Banner preview" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white min-h-[400px] px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 uppercase bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          {title || 'Banner Title'}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed">
          {subtitle || 'Banner subtitle will appear here'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Banner Editor</h1>
          <p className="text-gray-400">Manage your landing page banner content</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <motion.div
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Upload size={24} />
                Banner Content
              </h2>

              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter banner title..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition"
                  maxLength={100}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {title.length}/100 characters
                </div>
              </div>

              {/* Subtitle Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Subtitle
                </label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Enter banner subtitle..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition resize-none"
                  maxLength={200}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {subtitle.length}/200 characters
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Background Image
                </label>
                
                {!file ? (
                  <label className="relative block w-full h-32 border-2 border-dashed border-white/30 rounded-lg hover:border-white/50 transition cursor-pointer group">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-white transition">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
                      <ImageIcon size={24} className="text-green-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-1 hover:bg-white/10 rounded transition"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {/* Image Preview */}
                    {previewUrl && (
                      <div className="mt-3">
                        <img 
                          src={previewUrl} 
                          alt="Selected preview" 
                          className="w-full h-32 object-cover rounded-lg border border-white/20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={submit}
                  disabled={isLoading || !title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={18} />
                  {isLoading ? 'Saving...' : 'Save Banner'}
                </motion.button>
                
                <motion.button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-6 py-3 border border-white/20 rounded-lg transition flex items-center gap-2 ${
                    showPreview ? 'bg-white/10 text-white' : 'hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye size={18} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </motion.button>
              </div>
            </div>

            {/* Current Banner Info */}
            {currentBanner && (
              <motion.div
                variants={fadeInUp}
                className="bg-white/5 border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Current Banner</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Title:</span> {currentBanner.title}
                  </div>
                  <div>
                    <span className="text-gray-400">Subtitle:</span> {currentBanner.subtitle || 'No subtitle'}
                  </div>
                  <div>
                    <span className="text-gray-400">Image:</span> {currentBanner.image_url ? 'Yes' : 'No image'}
                  </div>
                </div>
                
                {/* Current Banner Image Preview */}
                {currentBanner.image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Current Image:</p>
                    <img 
                      src={currentBanner.image_url} 
                      alt="Current banner" 
                      className="w-full h-24 object-cover rounded-lg border border-white/20"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Eye size={24} />
                Live Preview
              </h2>
              <BannerPreview />
            </div>

            {/* Mobile Preview Toggle */}
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/5 border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4">Mobile Preview</h3>
                <div className="max-w-sm mx-auto">
                  <div className="relative min-h-[300px] bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border border-white/20">
                    {(previewUrl || currentBanner?.image_url) && (
                      <img 
                        src={previewUrl || currentBanner?.image_url} 
                        alt="Mobile banner preview" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
                    <div className="relative z-10 flex flex-col items-center justify-center text-center text-white min-h-[300px] px-4">
                      <h1 className="text-2xl font-extrabold tracking-tight mb-3 uppercase bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {title || 'Banner Title'}
                      </h1>
                      <p className="text-sm text-gray-200 leading-relaxed">
                        {subtitle || 'Banner subtitle will appear here'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#1f2937',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      />
    </div>
  );
}