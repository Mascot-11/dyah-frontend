import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaUser,
  FaTicketAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa"

const AllPayments = () => {
  const [payments, setPayments] = useState([])
  const [events, setEvents] = useState({})
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState("newest")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState(null)
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;

  const [currentPage, setCurrentPage] = useState(1)
  const [paymentsPerPage] = useState(6)

  useEffect(() => {
    const fetchPaymentsAndEvents = async () => {
      try {
        const token = localStorage.getItem("auth_token")

      
        const paymentsResponse = await axios.get("/payments/all", {
          headers: { Authorization: `Bearer ${token}` },
        })

        
        setTimeout(() => {
          setPayments(paymentsResponse.data.payments)
        }, 500)

        
        const eventsResponse = await axios.get("/events")
        const eventMap = {}
        eventsResponse.data.forEach((event) => {
          eventMap[event.id] = {
            name: event.name,
            location: event.location,
            date: event.date,
            time: event.time,
            price: event.price,
            image_url: event.image_url,
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

    fetchPaymentsAndEvents()
  }, [])

 
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

 
  const getSortedPayments = () => {
    if (!payments.length) return []

    const filtered = searchTerm
      ? payments.filter(
          (payment) =>
            (payment.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (events[payment.event_id]?.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : [...payments]

    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()

      if (sortOrder === "newest") {
        return dateB - dateA
      } else if (sortOrder === "oldest") {
        return dateA - dateB
      } else if (sortOrder === "highest") {
        return b.total_amount - a.total_amount
      } else if (sortOrder === "lowest") {
        return a.total_amount - b.total_amount
      }
      return 0
    })
  }

  
  const sortedPayments = getSortedPayments()
  const indexOfLastPayment = currentPage * paymentsPerPage
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
  const currentPayments = sortedPayments.slice(indexOfFirstPayment, indexOfLastPayment)
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage)

  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment)
  }

  const closeModal = () => {
    setSelectedPayment(null)
  }


  const SkeletonCard = () => (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
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
        <h1 className="text-3xl font-bold mb-2">All Payments</h1>
        {!loading && <p className="text-lg text-gray-600">{sortedPayments.length} payment records found</p>}
      </motion.div>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search by user or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {currentPayments.length > 0 ? (
              currentPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                  className="w-full"
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 bg-white">
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-bold text-lg mb-2 truncate">
                            {events[payment.event_id]?.name || "Unknown Event"}
                          </h3>
                          <div className="flex items-center text-gray-700 mb-1">
                            <FaUser className="mr-2 text-gray-500" />
                            <span className="truncate">{payment.user?.name || "Unknown User"}</span>
                          </div>
                          <div className="flex items-center text-gray-700 mb-1">
                            <FaTicketAlt className="mr-2 text-gray-500" />
                            <span>Quantity: {payment.quantity}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-700 mb-1">
                            <FaCreditCard className="mr-2 text-gray-500" />
                            <span>{payment.payment_method}</span>
                          </div>
                          <div className="flex items-center text-gray-700 mb-1">
                            <FaCalendarAlt className="mr-2 text-gray-500" />
                            <span>{formatDate(payment.created_at)}</span>
                          </div>
                          {payment.transaction_id && (
                            <div className="flex items-center text-gray-700 mb-1">
                              <span className="text-xs text-gray-500">
                                Transaction ID: {payment.transaction_id.substring(0, 10)}...
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-between items-end">
                          <div className="flex items-center text-xl font-bold text-gray-900">
                            <FaMoneyBillWave className="mr-2 text-green-600" />
                            <span>Rs. {payment.total_amount}</span>
                          </div>
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md flex items-center transition-colors"
                          >
                            <FaInfoCircle className="mr-2" />
                            View Details
                          </button>
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
                className="text-center py-12 border border-gray-200 rounded-lg"
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5"
                  />
                </svg>
                <p className="mt-2 text-xl font-semibold text-gray-500">No payments found</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex justify-center items-center mt-8 space-x-2"
            >
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md flex items-center ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaChevronLeft className="mr-1" size={12} />
                Prev
              </button>

              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  // Show limited page numbers with ellipsis
                  if (
                    index + 1 === 1 ||
                    index + 1 === totalPages ||
                    (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`w-8 h-8 rounded-md ${
                          currentPage === index + 1
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  } else if (
                    (index + 1 === currentPage - 2 && currentPage > 3) ||
                    (index + 1 === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <span key={index}>...</span>
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md flex items-center ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
                <FaChevronRight className="ml-1" size={12} />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {events[selectedPayment.event_id]?.image_url ? (
                  <img
                    src={events[selectedPayment.event_id].image_url || "/placeholder.svg"}
                    alt={events[selectedPayment.event_id]?.name || "Event"}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No event image available</span>
                  </div>
                )}
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  ✕
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white font-bold text-xl">
                    {events[selectedPayment.event_id]?.name || "Unknown Event"}
                  </h3>
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

                      <div className="flex items-center">
                        <FaTicketAlt className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-semibold">{selectedPayment.quantity} ticket(s)</p>
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
                        <FaUser className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-semibold">{selectedPayment.user?.name || "Unknown User"}</p>
                        </div>
                      </div>

                      {selectedPayment.user?.email && (
                        <div className="flex items-start">
                          <FaUser className="mr-2 text-gray-700 w-5 h-5 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold break-all">{selectedPayment.user.email}</p>
                          </div>
                        </div>
                      )}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events[selectedPayment.event_id]?.date && (
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Event Date</p>
                          <p className="font-semibold">{formatDate(events[selectedPayment.event_id].date)}</p>
                        </div>
                      </div>
                    )}

                    {events[selectedPayment.event_id]?.time && (
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Event Time</p>
                          <p className="font-semibold">{formatTime(events[selectedPayment.event_id].time)}</p>
                        </div>
                      </div>
                    )}

                    {events[selectedPayment.event_id]?.location && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-semibold">{events[selectedPayment.event_id].location}</p>
                        </div>
                      </div>
                    )}

                    {events[selectedPayment.event_id]?.price && (
                      <div className="flex items-center">
                        <FaMoneyBillWave className="mr-2 text-gray-700 w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Ticket Price</p>
                          <p className="font-semibold">Rs. {events[selectedPayment.event_id].price}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-500">Payment Summary</p>
                    <div className="flex justify-between items-center mt-2">
                      <span>Ticket Price × {selectedPayment.quantity}</span>
                      <span>
                        Rs.{" "}
                        {events[selectedPayment.event_id]?.price
                          ? events[selectedPayment.event_id].price * selectedPayment.quantity
                          : selectedPayment.total_amount}
                      </span>
                    </div>
                    {events[selectedPayment.event_id]?.price &&
                      events[selectedPayment.event_id].price * selectedPayment.quantity !==
                        selectedPayment.total_amount && (
                        <>
                          <div className="flex justify-between items-center mt-1">
                            <span>Fees & Taxes</span>
                            <span>
                              Rs.{" "}
                              {selectedPayment.total_amount -
                                events[selectedPayment.event_id].price * selectedPayment.quantity}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300 font-bold">
                            <span>Total</span>
                            <span>Rs. {selectedPayment.total_amount}</span>
                          </div>
                        </>
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

export default AllPayments

