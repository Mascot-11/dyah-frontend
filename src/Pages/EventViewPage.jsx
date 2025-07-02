import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const EventViewPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setError("Failed to load event data. Please try again later.");
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-xl text-red-600">
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {error}
        </motion.div>
      </div>
    );
  }

  if (!event) return null;

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {event.name}
      </motion.h1>

      <motion.div
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={event.image_url || "/placeholder.svg?height=400&width=800"}
          alt={event.name}
          className="w-full h-[400px] object-cover rounded-xl shadow-lg"
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="font-semibold">Date:</span>
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span>Time: {formatTime(event.date)}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="font-semibold">Location:</span>
          <span>{event.location || "TBA"}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="font-semibold">Price:</span>
          <span>NPR{event.price}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="font-semibold">Available Tickets:</span>
          <span>{event.available_tickets}</span>
        </div>
      </motion.div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-4">About this event</h2>
        <AnimatePresence>
          <motion.p
            className="text-gray-600 leading-relaxed"
            initial={{ height: "80px", overflow: "hidden" }}
            animate={{
              height: showFullDescription ? "auto" : "80px",
            }}
            transition={{ duration: 0.5 }}
          >
            {event.description}
          </motion.p>
        </AnimatePresence>
        {event.description.length > 200 && (
          <button onClick={toggleDescription} className="mt-2 text-blue-600 hover:text-blue-800 focus:outline-none">
            {showFullDescription ? "Show less" : "Read more"}
          </button>
        )}
      </motion.div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <a
          href={`/ticket-purchase/${event.id}`}
          className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
        >
          Get Tickets
        </a>
      </motion.div>
    </motion.div>
  );
};

export default EventViewPage;