import { useState, useEffect, useRef } from "react";
import { Calendar } from "react-date-range";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, setHours, setMinutes } from "date-fns";
import { FiPaperclip } from "react-icons/fi";
import confetti from "canvas-confetti";
import Subnav from "../components/subnavbar";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const InfoTooltip = ({ text }) => (
  <span className="relative flex items-center group cursor-pointer ml-2">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-500 group-hover:text-black transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16v-4m0-4h.01"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
    {/* Tooltip */}
    <span className="absolute bottom-full mb-2 w-56 left-1/2 -translate-x-1/2 rounded bg-black text-white text-xs p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-normal z-50">
      {text}
    </span>
  </span>
);

const checkLogin = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    toast.error("You must be logged in to book an appointment.", {
      autoClose: 6000,
    });
    setTimeout(() => {
      window.location.href = "/login";
    }, 6000);
  }
};

const TattooAppointment = () => {
  const [artistId, setArtistId] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [artists, setArtists] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState(setHours(setMinutes(new Date(), 0), 9));
  const [imagePreview, setImagePreview] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBackHome, setShowBackHome] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkLogin();
    const fetchArtists = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await axios.get("/artists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setArtists(response.data);
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };
    fetchArtists();
  }, []);

  const runConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleAppointment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      setIsSubmitting(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("You cannot book an appointment for a past date.");
      setIsSubmitting(false);
      return;
    }

    const appointmentHour = time.getHours();
    if (appointmentHour < 9 || appointmentHour > 19) {
      toast.error("Appointments can only be made between 9 AM and 7 PM.");
      setIsSubmitting(false);
      return;
    }

    if (!artistId) {
      toast.error("Please select an artist.");
      setIsSubmitting(false);
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description for your tattoo.");
      setIsSubmitting(false);
      return;
    }

    const file = fileInputRef.current.files[0];
    if (file && !imagePreview) {
      toast.error("Please upload a valid image.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const formattedTime = format(time, "HH:mm");
      const appointmentDateTime = `${formattedDate} ${formattedTime}`;

      const formData = new FormData();
      formData.append("artist_id", artistId);
      formData.append("appointment_datetime", appointmentDateTime);
      formData.append("description", description);
      formData.append("phone_number", phoneNumber);
      if (file) formData.append("image", file);

      const token = localStorage.getItem("auth_token");

      await axios.post("/appointments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("🎉 Appointment booked successfully!");
      runConfetti();
      setBookingSuccess(true);

      // Hide back to home after 5 seconds
      setTimeout(() => setShowBackHome(false), 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white text-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-70"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Ink Your Story
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-300">
            Where Art Meets Skin, Your Vision Comes to Life
          </p>
          <a
            href="/gallery"
            className="bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition duration-300 shadow-lg inline-block"
          >
            View Tattoo Gallery
          </a>
        </div>
      </section>

      {/* Booking Section */}
      <section className="max-w-6xl mx-auto my-20 p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-4xl font-bold mb-10 text-center">
          Design Your Experience
        </h2>

        {!bookingSuccess ? (
          <form onSubmit={handleAppointment} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Artist Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex justify-between items-center">
                    Select Artist *
                    <InfoTooltip text="Choose your preferred tattoo artist." />
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                  >
                    <option value="">Choose an Artist</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex justify-between items-center">
                    Select Date *
                    <InfoTooltip text="Pick the date for your tattoo appointment." />
                  </label>
                  <Calendar date={selectedDate} onChange={setSelectedDate} />
                </div>
              </div>

              <div className="space-y-8">
                {/* Time */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex justify-between items-center">
                    Select Time *
                    <InfoTooltip text="Appointments are between 9 AM - 7 PM." />
                  </label>
                  <input
                    type="time"
                    value={format(time, "HH:mm")}
                    onChange={(e) =>
                      setTime(
                        setHours(setMinutes(new Date(), 0), Number(e.target.value.split(":")[0]))
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex justify-between items-center">
                    Phone Number *
                    <InfoTooltip text="Enter your 10-digit phone number." />
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={10}
                    placeholder="e.g. 9800000000"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex justify-between items-center">
                    Tattoo Description *
                    <InfoTooltip text="Describe the design or idea for your tattoo." />
                  </label>
                  <textarea
                    rows="5"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your tattoo idea..."
                  />
                </div>

                {/* Upload Image */}
                <div>
                  <label className="block text-lg font-semibold mb-2 flex justify-between items-center">
                    Upload Image
                    <InfoTooltip text="Attach reference or design image (Max 2MB)." />
                  </label>
                  <button
                    type="button"
                    className="flex items-center bg-gray-200 text-black px-4 py-2 rounded-md"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <FiPaperclip className="mr-2" /> Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-4 w-60 h-40 object-cover rounded-md"
                    />
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-8 py-4 text-lg font-semibold rounded-full transition duration-300 ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                  >
                    {isSubmitting ? "Booking Appointment..." : "Book Appointment"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-3xl font-bold text-green-600 mb-4">
              🎉 Appointment Booked!
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Thank you! We’ll contact you soon to confirm the details.
            </p>

            {showBackHome && (
              <a
                href="/"
                className="inline-block mt-8 bg-black text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
              >
                Back to Home
              </a>
            )}
          </div>
        )}
      </section>
      <ToastContainer />
    </div>
  );
};

export default TattooAppointment;
