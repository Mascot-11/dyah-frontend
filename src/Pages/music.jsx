import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Subnav from "../components/subnavbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const fetchEvents = async () => {
  const userToken = localStorage.getItem("auth_token");
  const { data } = await axios.get("/events", {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return data;
};


const fetchKhaltiCallback = async (khaltiData) => {
  const { data } = await axios.post("/khalti/callback", khaltiData);
  return data;
};

const ColorModeEvents = () => {
  const [message, setMessage] = useState("Processing Khalti Payment...");
  const location = useLocation();
  const prevSearch = useRef("");
  const upcomingRef = useRef(null);
  const [khaltiData, setKhaltiData] = useState(null);

 
  const { data: allEvents, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 1* 60 * 1000, 
  });
  
  const { data: khaltiResponse, isLoading: isKhaltiLoading, isError: isKhaltiError } = useQuery({
    queryKey: ["khaltiPayment", khaltiData],
    queryFn: () => fetchKhaltiCallback(khaltiData),
    enabled: !!khaltiData,     onSuccess: (data) => {
      setMessage(data.message);
      if (data.message.includes("successfully")) {
        toast.success("Payment Successful!");
      } else {
        toast.error("Transaction failed, Payment for event not confirmed");
      }
      window.history.replaceState({}, document.title, location.pathname);
    },
    onError: () => {
      toast.error("Error processing payment");
    },
  });

  useEffect(() => {
    if (location.search !== prevSearch.current) {
      const params = new URLSearchParams(location.search);
      const userData = JSON.parse(localStorage.getItem("user_data"));
      const userId = localStorage.getItem("user_id");
  
      const khaltiData = {
        pidx: params.get("pidx"),
        transaction_id: params.get("transaction_id"),
        tidx: params.get("tidx"),
        amount: params.get("amount"),
        total_amount: params.get("total_amount"),
        mobile: params.get("mobile"),
        status: params.get("status"),
        purchase_order_id: params.get("purchase_order_id"),
        purchase_order_name: params.get("purchase_order_name"),
        user_data: userData,
        user_id: userId,
      };
  
      
      setKhaltiData(khaltiData);
    }
  
 
    if (location.search) {
      window.history.replaceState({}, document.title, location.pathname);
    }
  
    prevSearch.current = location.search;
  }, [location.search]);
  

  useEffect(() => {
    if (upcomingRef.current) {
      gsap.fromTo(
        upcomingRef.current.children,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.3,
          scrollTrigger: {
            trigger: upcomingRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
          },
        }
      );
    }
  }, [allEvents]);

  if (isLoading) return <p>Loading events...</p>;
  if (isError) return <p>Error fetching events.</p>;

  const today = new Date();
  const upcoming = allEvents
    ? allEvents.filter((event) => new Date(event.date) >= today).slice(0, 3)
    : [];
  const past = allEvents
    ? allEvents.filter((event) => new Date(event.date) < today).slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-white text-black">
      <Subnav
        backButton={true}
        navItems={[
          { title: "Home", path: "/" },
          { title: "Events", path: "/events" },
          { title: "About", path: "/aboutus" },
          { title: "FAQs", path: "/faq" },
        ]}
      />

      <main className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-5xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Events Across Nepal
        </motion.h1>

        {/* Upcoming Events Section */}
        <section className="mb-16" ref={upcomingRef}>
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <motion.div
                  className="bg-white bg-opacity-10 rounded-lg overflow-hidden shadow-lg hover:scale-105 transform transition-all duration-300"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex justify-center items-center">
                    <img
                      src={event.image_url}
                      alt={event.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">{event.name}</h3>
                    <p className="text-sm mb-4 flex items-center">
                      <Calendar className="mr-2" size={16} />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm mb-4">{event.description}</p>
                    <p className="text-sm mb-4">Price: ₹{event.price}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Past Events Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {past.map((event) => (
              <motion.div
                key={event.id}
                className="bg-white bg-opacity-10 rounded-lg overflow-hidden shadow-lg hover:scale-105 transform transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center items-center">
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{event.name}</h3>
                  <p className="text-sm mb-4">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <ToastContainer position="bottom-center" autoClose={3000} />
      </main>
    </div>
  );
};

export default ColorModeEvents;
