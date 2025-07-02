import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../Utils/api";

// Helper to get ordinal suffix for day number (1st, 2nd, 3rd, 4th, ...)
const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// Format date as "25th March 2025"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" }); // March
  const year = date.getFullYear();
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

// Format time as "11:05 am"
const formatTime = (dateString) => {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
};

const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "default",
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  size: PropTypes.oneOf(["default", "icon"]),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAppointments();
        setAppointments(data);
      } catch (err) {
        setError(
          typeof err === "string" ? err : "Failed to fetch appointments."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;

    return appointments.filter((appointment) => {
      const userNameMatch = appointment.user.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const artistNameMatch = appointment.artist.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return userNameMatch || artistNameMatch;
    });
  }, [appointments, searchQuery]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id ? { ...appointment, status } : appointment
        )
      );
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : `Failed to update appointment status to ${status}.`
      );
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to delete appointment.");
    }
  };

  const handleImageModalOpen = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleImageModalClose = () => {
    setSelectedAppointment(null);
  };

  const clearError = () => {
    setError("");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Card Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Appointments List</h2>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full pl-10 p-2.5"
            placeholder="Search by client or artist name..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-500 text-white p-3 mb-4 rounded flex justify-between items-center">
            <p>{error}</p>
            <button
              onClick={clearError}
              className="text-white hover:text-gray-200"
              aria-label="Dismiss error"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <p className="text-gray-600 text-center p-8">
            {searchQuery ? "No appointments match your search." : "No appointments available."}
          </p>
        ) : (
          <div className="relative">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th className="text-left p-3 font-medium">S.N</th>
                  <th className="text-left p-3 font-medium">USER</th>
                  <th className="text-left p-3 font-medium">PHONE</th>
                  <th className="text-left p-3 font-medium">ARTIST</th>
                  <th className="text-left p-3 font-medium">DATE</th>
                  <th className="text-left p-3 font-medium">TIME</th>
                  <th className="text-left p-3 font-medium">STATUS</th>
                  <th className="text-left p-3 font-medium">IMAGE</th>
                  <th className="text-left p-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((appointment, index) => (
                  <tr
                    key={appointment.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">{indexOfFirstItem + index + 1}</td>
                    <td className="p-3">{appointment.user.name}</td>
                    <td className="p-3">{appointment.phone_number}</td>
                    <td className="p-3">{appointment.artist.name}</td>
                    <td className="p-3">{formatDate(appointment.appointment_datetime)}</td>
                    <td className="p-3">{formatTime(appointment.appointment_datetime)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "canceled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {appointment.image_url ? (
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleImageModalOpen(appointment)}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                      ) : (
                        <span>No Image</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {/* Confirm Button */}
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() =>
                            handleUpdateStatus(appointment.id, "confirmed")
                          }
                          disabled={
                            appointment.status === "confirmed" ||
                            appointment.status === "canceled"
                          }
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>

                        {/* Cancel Button */}
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() =>
                            handleUpdateStatus(appointment.id, "canceled")
                          }
                          disabled={
                            appointment.status === "canceled" ||
                            appointment.status === "confirmed"
                          }
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>

                        {/* Delete Appointment Button */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="bg-gray-200 hover:bg-gray-300"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredAppointments.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredAppointments.length)}
                      </span>{" "}
                      of <span className="font-medium">{filteredAppointments.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <Button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="secondary"
                        size="icon"
                        className="rounded-l-md"
                      >
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </Button>

                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        let pageNumber;

                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNumber
                                ? "bg-black text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <Button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="secondary"
                        size="icon"
                        className="rounded-r-md"
                      >
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Image with Description */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full">
            <div className="flex justify-end mb-2">
              <Button onClick={handleImageModalClose} size="icon">
                <XCircle className="w-6 h-6 text-red-600" />
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <img
                  src={selectedAppointment.image_url || "/placeholder.svg"}
                  alt="Appointment"
                  className="w-full max-h-96 object-contain border rounded"
                />
              </div>
              <div className="md:w-1/3">
                <h3 className="text-xl font-semibold mb-2">Appointment Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{selectedAppointment.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedAppointment.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Artist</p>
                    <p className="font-medium">{selectedAppointment.artist.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(selectedAppointment.appointment_datetime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">{formatTime(selectedAppointment.appointment_datetime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`font-medium ${
                        selectedAppointment.status === "confirmed"
                          ? "text-green-600"
                          : selectedAppointment.status === "canceled"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {selectedAppointment.status.charAt(0).toUpperCase() +
                        selectedAppointment.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium">
                      {selectedAppointment.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
