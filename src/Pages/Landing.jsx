import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import axios from "axios"
import { Helmet } from "react-helmet-async"
import Tattoo1 from "../assets/Tattoing1.jpeg"
import Tattoo2 from "../assets/Tattoing2.jpeg"
import Tattoo3 from "../assets/Tattoing3.jpeg"
import { LocationMap } from "../components/Map";

// Elfsight script loader hook
function useElfsightScript() {
  useEffect(() => {
    if (!document.getElementById("elfsight-platform-script")) {
      const script = document.createElement("script")
      script.id = "elfsight-platform-script"
      script.src = "https://static.elfsight.com/platform/platform.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])
}

const staggerChildren = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { 
      staggerChildren: 0.15, 
      ease: [0.25, 0.46, 0.45, 0.94],
      duration: 0.6 
    },
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      ease: [0.25, 0.46, 0.45, 0.94],
      duration: 0.6 
    } 
  },
}

const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      ease: [0.25, 0.46, 0.45, 0.94],
      duration: 0.7 
    } 
  },
}

// BannerSection Component
function BannerSection() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    axios.get('/banner')
      .then(res => setBanner(res.data))
      .catch(console.error);
  }, []);

  const fallbackBanner = {
    title: "Ink Your Story",
    subtitle: "Where art meets skin, and stories come to life.",
    image_url: null
  };

  const bannerData = banner || fallbackBanner;

  return (
    <motion.section 
      className="relative min-h-[700px] overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-white/3 rounded-full blur-3xl"
          animate={{ 
            x: [0, -80, 0],
            y: [0, 40, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {bannerData.image_url && (
        <motion.div className="absolute inset-0">
          <motion.img 
            src={bannerData.image_url} 
            alt={bannerData.title} 
            loading="lazy"
            className="w-full h-full object-cover opacity-40"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </motion.div>
      )}
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center text-white min-h-[700px] px-6">
        <motion.h1
          className="text-6xl md:text-8xl font-black tracking-tight mb-8 uppercase bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent"
          variants={fadeInUp}
          style={{ letterSpacing: "0.1em" }}
        >
          {bannerData.title}
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed"
          variants={fadeInUp}
        >
          {bannerData.subtitle}
        </motion.p>
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8" 
          variants={fadeInUp}
        >
          <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/appointment"
              className="group px-12 py-4 bg-white text-black rounded-full font-bold tracking-wide uppercase transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">Book an Appointment</span>
              <motion.div 
                className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/gallery"
              className="px-12 py-4 border-2 border-white/50 text-white rounded-full font-bold tracking-wide uppercase hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
            >
              View Gallery
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ReviewsWidget Component for Elfsight Google Reviews
function ReviewsWidget() {
  useElfsightScript();

  return (
    <motion.section
      className="py-20 px-6"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerChildren}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/10"
          variants={fadeInUp}
        >
          <motion.h2
            className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider"
            variants={fadeInUp}
          >
            Reviews
          </motion.h2>
          <motion.div
            className="elfsight-app-630343bd-1a1d-4829-a430-1629cc02c6f9"
            data-elfsight-app-lazy
            variants={fadeInUp}
            style={{
              width: "100%",
              minHeight: "500px",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          />
        </motion.div>
      </div>
    </motion.section>
  )
}

export default function LandingPage() {
  const [currentImage, setCurrentImage] = useState(0)
  const [artists, setArtists] = useState([])
  const navigate = useNavigate()

  const [images, setImages] = useState([])

  useEffect(() => {
    axios.get("/tattoo-gallery")
      .then((res) => {
        const shuffled = res.data.sort(() => 0.5 - Math.random())
        const selected = shuffled.slice(0, 3)
        const imageUrls = selected.map(img => img.image_url)
        setImages(imageUrls)
      })
      .catch((err) => {
        console.error("Failed to fetch tattoo gallery images:", err)
        setImages([Tattoo3, Tattoo1, Tattoo2])
      })
  }, [])

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    axios.get('/artists')
      .then(res => setArtists(res.data))
      .catch(err => {
        console.error('Failed to fetch artists:', err)
        setArtists([
          { id: 1, name: "Aiden Black" },
          { id: 2, name: "Maya Green" },
          { id: 3, name: "Liam White" },
        ])
      })
  }, [])

  const handleArtistClick = (artistId) => {
    localStorage.setItem("selectedArtistId", artistId)
    navigate(`/gallery?artistId=${artistId}`)
  }

  // SVG icons
  const Droplet = (props) => (
    <svg {...props} fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 7 4 12 4 16a8 8 0 0 0 16 0c0-4-4-9-8-14z" />
    </svg>
  )
  const Sun = (props) => (
    <svg {...props} fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
  const Heart = (props) => (
    <svg {...props} fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-4.35-6-9a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 4.65-6 9-6 9z" />
    </svg>
  )

  return (
    <div className="bg-black text-white min-h-screen">
      <Helmet>
        <title>Ink Your Story - Premier Tattoo Studio | Unique Custom Tattoos & Care</title>
        <meta name="description" content="Experience custom tattoo art that tells your story. Expert artists blending traditional and modern styles with premium safety and hygiene standards." />
        <meta name="keywords" content="tattoo, tattoo studio, custom tattoo, tattoo care, tattoo artists, tattoo gallery, tattoo appointment" />
        <meta name="author" content="Ink Your Story Tattoo Studio" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ink Your Story - Premier Tattoo Studio | Unique Custom Tattoos & Care" />
        <meta property="og:description" content="Experience custom tattoo art that tells your story. Expert artists blending traditional and modern styles with premium safety and hygiene standards." />
        <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : ""} />
        <meta property="og:image" content="https://yourdomain.com/path-to-banner-or-featured-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ink Your Story - Premier Tattoo Studio | Unique Custom Tattoos & Care" />
        <meta name="twitter:description" content="Experience custom tattoo art that tells your story. Expert artists blending traditional and modern styles with premium safety and hygiene standards." />
        <meta name="twitter:image" content="https://yourdomain.com/path-to-banner-or-featured-image.jpg" />
      </Helmet>

      {/* Banner Section */}
      <BannerSection />

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-32">
        {/* Tattoo Artwork Slider */}
        <motion.section
          className="relative"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-black text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase tracking-wider"
            variants={fadeInUp}
          >
            Featured Artwork
          </motion.h2>
          
          <motion.div
            className="relative h-[700px] max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
            variants={fadeInUp}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={images[currentImage]}
                alt={`Tattoo artwork ${currentImage + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8 }}
                draggable={false}
              />
            </AnimatePresence>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Navigation Buttons */}
            <motion.button
              onClick={prevImage}
              className="absolute top-1/2 left-6 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={28} className="stroke-white" />
            </motion.button>
            <motion.button
              onClick={nextImage}
              className="absolute top-1/2 right-6 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next Slide"
            >
              <ChevronRight size={28} className="stroke-white" />
            </motion.button>

            {/* Dots indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              {images.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentImage ? 'bg-white' : 'bg-white/40'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Our Unique Style */}
        <motion.section
          className="max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900/60 to-black/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/10"
            variants={fadeInUp}
          >
            <motion.h2
              className="text-5xl font-black mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider"
              variants={slideInLeft}
            >
              Our Unique Style
            </motion.h2>
            <motion.p
              className="text-gray-300 text-xl mb-10 leading-relaxed"
              variants={fadeInUp}
            >
              At our studio, we blend traditional techniques with modern innovation.
              Our artists specialize in a wide range of styles, from intricate dotwork
              to vibrant watercolors, ensuring that every piece of art is as unique as
              the individual wearing it.
            </motion.p>
            <motion.ul className="space-y-6 text-gray-300" variants={staggerChildren}>
              {[
                "Precision in every stroke",
                "Creativity that pushes boundaries",
                "Safety and hygiene as top priorities",
              ].map((point, idx) => (
                <motion.li
                  key={idx}
                  className="flex items-center text-lg"
                  variants={fadeInUp}
                  whileHover={{ x: 10 }}
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-4" />
                  {point}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.section>

        {/* Featured Artists */}
        <motion.section
          className="max-w-6xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2
            className="text-5xl md:text-6xl font-black mb-16 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase tracking-wider"
            variants={fadeInUp}
          >
            Featured Artists
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerChildren}
          >
            {artists.map(({ id, name }) => (
              <motion.div
                key={id || name}
                className="group cursor-pointer"
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                onClick={() => handleArtistClick(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleArtistClick(id) }}
              >
                <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-xl rounded-3xl p-8 text-center shadow-xl border border-white/10 group-hover:border-white/30 transition-all duration-500">
                  <motion.div 
                    className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white font-black text-2xl border border-white/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {name.split(" ").map(n => n[0]).join("")}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
                    {name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Essential Tattoo Care Guide */}
        <motion.section
          className="max-w-6xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/10"
            variants={fadeInUp}
          >
            <motion.h2
              className="text-5xl md:text-6xl font-black mb-12 text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent uppercase tracking-wider"
              variants={slideInLeft}
            >
              Essential Tattoo Care Guide
            </motion.h2>

            <motion.p
              className="text-gray-400 text-xl italic mb-12 text-center max-w-4xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              A tattoo is not just art on your skin. It is an investment that deserves proper care and attention.
            </motion.p>

            {/* Initial Recovery Phase */}
            <motion.div className="mb-16" variants={fadeInUp}>
              <h3 className="text-3xl font-bold mb-8 text-white uppercase tracking-wide text-center">
                Initial Recovery Phase (1-2 Weeks)
              </h3>
              <p className="text-gray-300 mb-10 text-center leading-relaxed max-w-3xl mx-auto">
                The first few weeks are crucial for your tattoo long-term appearance. Follow these essential steps:
              </p>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                variants={staggerChildren}
              >
                {[
                  {
                    icon: Droplet,
                    title: "Keep It Clean",
                    tip: "Wash your tattoo gently with unscented, antibacterial soap and lukewarm water 2-3 times daily. Pat dry with a clean, soft towel - never rub.",
                  },
                  {
                    icon: Sun,
                    title: "Avoid Direct Sunlight",
                    tip: "Protect your new tattoo from UV rays completely during healing. Sun exposure can cause fading and damage to fresh ink.",
                  },
                  {
                    icon: Heart,
                    title: "Moisturize Properly",
                    tip: "Apply a thin layer of unscented, hypoallergenic lotion or specialized tattoo aftercare product 3-4 times daily to keep skin hydrated.",
                  },
                  {
                    icon: Droplet,
                    title: "Avoid Submerging",
                    tip: "Keep your tattoo away from pools, hot tubs, baths, and natural bodies of water until fully healed to prevent infection.",
                  },
                ].map(({ icon: Icon, title, tip }, i) => (
                  <motion.div
                    key={i}
                    className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 hover:from-white/10 hover:to-white/15 transition-all duration-500 border border-white/10"
                    variants={fadeInUp}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-6">
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center border border-white/20"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-8 h-8" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-3 text-white">{title}</h4>
                        <p className="text-gray-300 leading-relaxed">{tip}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Healing Timeline */}
            <motion.div className="mb-20" variants={fadeInUp}>
  <h3 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-widest text-center mb-10">
    Healing Timeline
  </h3>

  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-inner max-w-3xl mx-auto">
    <p className="text-gray-300 text-lg leading-relaxed mb-6 text-center">
      Expect redness, swelling, and scabbing in the first week. Peeling and itching follow. Complete healing can take up to 6 weeks depending on the tattoo's size and location.
    </p>
    <p className="text-gray-400 italic text-center">
      Follow your artist’s specific instructions and never pick or scratch your tattoo.
    </p>
  </div>
</motion.div>


            {/* Long-Term Care */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-3xl font-bold mb-8 text-white uppercase tracking-wide text-center">
                Long-Term Care
              </h3>
              <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-8 border border-white/10">
                <p className="text-gray-300 leading-relaxed text-center">
                  Protect your tattoo with sunscreen (SPF 30+) when outdoors to preserve vibrancy. Keep your skin moisturized and healthy for years to come.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Elfsight Google Reviews Widget */}
        <ReviewsWidget />
        
        {/* Location Map */}
        <motion.section
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <LocationMap />
        </motion.section>
      </main>
    </div>
  )
}