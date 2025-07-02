import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const TicketConfirmation = () => {
  const location = useLocation();
  const [ticketDetails, setTicketDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    
    const queryParams = new URLSearchParams(location.search);
    const ticketId = queryParams.get("ticket_id");

    if (ticketId) {
      axios
        .get(`/api/ticket-details/${ticketId}`)
        .then((response) => {
          setTicketDetails(response.data.ticket);
          setLoading(false);
        })
        .catch((error) => {
          setError("Failed to load ticket details.");
          setLoading(false);
        });
    } else {
      setError("No ticket ID provided.");
      setLoading(false);
    }
  }, [location]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="ticket-confirmation-container">
      <h2>Ticket Confirmation</h2>
      <div className="ticket-details">
        <h3>Event: {ticketDetails.event.name}</h3>
        <p>
          <strong>Quantity:</strong> {ticketDetails.quantity}
        </p>
        <p>
          <strong>Status:</strong> {ticketDetails.status}
        </p>
        <p>
          <strong>Price:</strong> $
          {ticketDetails.event.price * ticketDetails.quantity}
        </p>

        <h4>Your Ticket</h4>
        <p>
          You will receive an email with your ticket details. You can download
          your ticket from the following link:
        </p>
        <a
          href={`/storage/tickets/ticket_${ticketDetails.id}.pdf`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Ticket PDF
        </a>
      </div>
    </div>
  );
};

export default TicketConfirmation;
