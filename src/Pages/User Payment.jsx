

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaEye,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaClock,
  FaTicketAlt,
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa"

const UserPayments = () => {
  const { userId: paramUserId } = useParams()
  const storedUserId = localStorage.getItem("user_id")
  const userId = storedUserId || paramUserId

  const [user, setUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [events, setEvents] = useState({})
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (!userId) {
      console.error("User ID is missing")
      setLoading(false)
      return
    }

    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("auth_token")

        
        const paymentsResponse = await axios.get(`payments/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setUser(paymentsResponse.data.user)

        
        setTimeout(() => {
          setPayments(paymentsResponse.data.payments)
        }, 700)

       
        const eventsResponse = await axios.get("/events")
        const eventMap = {}
        eventsResponse.data.forEach((event) => {
          eventMap[event.id] = {
            name: event.name,
            image_url: event.image_url,
            description: event.description,
            location: event.location,
            date: event.date,
            time: event.time,
            organizer: event.organizer,
          }
        })
        setEvents(eventMap)
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message)
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 800)
      }
    }

    fetchPayments()
  }, [userId])

  const handleOpenModal = (payment, eventId) => {
    const event = events[eventId]
    if (event) {
      setSelectedPayment(payment)
      setSelectedEvent(event)
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPayment(null)
    setSelectedEvent(null)
  }

  
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  
  const formatTime = (timeString) => {
    if (!timeString) return "N/A"

    try {
     
      let time
      if (timeString.includes("T")) {
       
        time = new Date(timeString)
      } else if (timeString.includes(":")) {
       
        const [hours, minutes] = timeString.split(":")
        time = new Date()
        time.setHours(hours, minutes)
      } else {
        return timeString 
      }

      return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      console.error("Error formatting time:", e)
      return timeString
    }
  }

  
  const getPaymentMethodColor = (method) => {
    return "bg-gray-500" 
  }


  const SkeletonCard = () => (
    <div className="w-full border rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 pb-2">
        <div className="h-6 w-2/3 bg-gray-300 rounded animate-pulse"></div>
      </div>
      <div className="p-4">
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-10 w-28 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Payment History</h1>
        {!loading && user && (
          <p className="text-lg text-gray-600">
            Viewing payment records for <span className="font-semibold text-gray-900">{user}</span>
          </p>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full"
                >
                  <div className="border rounded-lg overflow-hidden shadow-sm border-l-4 border-l-gray-900 hover:shadow-lg transition-shadow duration-300">
                    <div className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900">
                          {events[payment.event_id]?.name || "Unknown Event"}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs bg-purple-600 shadow-sm font-semibold rounded-full text-white ${getPaymentMethodColor(payment.payment_method)}`}
                        >
                          {payment.payment_method}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <FaMoneyBillWave className="mr-2 text-gray-800" />
                            <span className="font-medium text-gray-900">Rs. {payment.total_amount}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaCalendarAlt className="mr-2 text-gray-800" />
                            <span className="text-gray-900">{formatDate(payment.created_at)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <FaClock className="mr-2 text-gray-800" />
                            <span className="text-gray-900">Quantity: {payment.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end">
                          {events[payment.event_id] && (
                            <button
                              onClick={() => handleOpenModal(payment, payment.event_id)}
                              className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100 transition-colors"
                            >
                              <FaEye className="text-gray-900" />
                              <span>View Details</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="rounded-full bg-gray-200 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FaCreditCard className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Payments Found</h3>
                <p className="text-gray-500">You havent made any payments yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/*  Modal for viewing payment and event details */}
      <AnimatePresence>
        {isModalOpen && selectedPayment && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedEvent.image_url || "/placeholder.svg"}
                  alt={selectedEvent.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={handleCloseModal}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  ✕
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white font-bold text-xl">{selectedEvent.name}</h3>
                </div>
              </div>

              <div className="p-6">
                {/* Payment Details Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaMoneyBillWave className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-semibold">Rs. {selectedPayment.total_amount}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <FaCreditCard className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Payment Method</p>
                          <p className="font-semibold">{selectedPayment.payment_method}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Payment Date</p>
                          <p className="font-semibold">{formatDate(selectedPayment.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <FaTicketAlt className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-semibold">{selectedPayment.quantity} ticket(s)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedPayment.transaction_id && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.transaction_id}</p>
                    </div>
                  )}
                </div>

                {/* Event Details Section */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 border-b pb-2">Event Details</h4>

                  {selectedEvent.description && <p className="text-gray-700 mb-4">{selectedEvent.description}</p>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEvent.date && (
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Event Date</p>
                          <p className="font-semibold">{formatDate(selectedEvent.date)}</p>
                        </div>
                      </div>
                    )}

                    {selectedEvent.time && (
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Event Time</p>
                          <p className="font-semibold">{formatTime(selectedEvent.time)}</p>
                        </div>
                      </div>
                    )}

                    {selectedEvent.location && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-semibold">{selectedEvent.location}</p>
                        </div>
                      </div>
                    )}

                    {selectedEvent.organizer && (
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Organizer</p>
                          <p className="font-semibold">{selectedEvent.organizer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default UserPayments

