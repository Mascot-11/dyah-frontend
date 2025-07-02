import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { forgotPassword } from "../Utils/api"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); 

    try {
     
      await forgotPassword(email);
      setMessage(
        "If an account exists for this email, you will receive password reset instructions."
      );

      
      setTimeout(() => {
        navigate("/login"); e
      }, 5000); 
    } catch (error) {
      setMessage(`Error: ${error.response?.data.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-8">
          <h3 className="text-3xl font-bold text-black mb-2">
            Forgot Password
          </h3>
          <p className="text-gray-600 mb-6">
            Enter your email address to reset your password
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-md text-lg font-semibold hover:bg-gray-800 transition duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Reset Password"}
              </button>
            </div>
          </form>
          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.includes("Error") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <a href="#" className="font-medium text-black hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
