import { useState, useEffect, createContext, useContext } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HelmetProvider } from "react-helmet-async"
import AboutPage from "./Pages/aboutus"
import NavBar from "./components/navbar"
import Landing from "./Pages/Landing"
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import Music from "./Pages/music"
import Tattoo from "./Pages/tattoo"
import ForgotPassword from "./Pages/forgotpassword"
import ResetPassword from "./Pages/passwordrest"
import AppointmentPage from "./Pages/appointment"
import AppointmentsList from "./Pages/AdminAppointment"
import UserList from "./Pages/userlist"
import MyAppointments from "./Pages/myaapointment"
import Dashboard from "./Pages/AdminDashboard"
import Chat from "./Pages/Chat"
import FAQ from "./Pages/Faq"
import { login } from "./Utils/api"
import TattooGallery from "./Pages/TattooGallery"
import AdminTattooGallery from "./Pages/AdminTattooGallery"
import AdminLayout from "./components/AdminLayout"
import ChatPopup from "./components/ChatPop"
import UserPayments from "./Pages/User Payment"
import AllPayments from "./Pages/AllPayments"
import Footer from "./components/Footer"
import AdminBannerEditor from "./Pages/AdminBanner"
import AdminCustomerPayment from "./Pages/AdminCustomerPayments"
import ViewLogger from "./components/ViewLogger"
import AdminSiteViews from "./Pages/AdminViews";
import ProfilePage from "./Pages/Profile"

// Auth Context Setup
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isUserLoggedIn } = useAuth()
  const location = useLocation()

  if (!isUserLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

const queryClient = new QueryClient()

function AppContent() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token")
      const role = localStorage.getItem("user_role")

      if (token && role) {
        setIsUserLoggedIn(true)
        setUserRole(role)
      } else {
        setIsUserLoggedIn(false)
        setUserRole("")
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogin = async (credentials) => {
    try {
      const data = await login(credentials)
      localStorage.setItem("auth_token", data.access_token)
      localStorage.setItem("user_role", data.role)
      setIsUserLoggedIn(true)
      setUserRole(data.role)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    setIsUserLoggedIn(false)
    setUserRole("")
  }

  const location = useLocation()
  const routesWithoutNavBar = ["/events", "/music"]
  const showNavBar = !routesWithoutNavBar.includes(location.pathname)

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      {showNavBar && <NavBar onLogin={handleLogin} onLogout={handleLogout} />}
      {userRole !== "admin" && <ChatPopup />}
      <div className={showNavBar ? "content-with-navbar" : "content"}>
        <ViewLogger />
        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/music" element={<Music />} />
          <Route path="/tattoo" element={<Tattoo />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/gallery" element={<TattooGallery />} />
          <Route path="/aboutus" element={<AboutPage />} />
          <Route
            path="/profile"
            element={
              
                <ProfilePage />
              }
          />

          <Route
            path="/myappointments"
            element={
             
                <MyAppointments />
              
            }
          />
          <Route
            path="/userpayments"
            element={
              <ProtectedRoute>
                <UserPayments />
              </ProtectedRoute>
            }
          />

          <Route path="/landing" element={<Landing />} />

          <Route element={<AdminLayout />}>
            <Route path="/admin/landing" element={<Landing />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/appointments" element={<AppointmentsList />} />
            <Route path="/admin/tattoo-gallery" element={<AdminTattooGallery />} />
            <Route path="/admin/payments" element={<AllPayments />} />
            <Route path="/admin/banner" element={<AdminBannerEditor />} />
            <Route path="/admin/customer-payments" element={<AdminCustomerPayment />} />
            <Route path="/admin/site-views" element={<AdminSiteViews />} />
          </Route>

          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ isUserLoggedIn: false, userRole: "" }}>
          <Router>
            <AppContent />
          </Router>
        </AuthContext.Provider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
