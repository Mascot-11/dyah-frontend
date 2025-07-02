import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { format, isAfter, startOfToday } from "date-fns"
import axios from "axios"
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import { Users, Calendar, ImageIcon, MessageCircle, Brush, DollarSign } from "lucide-react"
import { ClimbingBoxLoader } from "react-spinners"
import { motion } from "framer-motion"
import { ToastContainer, toast } from "react-toastify"


const Dashboard = () => {
<ToastContainer/>
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    totalImages: 0,
    ongoingChats: 0,
    appointmentStatus: [],
    appointmentsByDate: [],
    userRegistrations: [],
    totalArtists: 0,
    artistsData: [],
    pendingAppointmentsByDate: [],
    artistsPopularity: [],
    totalActiveEvents: 0,
    events: [],
    totalPayments: 0,
    payments: [],
  })
  const checkLogin = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      toast.error("You must be logged in to view this page.", {
        autoClose: 6000, 
      });
      setTimeout(() => {
        window.location.href = "/login"; 
      }, 6000);
    }
  };
  
  const [loading, setLoading] = useState(true)
  const [setShowModal] = useState(false)
  const BASE_URL = import.meta.env.VITE_API_URL;
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
  
  const fetchPayments = async (headers) => {
    try {
      const response = await axios.get(`${BASE_URL}/payments/all`, { headers })
      return response.data.payments || []
    } catch (error) {
      console.error("Error fetching payments:", error)
      return []
    }
  }
  useEffect(() => {
    checkLogin();
    const fetchStats = async () => {
      const authToken = localStorage.getItem("auth_token")

      if (!authToken) {
        console.error("No authentication token found")
        return
      }

      try {
        const headers = {
          Authorization: `Bearer ${authToken}`,
        }

        const users = await axios.get(`${BASE_URL}/users`, {
          headers,
        })
        const appointments = await axios.get(`${BASE_URL}/appointments`, { headers })
        const gallery = await axios.get(`${BASE_URL}/tattoo-gallery`, { headers })
        const chats = await axios.get("/chats", {
          headers,
        })
        const artists = await axios.get("/artists", {
          headers,
        })
        const events = await axios.get("/events", { headers })


        const payments = await fetchPayments(headers)

        const appointmentStatus = appointments.data.reduce(
          (acc, appointment) => {
            if (appointment.status === "confirmed") {
              acc.confirmed += 1
            } else if (appointment.status === "pending") {
              acc.pending += 1
            } else {
              acc.completed += 1
            }
            return acc
          },
          { confirmed: 0, pending: 0, completed: 0 },
        )

        const appointmentsByDate = appointments.data.map((appointment) => ({
          date: appointment.created_at.split("T")[0],
          appointments: 1,
        }))

        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        const userRegistrations = users.data
          .filter((user) => new Date(user.created_at) > threeMonthsAgo)
          .reduce((acc, user) => {
            const date = user.created_at.split("T")[0]
            acc[date] = (acc[date] || 0) + 1
            return acc
          }, {})

        const formattedUserRegistrations = Object.keys(userRegistrations).map((date) => ({
          date,
          registrations: userRegistrations[date],
        }))

        const pendingAppointmentsByDate = appointments.data
          .filter((appointment) => appointment.status === "pending")
          .map((appointment) => ({
            date: appointment.created_at.split("T")[0],
            appointments: 1,
          }))

        const artistsPopularity = appointments.data.reduce((acc, appointment) => {
          const artistId = appointment.artist_id
          if (!acc[artistId]) acc[artistId] = 0
          acc[artistId]++
          return acc
        }, {})

        const formattedArtistsPopularity = Object.keys(artistsPopularity).map((artistId) => {
          const artist = artists.data.find((a) => a.id === Number.parseInt(artistId))
          return {
            artistName: artist ? artist.name : `Artist ${artistId}`,
            appointments: artistsPopularity[artistId],
          }
        })

       
        const today = startOfToday()
        const activeEvents = events.data.filter((event) => {
          const eventDate = new Date(event.date || event.event_date)
          return isAfter(eventDate, today) || format(eventDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
        })

       
        let totalPayments = 0
        if (Array.isArray(payments)) {
          payments.forEach((payment) => {
           
            let amount = 0
            if (payment.total_amount !== undefined) {
              amount = Number.parseFloat(payment.total_amount) || 0
            } else if (payment.amount !== undefined) {
              amount = Number.parseFloat(payment.amount) || 0
            } else if (payment.price !== undefined && payment.quantity !== undefined) {
       
              const price = Number.parseFloat(payment.price) || 0
              const quantity = Number.parseFloat(payment.quantity) || 0
              amount = price * quantity
            }

    
            if (payment.status === "Completed") {
              totalPayments += amount
            }
          })
        }

        setStats({
          totalUsers: users.data.length,
          totalAppointments: appointments.data.length,
          pendingAppointments: appointments.data.filter((a) => a.status === "pending").length,
          totalImages: gallery.data.length,
          ongoingChats: chats.data.length,
          appointmentStatus,
          appointmentsByDate,
          userRegistrations: formattedUserRegistrations,
          totalArtists: artists.data.length,
          artistsData: artists.data,
          pendingAppointmentsByDate,
          artistsPopularity: formattedArtistsPopularity,
          totalActiveEvents: activeEvents.length,
          events: activeEvents,
          totalPayments: totalPayments,
          payments: payments,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching stats", error)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const pieData = [
    { name: "Confirmed", value: stats.appointmentStatus.confirmed },
    { name: "Pending", value: stats.appointmentStatus.pending },
  ]

  
  const formattedTotalPayments = stats.totalPayments.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  
  const paymentsByEvent = stats.payments.reduce((acc, payment) => {
    // Only include completed payments
    if (payment.status !== "Completed") {
      return acc
    }


    const eventName =
      (payment.event && payment.event.name) || payment.event_name || `Event #${payment.event_id}` || "Unknown Event"

    if (!acc[eventName]) {
      acc[eventName] = 0
    }

    
    let amount = 0
    if (payment.total_amount !== undefined) {
      amount = Number.parseFloat(payment.total_amount) || 0
    } else if (payment.amount !== undefined) {
      amount = Number.parseFloat(payment.amount) || 0
    } else if (payment.price !== undefined && payment.quantity !== undefined) {
      const price = Number.parseFloat(payment.price) || 0
      const quantity = Number.parseFloat(payment.quantity) || 0
      amount = price * quantity
    }

    acc[eventName] += amount
    return acc
  }, {})

  const paymentChartData = Object.keys(paymentsByEvent).map((eventName) => ({
    name: eventName,
    amount: paymentsByEvent[eventName],
  }))

  return (
    <div className="min-h-screen h-full bg-gray-50">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <ClimbingBoxLoader color="#000000" size={30} />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-6"
        >
         

          {/* Stats Cards - Made smaller and more compact */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            <StatsCard title="Users" value={stats.totalUsers} icon={<Users className="w-5 h-5" />} color="#000000" />
            <StatsCard
              title="Appointments"
              value={stats.totalAppointments}
              icon={<Calendar className="w-5 h-5" />}
              color="#000000"
            />
            <StatsCard
              title="Gallery Items"
              value={stats.totalImages}
              icon={<ImageIcon className="w-5 h-5" />}
              color="#000000"
            />
            <StatsCard
              title="Active Chats"
              value={stats.ongoingChats}
              icon={<MessageCircle className="w-5 h-5" />}
              color="#000000"
            />
            <StatsCard
              title="Artists"
              value={stats.totalArtists}
              icon={<Brush className="w-5 h-5" />}
              color="#000000"
              onClick={() => setShowModal(true)}
            />
            
          </div>

          

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-4 lg:col-span-1"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">User Growth</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.userRegistrations}>
                  <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="registrations"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{ fill: "#000000", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 lg:col-span-1"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">Appointment Status</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#000000" : "#9CA3AF"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-4 lg:col-span-1"
            >
              <h2 className="text-base font-semibold text-gray-900 mb-4">Artist Performance</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.artistsPopularity}>
                  <XAxis dataKey="artistName" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="appointments" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paymentChartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <h2 className="text-base font-semibold text-gray-900 mb-4">Payments by Event</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={paymentChartData}>
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [`NPR ${value.toFixed(2)}`, "Amount"]}
                    />
                    <Bar dataKey="amount" fill="#4B5563" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Recent Payments - Compact version */}
            {stats.payments.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Payments</h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.payments.slice(0, 5).map((payment, index) => (
                          <tr key={payment.id || index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                              {payment.transaction_id?.substring(0, 8) || "N/A"}...
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                              {payment.user?.name || `User #${payment.user_id}`}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                              {payment.event?.name || `Event #${payment.event_id}`}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                              NPR{" "}
                              {payment.total_amount ||
                                (Number.parseFloat(payment.price) * Number.parseFloat(payment.quantity)).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  payment.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <ToastContainer />
        </motion.div>
      )}
    </div>
    
  )
}

const StatsCard = ({ title, value, icon, color, onClick, isMonetary }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow duration-300"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <p className="text-xl font-bold text-gray-800">{isMonetary ? `NPR ${value}` : value}</p>
      </div>
      <p className="text-xs font-medium text-gray-500">{title}</p>
    </motion.div>
  )
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  isMonetary: PropTypes.bool,
}

StatsCard.defaultProps = {
  isMonetary: false,
}

export default Dashboard

