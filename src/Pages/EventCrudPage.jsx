import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { gsap } from "gsap"
import Subnav from "../components/subnavbar"

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const fetchEvents = async () => {
  const { data } = await axios.get("/events")
  return data
}

const EventCrudPage = () => {
  const navigate = useNavigate()
  const userRole = localStorage.getItem("user_role")
  const authToken = localStorage.getItem("auth_token")
  const queryClient = useQueryClient()
  const pageRef = useRef(null)
  const eventsRef = useRef([])

  if (authToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`
  }

  const {
    data: events = [],
    isLoading: isFetchingEvents,
    error,
  } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  })

  const [isAdding, setIsAdding] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    available_tickets: "",
    image: null,
  })

  const [editEventId, setEditEventId] = useState(null)
  const [isImageLoading, setIsImageLoading] = useState(false)

  const addEventMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await axios.post("/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events"])
      setIsAdding(false)
    },
  })

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await axios.post(`/events/${id}?_method=PUT`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events"])
      setIsAdding(false)
      setEditEventId(null)
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      await axios.delete(`/events/${eventId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["events"])
    },
  })

  const handleEditClick = (event) => {
    setEditEventId(event.id)
    setNewEvent({
      name: event.name,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price,
      available_tickets: event.available_tickets,
      image: null,
    })
    setIsAdding(true)
  }

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId)
    }
  }

  const handleGetTickets = (eventId) => {
    navigate(`/ticket-purchase/${eventId}`)
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    Object.keys(newEvent).forEach((key) => {
      formData.append(key, newEvent[key])
    })

    if (editEventId) {
      updateEventMutation.mutate({ id: editEventId, formData })
    } else {
      addEventMutation.mutate(formData)
    }
  }

  const handleChange = (e) => {
    setNewEvent((prevEvent) => ({ ...prevEvent, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e) => {
    setIsImageLoading(true)
    setNewEvent((prevEvent) => ({ ...prevEvent, image: e.target.files[0] }))
    setIsImageLoading(false)
  }

  useEffect(() => {
    // Page entrance animation
    gsap.from(pageRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
    })

    // Events staggered animation
    if (events?.length > 0) {
      gsap.from(eventsRef.current, {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.5,
      })
    }
  }, [events])

  if (isFetchingEvents) {
    return <div className="text-center py-10 text-xl">Loading events...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error.message}</div>
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-black">
      <Subnav
        backButton={true}
        navItems={[
          { title: "Home", path: "/" },
          { title: "Events", path: "/events" },
          { title: "About", path: "/aboutus" },
          { title: "FAQs", path: "/faq" },
        ]}
      />
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800">Events</h1>
      </header>

      {userRole === "admin" && (
        <div className="mb-6 text-center">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Add New Event
          </button>
        </div>
      )}

      {isAdding ? (
        <div className="bg-white p-6 shadow-xl rounded-lg mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">{editEventId ? "Edit Event" : "Add Event"}</h2>
          <form onSubmit={handleAddEvent} encType="multipart/form-data">
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={newEvent.name}
                onChange={handleChange}
                required
                placeholder="Event Name"
                className="w-full p-3 border rounded"
              />
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleChange}
                required
                placeholder="Description"
                className="w-full p-3 border rounded"
              />
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded"
              />
              <input
                type="time"
                name="time"
                value={newEvent.time}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded"
              />
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={handleChange}
                required
                placeholder="Location"
                className="w-full p-3 border rounded"
              />
              <input
                type="number"
                name="price"
                value={newEvent.price}
                onChange={handleChange}
                required
                placeholder="Price"
                className="w-full p-3 border rounded"
              />
              <input
                type="number"
                name="available_tickets"
                value={newEvent.available_tickets}
                onChange={handleChange}
                required
                placeholder="Available Tickets"
                className="w-full p-3 border rounded"
              />
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                required
                className="w-full p-3 border rounded"
              />
              {isImageLoading && <p className="text-center text-blue-500 mt-2">Image is loading...</p>}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                  {editEventId ? "Update Event" : "Save Event"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length === 0 ? (
            <div className="text-center text-gray-500 col-span-full">No upcoming events available</div>
          ) : (
            events.map((event, index) => (
              <div
                key={event.id}
                ref={(el) => (eventsRef.current[index] = el)}
                className="bg-white shadow-xl rounded-lg overflow-hidden"
              >
                <div className="w-full h-56 bg-gray-200 relative">
                  {isFetchingEvents && <div className="absolute inset-0 flex justify-center items-center text-white">Loading Image...</div>}
                  <img
                    src={event.image_url || "/placeholder.svg?height=224&width=400"}
                    alt={event.name}
                    className="w-full h-56 object-cover"
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => setIsImageLoading(false)}
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800">{event.name}</h2>
                  <p className="text-gray-600 mt-2">{event.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-500">{new Date(event.date).toLocaleDateString()} {event.time}</span>
                    <span className="font-semibold text-black-600">NPR {event.price}</span>
                  </div>
                  <p className="text-gray-500 mt-2">{event.location}</p>
                  {userRole === "admin" ? (
                    <>
                      <button
                        onClick={() => handleEditClick(event)}
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 w-full mt-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 w-full mt-2"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleGetTickets(event.id)}
                      className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-700 w-full mt-3"
                    >
                      Get Tickets
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default EventCrudPage
