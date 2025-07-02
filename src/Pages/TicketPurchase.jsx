

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import { Calendar, DollarSign, Ticket, Minus, Plus } from "lucide-react"

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const TicketPurchasePage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        })
        setEvent(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching event data:", error)
        setError("Failed to load event data. Please try again later.")
        setLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  const handlePurchase = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data")) || {}

      const response = await axios.post(
        "/tickets/purchase",
        {
          event_id: eventId,
          event_name: event.name,
          event_date: event.date,
          event_price: event.price,
          available_tickets: event.available_tickets,
          event_description: event.description,
          event_image: event.image_url,
          quantity,
          payment_method: "khalti",
          user_id: userData.id,
          user_name: userData.name,
          user_role: userData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        },
      )
      if (response.data.khalti_url) {
        window.location.href = response.data.khalti_url
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error)
    }
  }

  const handlePaymentSuccess = useCallback(
    async (paymentData) => {
      try {
        const response = await axios.post("/tickets/verify-khalti-payment", paymentData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        })

        if (response.data.message === "Payment successful") {
          navigate(`/tickets/${response.data.ticket.id}`)
        } else {
          alert("Payment verification failed")
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        alert("Error verifying payment")
      }
    },
    [navigate],
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get("status")
    if (paymentStatus === "success") {
      const paymentData = {
        pidx: params.get("pidx"),
        amount: params.get("amount"),
        mobile: params.get("mobile"),
        purchase_order_id: params.get("purchase_order_id"),
        purchase_order_name: params.get("purchase_order_name"),
      }
      handlePaymentSuccess(paymentData)
    }
  }, [handlePaymentSuccess])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6 text-xl text-red-600">
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {error}
        </motion.div>
      </div>
    )
  }

  if (!event) return null

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
        Purchase Tickets
      </motion.h1>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <motion.div
          className="mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src={event.image_url || "/placeholder.svg?height=400&width=800"}
            alt={event.name}
            className="w-full h-[400px] object-cover"
          />
        </motion.div>

        <div className="p-6">
          <motion.h2
            className="text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {event.name}
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {event.description}
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="w-5 h-5" />
              <span>NRS {event.price}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Ticket className="w-5 h-5" />
              <span>{event.available_tickets} tickets available</span>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>Location: {event.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>Time: {new Date(event.date).toLocaleTimeString()}</span>
            </div>
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <label className="block text-lg font-semibold text-gray-700 mb-2">Ticket Quantity</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition duration-300"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(event.available_tickets, quantity + 1))}
                className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition duration-300"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={handlePurchase}
              className="w-full px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300"
            >
              Purchase {quantity} Ticket{quantity > 1 ? "s" : ""} via Khalti
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default TicketPurchasePage
