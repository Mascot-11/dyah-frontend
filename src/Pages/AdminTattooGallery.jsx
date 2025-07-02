"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useNavigate } from "react-router-dom"
import { Paperclip } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const AdminTattooGallery = () => {
  const BASE_URL = import.meta.env.VITE_API_URL
  const [images, setImages] = useState([])
  const [artists, setArtists] = useState([])
  const [newImage, setNewImage] = useState(null)
  const [description, setDescription] = useState("")
  const [selectedArtistId, setSelectedArtistId] = useState("")
  const [previewUrl, setPreviewUrl] = useState(null)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  axios.defaults.baseURL = BASE_URL

  // Axios instance with Authorization header
  const axiosAuth = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
    },
  })

  useEffect(() => {
    const userRole = localStorage.getItem("user_role")

    if (userRole !== "admin") {
      navigate("/login")
      toast.error("You do not have access to this page")
      return
    }

    // Fetch tattoo gallery images
    axiosAuth
      .get(`/tattoo-gallery`)
      .then((response) => {
        setImages(response.data)
      })
      .catch(() => {
        toast.error("Failed to fetch images")
      })

    // Fetch artists from /artists API
    axiosAuth
      .get(`/artists`)
      .then((res) => {
        setArtists(res.data)
      })
      .catch(() => {
        toast.error("Failed to fetch artists")
      })

    if (containerRef.current) {
      gsap.from(containerRef.current.children, {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      })
    }
  }, [navigate])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size <= 2 * 1024 * 1024) {
      setNewImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      toast.error("Image size should be 2MB or less")
    }
  }

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  const handleArtistChange = (e) => {
    setSelectedArtistId(e.target.value)
  }

  const handleImageUpload = (e) => {
    e.preventDefault()

    if (!newImage) {
      toast.error("Please select an image")
      return
    }

    if (!selectedArtistId) {
      toast.error("Please select an artist")
      return
    }

    const formData = new FormData()
    formData.append("image", newImage)
    formData.append("description", description)
    formData.append("artist_id", selectedArtistId)

    axiosAuth
      .post(`/tattoo-gallery`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setImages([...images, response.data])
        setDescription("")
        setNewImage(null)
        setPreviewUrl(null)
        setSelectedArtistId("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        toast.success("Image uploaded successfully")
      })
      .catch(() => {
        toast.error("Failed to upload image")
      })
  }

  const handleDelete = (imageId) => {
    axiosAuth
      .delete(`/tattoo-gallery/${imageId}`)
      .then(() => {
        setImages(images.filter((image) => image.id !== imageId))
        toast.success("Image deleted successfully")
      })
      .catch(() => {
        toast.error("Failed to delete image")
      })
  }

  return (
    <div className="min-h-screen bg-white text-black flex-grow">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl font-bold text-center mb-12"
        >
          Admin Tattoo Gallery
        </motion.h1>

        <motion.form
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mb-12 bg-gray-100 p-6 rounded-lg shadow-xl"
          onSubmit={handleImageUpload}
        >
          <div className="flex flex-col">
            <label className="text-lg font-medium mb-2">Upload Image (Max 2MB)</label>
            <div className="flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="hidden"
                ref={fileInputRef}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition duration-300"
              >
                <Paperclip size={24} />
              </button>
              {previewUrl && (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="ml-4 w-16 h-16 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* Artist dropdown */}
          <div className="flex flex-col">
            <label className="text-lg font-medium mb-2" htmlFor="artist-select">
              Select Artist
            </label>
            <select
              id="artist-select"
              value={selectedArtistId}
              onChange={handleArtistChange}
              required
              className="border border-gray-300 bg-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">-- Select an artist --</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-medium mb-2">Description</label>
            <textarea
              placeholder="Add a description"
              value={description}
              onChange={handleDescriptionChange}
              className="border border-gray-300 bg-white p-2 rounded-md h-24 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 transition duration-300"
          >
            Upload Image
          </motion.button>
        </motion.form>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {images.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-100 rounded-lg shadow-xl overflow-hidden group perspective"
              >
                <div className="relative w-full h-64 transition-all duration-500 preserve-3d group-hover:my-rotate-y-180">
                  <div className="absolute backface-hidden w-full h-full">
                    <img
                      src={image.image_url || "/placeholder.svg"}
                      alt="Tattoo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute my-rotate-y-180 backface-hidden w-full h-full bg-gray-200 overflow-hidden">
                    <div className="text-center flex flex-col items-center justify-center h-full text-gray-700 px-2 pb-24">
                      {image.description || "No description"}
                      {image.artist && (
                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          Artist: {image.artist.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 flex justify-center w-full p-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(image.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AdminTattooGallery
