import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Palette,
  Music,
  UserPlus,
  LogIn,
  LogOut,
  X,
  Menu,
  DollarSign,
  Calendar,
  Image,
  Info,
  User,
} from "lucide-react";
import { FaPaintBrush } from "react-icons/fa";
import { RiAdminLine } from "react-icons/ri";

const NavBar = ({ onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");
    
    if (token && role) {
      setIsUserLoggedIn(true);
      setUserRole(role);
    } else {
      setIsUserLoggedIn(false);
      setUserRole("");
    }
  }, []);

  const handleLogout = () => {
    // Clear auth info from localStorage (or wherever you keep it)
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    setIsUserLoggedIn(false);
    setUserRole("");
    if (onLogout) onLogout();
    navigate("/login");
  };

  const menuItems = [
    { to: "/landing", text: "Home", icon: Home },
    { to: "/appointment", text: "Appointment", icon: Calendar },
    { to: "/gallery", text: "Gallery", icon: Image },
    ...(isUserLoggedIn && userRole !== "admin"
      ? [{ to: "/myappointments", text: "My Appointments", icon: FaPaintBrush }]
      : []),
    { to: "/aboutus", text: "About Us", icon: Info },

    ...(isUserLoggedIn && userRole === "admin"
      ? [{ to: "/admin/dashboard", text: "Admin Dashboard", icon: RiAdminLine }]
      : []),
       ...(isUserLoggedIn
    ? [{ to: "/profile", text: "Profile", icon: User}]
    : []),

    ...(isUserLoggedIn
      ? [{ to: "/login", text: "Logout", icon: LogOut, onClick: handleLogout }]
      : [
          { to: "/register", text: "Register", icon: UserPlus },
          { to: "/login", text: "Login", icon: LogIn, onClick: onLogin },
        ]),
  ];

  return (
    <nav className="sticky top-0 bg-black text-white z-10 shadow-lg w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/landing" className="text-2xl font-bold">
            Dyah Khyah
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-gray-400 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 flex items-center"
                  onClick={item.onClick ? item.onClick : undefined}
                >
                  <item.icon className="inline-block w-5 h-5 mr-2" />
                  {item.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black text-white">
          <div className="px-4 py-4 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-300"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsMenuOpen(false);
                }}
              >
                <item.icon className="inline-block w-5 h-5 mr-2" />
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
