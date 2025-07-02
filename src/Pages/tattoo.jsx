import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Droplet,
  Sun,
  Heart,
 
} from "lucide-react";

import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

const TattooStudio = () => {
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${BASE_URL}/tattoo-gallery`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 3);
          setImages(shuffled);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(`${BASE_URL}/artists`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 3);
          setArtists(shuffled);
        }
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };

    fetchArtists();
  }, []);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, [images]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const navItems = [
    { title: "Home", path: "/" },
    { title: "Gallery", path: "/gallery" },
  
    { title: "Appointment", path: "/appointment" },
    { title: "FAQs", path: "/faq" },
  ]

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-gray-100 min-h-screen relative">
   
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-24">
        

        <motion.section
          className="text-center"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.h1
            className="text-6xl font-bold text-white mb-6 tracking-tight"
            variants={fadeInUp}
          >
            Ink Your Story
          </motion.h1>
          <motion.p className="text-2xl mb-8 text-gray-300" variants={fadeInUp}>
            Where art meets skin, and stories come to life.
          </motion.p>
          <motion.div className="space-x-4" variants={fadeInUp}>
            <Link
              to="/appointment"
              className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition-colors text-lg font-semibold inline-block"
            >
              Book an Appointment
            </Link>
            <Link
              to="/gallery"
              className="border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-colors text-lg font-semibold inline-block"
            >
              View Gallery
            </Link>
          </motion.div>
        </motion.section>

        <motion.section
          className="relative h-[600px] rounded-xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            {images.length > 0 ? (
              <motion.img
                key={currentImage}
                src={images[currentImage].image_url}
                alt={`Tattoo artwork ${currentImage + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-2xl">
                No images available
              </div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-75 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-3 rounded-full text-white hover:bg-opacity-75 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={24} />
          </motion.button>
        </motion.section>

        <motion.section
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          className="bg-gray-800 p-8 rounded-xl shadow-xl"
        >
          <motion.h2
            className="text-4xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            Our Unique Style
          </motion.h2>
          <motion.p className="mb-6 text-lg text-gray-300" variants={fadeInUp}>
            At our studio, we blend traditional techniques with modern
            innovation. Our artists specialize in a wide range of styles, from
            intricate dotwork to vibrant watercolors, ensuring that every piece
            of art is as unique as the individual wearing it.
          </motion.p>
          <motion.ul
            className="list-disc list-inside space-y-2 text-gray-300"
            variants={staggerChildren}
          >
            {[
              "Precision in every stroke",
              "Creativity that pushes boundaries",
              "Safety and hygiene as top priorities",
            ].map((item, index) => (
              <motion.li key={index} variants={fadeInUp} className="text-lg">
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        <motion.section
          initial="initial"
          animate="animate"
          variants={staggerChildren}
        >
          <motion.h2
            className="text-4xl font-bold text-white mb-8"
            variants={fadeInUp}
          >
            Featured Artists
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerChildren}
          >
            {artists.length > 0 ? (
              artists.map((artist, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-800 p-6 rounded-xl shadow-lg"
                >
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {artist.name}
                  </h3>
                 
                </motion.div>
              ))
            ) : (
              <div className="text-white">No artists available</div>
            )}
          </motion.div>
        </motion.section>

        <motion.section
  initial="initial"
  animate="animate"
  variants={staggerChildren}
  className="bg-black bg-opacity-80 p-8 md:p-12 lg:p-16 rounded-2xl shadow-2xl border border-white/10 max-w-5xl mx-auto backdrop-blur-sm"
>
  <motion.h2
    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-10 border-b border-white/20 pb-6"
    variants={fadeInUp}
  >
    Essential Tattoo Care Guide
  </motion.h2>
  
  <motion.div 
    className="mb-12"
    variants={fadeInUp}
  >
    <p className="text-gray-300 text-lg md:text-xl italic border-l-4 border-white/30 pl-6">
      A tattoo is not just art on your skin. it is an investment that deserves proper care and attention.
    </p>
  </motion.div>
  
  <motion.div className="mb-16" variants={fadeInUp}>
    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6">Initial Recovery Phase (1-2 Weeks)</h3>
    <p className="text-gray-300 mb-8">The first few weeks are crucial for your tattoo long-term appearance. Follow these essential steps:</p>
    
    <motion.ul className="grid grid-cols-1 md:grid-cols-2 gap-8" variants={staggerChildren}>
      {[
        {
          icon: Droplet,
          title: "Keep It Clean",
          tip: "Wash your tattoo gently with unscented, antibacterial soap and lukewarm water 2-3 times daily. Pat dry with a clean, soft towel - never rub."
        },
        {
          icon: Sun,
          title: "Avoid Direct Sunlight",
          tip: "Protect your new tattoo from UV rays completely during healing. Sun exposure can cause fading and damage to fresh ink."
        },
        {
          icon: Heart,
          title: "Moisturize Properly",
          tip: "Apply a thin layer of unscented, hypoallergenic lotion or specialized tattoo aftercare product 3-4 times daily to keep skin hydrated."
        },
        {
          icon: Droplet,
          title: "Avoid Submerging",
          tip: "Keep your tattoo away from pools, hot tubs, baths, and natural bodies of water until fully healed to prevent infection."
        }
      ].map((item, index) => (
        <motion.li
          key={index}
          className="flex items-start group bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
          variants={fadeInUp}
        >
          <div className="w-14 h-14 rounded-full bg-white bg-opacity-10 flex items-center justify-center mr-6 flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
            <item.icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">{item.title}</h4>
            <p className="text-gray-300 font-light">{item.tip}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  </motion.div>
  
  <motion.div className="mb-16" variants={fadeInUp}>
    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 inline-block relative">
      Healing Timeline
      <span className="absolute -bottom-1 left-0 w-1/2 h-px bg-gradient-to-r from-white to-transparent"></span>
    </h3>
    
    <div className="space-y-6">
      {[
        {
          days: "Days 1-3",
          description: "Your tattoo will feel sore and may appear bright red. Some oozing and bleeding is normal. Keep it clean and apply aftercare ointment."
        },
        {
          days: "Days 4-6",
          description: "The tattoo will begin to form a scab and may itch. Resist scratching or picking at it, as this can remove ink and cause scarring."
        },
        {
          days: "Days 7-14",
          description: "The scabs will start to flake and peel naturally. The tattoo may look dull temporarily - this is normal during healing."
        },
        {
          days: "Days 15-30",
          description: "Most of the surface healing is complete, but the deeper layers are still recovering. Continue moisturizing and avoiding direct sun exposure."
        }
      ].map((phase, index) => (
        <motion.div 
          key={index}
          className="flex items-start border-l-2 border-white/20 pl-6 pb-4"
          variants={fadeInUp}
        >
          <div>
            <h4 className="text-xl font-medium text-white mb-2">{phase.days}</h4>
            <p className="text-gray-300 font-light">{phase.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
  
  <motion.div className="mb-16" variants={fadeInUp}>
    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-6 inline-block relative">
      Long-term Tattoo Care
      <span className="absolute -bottom-1 left-0 w-1/2 h-px bg-gradient-to-r from-white to-transparent"></span>
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div className="bg-white/5 p-6 rounded-xl" variants={fadeInUp}>
        <h4 className="text-xl font-medium text-white mb-4">Daily Maintenance</h4>
        <motion.ul 
          className="space-y-3 text-gray-300"
          variants={staggerChildren}
        >
          {[
            "Keep your tattoo moisturized with quality lotion, especially in dry climates or seasons.",
            "Use fragrance-free products on tattooed areas to prevent irritation.",
            "Stay hydrated and maintain a healthy diet to preserve skin quality.",
            "Clean the tattooed area with mild soap during regular showers."
          ].map((tip, index) => (
            <motion.li 
              key={index} 
              className="flex items-center"
              variants={fadeInUp}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white mr-3 flex-shrink-0"></div>
              <p className="text-gray-300 font-light">{tip}</p>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
      
      <motion.div className="bg-white/5 p-6 rounded-xl" variants={fadeInUp}>
        <h4 className="text-xl font-medium text-white mb-4">Sun Protection</h4>
        <motion.ul 
          className="space-y-3 text-gray-300"
          variants={staggerChildren}
        >
          {[
            "Always apply SPF 50+ sunscreen to exposed tattoos, even on cloudy days.",
            "Reapply sunscreen every 2 hours when outdoors for extended periods.",
            "Consider covering tattoos with UPF clothing for additional protection.",
            "Remember that sun exposure is the leading cause of tattoo fading over time."
          ].map((tip, index) => (
            <motion.li 
              key={index} 
              className="flex items-center"
              variants={fadeInUp}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white mr-3 flex-shrink-0"></div>
              <p className="text-gray-300 font-light">{tip}</p>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </div>
  </motion.div>
  
  <motion.div className="p-8 border border-white/10 rounded-xl bg-white/5" variants={fadeInUp}>
    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4 text-center">When to See Your Tattoo Artist</h3>
    <p className="text-gray-300 text-center mb-6">Schedule a follow-up appointment if you notice any of the following:</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
      <div className="p-4">
        <p className="text-white font-medium mb-2">Significant Fading</p>
        <p className="text-gray-400 text-sm">After 5-10 years, your tattoo may need professional touch-ups to restore vibrance.</p>
      </div>
      <div className="p-4">
        <p className="text-white font-medium mb-2">Uneven Healing</p>
        <p className="text-gray-400 text-sm">If areas of your tattoo healed inconsistently, a touch-up may be needed.</p>
      </div>
      <div className="p-4">
        <p className="text-white font-medium mb-2">Design Enhancement</p>
        <p className="text-gray-400 text-sm">If you wish to expand or modify your existing tattoo with additional elements.</p>
      </div>
    </div>
  </motion.div>
</motion.section>

      </main>
    </div>
  );
};

export default TattooStudio;
