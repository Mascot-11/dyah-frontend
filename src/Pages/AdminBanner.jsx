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

  const imgbbKey = import.meta.env.VITE_IMGBB_KEY;
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });

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

  const fetchCurrentBanner = async () => {
    try {
      const res = await api.get('/banner');
      setCurrentBanner(res.data);
      setTitle(res.data.title || '');
      setSubtitle(res.data.subtitle || '');
    } catch (err) {
      toast.error('Failed to fetch banner data');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      toast.error('Only image files allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setFile(selected);
    toast.success('Image selected');
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    toast.info('Image removed');
  };

  const submit = async () => {
    if (!title.trim()) return toast.error('Title is required');
    if (!file) return toast.error('Image is required');

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Img = reader.result.split(',')[1];

        // Upload to imgbb
        const res = await axios.post('https://api.imgbb.com/1/upload', null, {
          params: {
            key: imgbbKey,
            image: base64Img,
          },
        });

        const imageUrl = res.data?.data?.url;
        if (!imageUrl) throw new Error('Failed to upload image');

        // Submit to backend
        const body = {
          title: title.trim(),
          subtitle: subtitle.trim(),
          image_url: imageUrl,
        };

        await api.post('/banner', body);
        toast.success('Banner updated successfully!');
        fetchCurrentBanner();
        setFile(null);
        setPreviewUrl(null);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
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
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Banner Editor</h1>
          <p className="text-gray-400">Manage your landing page banner content</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Upload size={24} />
                Banner Content
              </h2>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  maxLength={100}
                />
              </div>

              {/* Subtitle */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  maxLength={200}
                />
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Background Image</label>
                {!file ? (
                  <label className="relative block w-full h-32 border-2 border-dashed border-white/30 rounded-lg hover:border-white/50 cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-white transition">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="text-sm">Click to upload image</p>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg border border-white/20">
                      <ImageIcon size={24} className="text-green-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button onClick={removeFile} className="p-1 hover:bg-white/10 rounded">
                        <X size={16} />
                      </button>
                    </div>
                    {previewUrl && (
                      <div className="mt-3">
                        <img src={previewUrl} alt="Selected" className="w-full h-32 object-cover rounded-lg border border-white/20" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={submit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50"
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
          </motion.div>

          {/* Live Preview */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Eye size={24} />
                Live Preview
              </h2>
              <BannerPreview />
            </div>
          </motion.div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
