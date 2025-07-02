import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../Utils/api";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from "../App"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
 
  const { isUserLoggedIn } = useAuth();
  
 
  const from = location.state?.from?.pathname || "/landing";
  

  useEffect(() => {
    if (isUserLoggedIn) {
      const userRole = localStorage.getItem("user_data") 
        ? JSON.parse(localStorage.getItem("user_data")).role 
        : "";
        
      if (userRole === "admin") {
        navigate("/admin/landing");
      } else {
        navigate(from);
      }
    }
  }, [isUserLoggedIn, navigate, from]);

  // Populate email and password from localStorage if "Remember Me" was checked
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    const rememberedPassword = localStorage.getItem("remembered_password");
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = await login({ email, password });
      console.log('API response data:', data);
      
      // Ensure we only store simple, safe data in localStorage
      const userData = {
        id: data.user.id,
        name: data.user.name,
        role: data.user.role,
      };

      // Store the token and user data
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", userData.id);
      localStorage.setItem("user_data", JSON.stringify(userData));
      localStorage.setItem("user_role", userData.role); // Add this for compatibility with App.jsx

      // Store email and password if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remembered_password", password);
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
      }

      // Show a success message
      toast.success(`Welcome, ${userData.name}!`);

      // Force a page reload to ensure all components recognize the auth state change
      // This is a simple solution that ensures the App component re-checks localStorage
      window.location.href = userData.role === "admin" 
        ? "/admin/landing" 
        : from;
        
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response && error.response.data) {
        toast.error(`${error.response.data.message}`);
      } else if (error.message) {
        toast.error(` ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-8">
          <h3 className="text-3xl font-bold text-black mb-2">Login</h3>
          <p className="text-gray-600 mb-6">
            Enter your credentials to access your account
          </p>
          <form onSubmit={handleLogin} className="space-y-6">
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
                autoComplete="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {passwordVisible ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember Me
              </label>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-md text-lg font-semibold hover:bg-gray-800 transition duration-300 mt-6 disabled:opacity-70"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <Link
              to="/forgotpassword"
              className="text-sm text-gray-600 hover:text-black"
            >
              Forgot password?
            </Link>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Dont have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-black hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Toast container to display messages */}
      <ToastContainer />
    </section>
  );
};

export default Login;