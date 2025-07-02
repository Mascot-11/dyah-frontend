import { useState } from "react";
import { resetPassword } from "../Utils/api"; 
import { useSearchParams, Link, useNavigate } from "react-router-dom"; 

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

 
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      setMessage("Passwords do not match.");
      return;
    }

    const data = {
      email,
      password,
      password_confirmation: passwordConfirmation,
      token,
    };

    const result = await resetPassword(data); 
    setMessage(result.message);

   
    if (result.success) {
      setTimeout(() => {
        navigate("/login");
      }, 2000); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Reset Password
        </h2>
        <p className="text-gray-600 text-center mt-2 mb-6">
          Enter your email and new password to reset your account
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Confirm new password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-black text-white rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Reset Password
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message === "Passwords do not match."
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-blue-500 hover:underline">
            Remembered your password? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
