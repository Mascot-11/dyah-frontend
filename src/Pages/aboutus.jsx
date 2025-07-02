import React from 'react';
import { motion } from 'framer-motion';
import { LocationMap } from "../components/Map";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8 space-y-16">
      {/* Our Start */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-4xl font-bold mb-4 border-b pb-2 border-zinc-700">Our Start</h2>
        <p className="text-lg text-zinc-300 leading-relaxed">
          Founded in 2017, our tattoo studio began as a small, passionate space for self-expression. 
          Over time, it has evolved into a trusted name in body art, blending tradition and modern creativity. 
          We’ve inked thousands of unique stories and symbols onto skin with care and precision.
        </p>
      </motion.section>

      {/* Our Vision */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-4xl font-bold mb-4 border-b pb-2 border-zinc-700">Our Vision</h2>
        <p className="text-lg text-zinc-300 leading-relaxed">
          We believe tattoos are more than ink — they’re identity, story, and soul. Our vision is to provide 
          a safe, inclusive, and inspiring space where every individual feels empowered to wear their truth 
          with pride and artistry.
        </p>
      </motion.section>

      {/* Our Artists */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-4xl font-bold mb-4 border-b pb-2 border-zinc-700">Our Artists</h2>
        <p className="text-lg text-zinc-300 leading-relaxed mb-6">
          Our artists are a diverse team of passionate creatives, each bringing a unique style and perspective. 
          From traditional blackwork to modern minimalism, they are dedicated to crafting artwork that resonates 
          personally and artistically.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-1">Raven Ink</h3>
            <p className="text-sm text-zinc-400">Specializes in black & grey realism.</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-1">Luna Marks</h3>
            <p className="text-sm text-zinc-400">Known for abstract & watercolor styles.</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-1">Kai Needle</h3>
            <p className="text-sm text-zinc-400">Master of fine line & minimalist tattoos.</p>
          </div>
        </div>
      </motion.section>
      <LocationMap />
    </div>
    
  );
};

export default AboutUs;
