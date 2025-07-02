import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { FaCheckCircle, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { ClimbingBoxLoader } from "react-spinners"
import { Eye } from "lucide-react"

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [appointmentsPerPage] = useState(5)
  axios.defaults.baseURL = import.meta.env.VITE_API_URL

  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        setError("No authentication token found.")
        setLoading(false)
        return
      }

      const response = await axios.get("/user/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setAppointments(Array.isArray(response.data) ? response.data : [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError("No appointments found.")
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const formatDate = (datetime) => {
    const date = new Date(datetime)
    if (isNaN(date)) return "Invalid date"
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const formatTime = (datetime) => {
    const date = new Date(datetime)
    if (isNaN(date)) return "Invalid time"
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const hour = hours % 12 || 12
    return `${hour}${minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : ""} ${ampm}`
  }

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment)
    if (appointment.image_url) setImageLoading(true)
  }

  const closeModal = () => {
    setSelectedAppointment(null)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const indexOfLastAppointment = currentPage * appointmentsPerPage
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment)
  const totalPages = Math.ceil(appointments.length / appointmentsPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  if (hasError) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <div className="text-center text-red-600 mt-10">Something went wrong. Please try again later.</div>
        </main>
        <footer className="mt-auto bg-gray-900 text-white p-4 text-center">© 2025 Dyah Khyah Tattoo. All rights reserved.</footer>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClimbingBoxLoader color="#4A90E2" size={15} loading={loading} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {appointments.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">No appointments found.</div>
        ) : (
          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Your Appointments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left text-gray-700 font-bold">Artist Name</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold">Date</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold">Time</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold">Status</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-bold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appointment) => {
                    const isPending = appointment.status === "pending"
                    return (
                      <tr
                        key={appointment.id}
                        className="appointment-row border-t hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 font-semibold text-gray-800">{appointment.artist_name}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{formatDate(appointment.appointment_datetime)}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{formatTime(appointment.appointment_datetime)}</td>
                        <td className="py-3 px-4 font-semibold">
                          <span className={`flex items-center ${isPending ? "opacity-50" : ""} ${
                            appointment.status === "confirmed" ? "text-green-500" : "text-yellow-500"
                          }`}>
                            {appointment.status === "confirmed" ? <FaCheckCircle className="mr-2" /> : <FaClock className="mr-2" />}
                            {appointment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleAppointmentClick(appointment)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Eye className="w-6 h-6" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
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
                              ? "bg-blue-500 text-white"
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
              </div>
            )}

            {selectedAppointment && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
                <div className="relative bg-white p-6 rounded-lg shadow-lg w-full sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-2xl overflow-hidden">
                  <button onClick={closeModal} className="absolute top-4 right-4 text-red-600 font-bold text-2xl">✖</button>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Appointment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Artist</p>
                      <p className="font-semibold text-gray-800">{selectedAppointment.artist_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-semibold ${
                        selectedAppointment.status === "confirmed" ? "text-green-500" : "text-yellow-500"
                      }`}>
                        {selectedAppointment.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold text-gray-800">{formatDate(selectedAppointment.appointment_datetime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-semibold text-gray-800">{formatTime(selectedAppointment.appointment_datetime)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-gray-800">{selectedAppointment.description || "No description provided"}</p>
                  </div>

                  {selectedAppointment.image_url && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Reference Image</p>
                      <div className="flex justify-center items-center bg-gray-100 rounded-lg p-2">
                        {imageLoading && (
                          <div className="absolute z-10">
                            <ClimbingBoxLoader color="#4A90E2" size={15} loading={true} />
                          </div>
                        )}
                        <img
                          src={selectedAppointment.image_url || "/placeholder.svg"}
                          alt="Appointment Reference"
                          className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                          loading="lazy"
                          onLoad={handleImageLoad}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto bg-gray-900 text-white p-4 text-center">
        © 2025 Dyah Khyah Tattoo. All rights reserved.
      </footer>
    </div>
  )
}

export default MyAppointments
