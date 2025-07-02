import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTachometerAlt,
  FaImages,
  FaCalendarAlt,
  FaUsers,
  FaComments,
  FaDollarSign,
  FaImage,
  FaEye,
} from "react-icons/fa";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/admin/dashboard") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [location]);

  const sidebarVariants = {
    open: { width: "16rem", transition: { duration: 0.3 } },
    closed: { width: "3rem", transition: { duration: 0.3 } },
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/admin/tattoo-gallery", icon: FaImages, label: "Tattoo Gallery" }, // or FaPalette
    { path: "/admin/appointments", icon: FaCalendarAlt, label: "Appointments" },
    { path: "/admin/users", icon: FaUsers, label: "Manage Users" },
    { path: "/chat", icon: FaComments, label: "Chats" },
    { path: "/admin/customer-payments", icon: FaDollarSign, label: "Payments" },
    { path: "/admin/banner", icon: FaImage, label: "Banner" },
    { path: "/admin/site-views", icon: FaEye, label: "Views" },
  ];
  return (
    <motion.div
    className="h-screen bg-black text-white fixed top-0 left-0 z-50 overflow-hidden shadow-lg flex flex-col"
    initial={isOpen ? "open" : "closed"}
    animate={isOpen ? "open" : "closed"}
    variants={sidebarVariants}
  >
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        className="text-xl font-semibold tracking-wider"
      >
        Admin Panel
      </motion.h2>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white focus:outline-none"
      >
        {isOpen ? "Collapse" : "Expand"}
      </button>
    </div>
    <nav className="flex-grow py-4 overflow-y-auto">
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className="flex items-center py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
            >
              <item.icon
                className="text-xl mr-3"
              />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  className="text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </motion.div>
  );
};

export default AdminSidebar;