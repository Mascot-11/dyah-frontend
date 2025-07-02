const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN_KEY = "auth_token";

const api = axios.create({
  baseURL: BASE_URL,
  // no withCredentials here
});

// Login function using token-based auth
export const login = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);

    const { access_token, user } = response.data;

    if (access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      localStorage.setItem("user_role", user?.role);
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
export const register = async (userData) => {
  try {
    const userWithRole = { ...userData, role: userData.role || "user" };

    // No CSRF token call here for token-based auth

    const response = await axios.post(
      `${BASE_URL}/register`,
      userWithRole
      // No withCredentials here either
    );

    const { access_token, user } = response.data;
    if (access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      localStorage.setItem("user_role", user?.role || "user");
    }

    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};



export const logout = async (setIsUserLoggedIn) => {
  try {
    await getCSRFToken();
    await api.post("/logout");
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsUserLoggedIn(false);
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};


export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/forgot/password", { email });
    return response.data;
  } catch (error) {
    console.error(
      "Password reset error:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Unable to send reset link." };
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await api.post("/password/reset", data);
    return response.data;
  } catch (error) {
    console.error(
      "Password reset error:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Failed to reset password." };
  }
};


export const getauth_token = () => {
  const token = localStorage.getItem("auth_token");
  return token ? token : null; 
};


export const isLoggedIn = () => {
  const token = getauth_token();
  return token ? true : false; 
};

export const isAuthenticated = () => {
  return localStorage.getItem("auth_token") !== null;
};


export const getUsers = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error.response?.data || error.message;
  }
};


export const addUser = async (userData) => {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};


export const updateUser = async (userId, userData) => {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await axios.put(
      `${BASE_URL}/users/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating user:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await axios.delete(`${BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting user:",
      error.response?.data || error.message
    );
    throw error.response?.data || error.message;
  }
};

export const bookAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/appointments", appointmentData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error booking appointment:",
      error.response?.data || error.message
    );
    throw error.response?.data?.message || error.message;
  }
};

export const fetchAppointments = async () => {
  try {
    const response = await api.get("/appointments", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching appointments:",
      error.response?.data || error.message
    );
    throw error.response?.data?.message || error.message;
  }
};

export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await api.put(
      `/appointments/${id}/status`,
      { status },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating appointment status:",
      error.response?.data || error.message
    );
    throw error.response?.data?.message || error.message;
  }
};

export const deleteAppointment = async (id) => {
  try {
    const response = await api.delete(`/appointments/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting appointment:",
      error.response?.data || error.message
    );
    throw error.response?.data?.message || error.message;
  }
};
