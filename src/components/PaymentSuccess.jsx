import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("status");
    const refId = queryParams.get("refId");
    const amount = queryParams.get("amount");
    const pid = queryParams.get("pid");
    const event_id = queryParams.get("event_id");
    const quantity = queryParams.get("quantity");

    if (paymentStatus === "Success") {
      axios
        .post("/api/verify-esewa", {
          amount,
          refId,
          pid,
          event_id,
          quantity,
        })
        .then(() => {
          setLoading(false);
          setStatusMessage(
            "Payment Verified Successfully! Your ticket is confirmed."
          );
          setTimeout(() => {
            navigate("/ticket-confirmation");
          }, 3000);
        })
        .catch((error) => {
          setLoading(false);
          setStatusMessage(
            error.response?.data?.message ||
              "Payment Verification Failed. Please try again."
          );
          console.error("Payment Verification Error: ", error);
        });
    } else {
      setLoading(false);
      setStatusMessage(
        "Payment Failed! Please check your payment and try again."
      );
    }
  }, [location, navigate]);

  return (
    <div className="payment-status-container">
      <h2>Payment Status</h2>
      {loading ? (
        <p>Processing your payment...</p>
      ) : (
        <div>
          <p>{statusMessage}</p>
          <button onClick={() => navigate("/")}>Go Back to Home</button>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
