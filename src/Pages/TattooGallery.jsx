import { useState, useEffect, useRef, useCallback } from "react"
import axios from "axios"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Subnav from "../components/subnavbar"

gsap.registerPlugin(ScrollTrigger)

const IMAGES_PER_PAGE = 9

const TattooGallery = () => {
  const BASE_URL = import.meta.env.VITE_API_URL
  const [images, setImages] = useState([])
  const [filteredImages, setFilteredImages] = useState([])
  const [displayedImages, setDisplayedImages] = useState([])
  const [artists, setArtists] = useState({})
  const [selectedArtist, setSelectedArtist] = useState("all")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const containerRef = useRef(null)
  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    setLoading(true)

    const fetchGallery = axios.get(`${BASE_URL}/tattoo-gallery`)
    const fetchArtists = axios.get(`${BASE_URL}/artists`)

    Promise.all([fetchGallery, fetchArtists])
      .then(([galleryRes, artistsRes]) => {
        const allImages = galleryRes.data
        const artistsObj = {}
        artistsRes.data.forEach((artist) => {
          artistsObj[artist.id] = artist.name
        })
        setArtists(artistsObj)

        const savedArtistId = localStorage.getItem("selectedArtistId")
        if (savedArtistId) {
          setSelectedArtist(savedArtistId)
          localStorage.removeItem("selectedArtistId")
        }

        setImages(allImages)
        setFilteredImages(allImages)
        setDisplayedImages(allImages.slice(0, IMAGES_PER_PAGE))
        setHasMore(allImages.length > IMAGES_PER_PAGE)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching data", error)
        toast.error("Failed to fetch gallery or artists")
        setLoading(false)
      })
  }, [])

  // Scroll to gallery if artist is in URL query
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const artistParam = urlParams.get("artist")

    if (artistParam) {
      setSelectedArtist(artistParam)

      setTimeout(() => {
        const section = document.getElementById("tattoo-gallery")
        if (section) {
          section.scrollIntoView({ behavior: "smooth" })
        }
      }, 500)
    }
  }, [])
useEffect(() => {
  window.scrollTo(0, 0)
}, [])
  useEffect(() => {
    if (selectedArtist === "all") {
      setFilteredImages(images)
    } else {
      setFilteredImages(images.filter((img) => img.artist_id === Number(selectedArtist)))
    }
    setPage(1)
    setDisplayedImages([])
    setHasMore(true)
  }, [selectedArtist, images])

  useEffect(() => {
    setDisplayedImages(filteredImages.slice(0, IMAGES_PER_PAGE))
    setHasMore(filteredImages.length > IMAGES_PER_PAGE)
    setPage(1)
  }, [filteredImages])

  const loadMoreImages = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    const nextPage = page + 1
    const startIndex = (nextPage - 1) * IMAGES_PER_PAGE
    const endIndex = nextPage * IMAGES_PER_PAGE

    setTimeout(() => {
      const newImages = filteredImages.slice(startIndex, endIndex)
      setDisplayedImages((prev) => [...prev, ...newImages])
      setPage(nextPage)
      setHasMore(endIndex < filteredImages.length)
      setLoadingMore(false)
    }, 800)
  }, [loadingMore, hasMore, page, filteredImages])

  useEffect(() => {
    if (loading) return

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreImages()
      }
    }, options)

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, hasMore, loadMoreImages])

  useEffect(() => {
    if (!loading && containerRef.current) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

      const imageContainers = containerRef.current.querySelectorAll(".image-container")

      imageContainers.forEach((container, index) => {
        const column = index % 3
        let xStart = 0

        if (column === 0) {
          xStart = -100
        } else if (column === 2) {
          xStart = 100
        }

        gsap.set(container, {
          opacity: 0,
          x: xStart,
          y: 30,
        })

        gsap.to(container, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top bottom-=50",
            end: "center center",
            toggleActions: "play none none none",
          },
          delay: 0.2 + index * 0.15,
        })
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [loading, displayedImages])

  return (
    <div className="min-h-screen bg-black text-white">
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
      />

      {/* 👇 id added here for scrolling */}
      <div id="tattoo-gallery" className="container mx-auto px-4 py-6">
        {/* Filter */}
        <div className="flex justify-end mb-8">
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="bg-black text-white border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <option value="all">All Artists</option>
            {Object.entries(artists).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center mt-6 text-xl">Loading images...</p>
        ) : (
          <>
            <div ref={containerRef} className="max-w-7xl mx-auto rounded-xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto gap-4">
                {displayedImages.map((image, index) => {
                  const spans = [
                    "md:col-span-2 md:row-span-2",
                    "",
                    "",
                    "md:col-span-1 md:row-span-2",
                    "md:col-span-2 md:row-span-1",
                    "",
                    "md:col-span-2 md:row-span-1",
                    "",
                    "md:col-span-1 md:row-span-2",
                  ]

                  const spanClass = spans[index % spans.length]

                  return (
                    <div
                      key={image.id}
                      className={`relative rounded-xl overflow-hidden shadow-md ${spanClass} image-container`}
                    >
                      <div className="relative w-full h-full aspect-square">
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt="Tattoo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 w-full p-3 bg-black bg-opacity-60 text-white">
                          <p className="text-base font-medium">{image.description || "No description"}</p>
                          {artists[image.artist_id] && (
                            <p className="mt-1 text-sm font-semibold">Artist: {artists[image.artist_id]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div ref={loadMoreRef} className="mt-12 text-center">
                {loadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                  </div>
                )}
                {!hasMore && displayedImages.length > 0 && (
                  <p className="text-gray-400 py-8">You have reached the end of the gallery</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TattooGallery
