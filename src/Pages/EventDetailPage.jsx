

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;


const EventDetailPage = () => {
  const { eventId } = useParams(); 
  const [event, setEvent] = useState(null);

 
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (!event) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">{event.name}</h2>
      <div className="bg-white p-6 shadow-md rounded-lg">
        <img
          src={event.image_url} 
          alt={event.name}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <p className="text-sm text-gray-600 mb-4">{event.description}</p>
        <div className="text-sm text-gray-600 mb-2">
          <strong>Date:</strong> {event.date}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          <strong>Price:</strong> NPR{event.price}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          <strong>Available Tickets:</strong> {event.available_tickets}
        </div>
        <div className="flex justify-between">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
