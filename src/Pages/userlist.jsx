

import { useEffect, useState, useMemo } from "react"
import { getUsers, deleteUser, addUser, updateUser } from "../Utils/api"
import { Pencil, Trash2, Plus, Eye, EyeOff, Search, ChevronLeft, ChevronRight } from "lucide-react"

// Custom Button Component
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
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
  }
  const sizes = {
    default: "h-9 px-4 py-2",
    icon: "h-9 w-9",
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

// Email component with smooth transition
const BlurredEmail = ({ email, isVisible, toggleVisibility }) => {
  const [username, domain] = email.split("@")
  const [domainName, extension] = domain.split(".")

  return (
    <div className="flex items-center gap-2 group">
      <div className="relative font-mono cursor-pointer" onClick={toggleVisibility}>
        {/* Visible email (shown when isVisible is true) */}
        <span
          className={`transition-all duration-300 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute pointer-events-none"
          }`}
        >
          {email}
        </span>

        {/* Blurred email (shown when isVisible is false) */}
        <span
          className={`transition-all duration-300 ${
            isVisible ? "opacity-0 scale-95 absolute pointer-events-none" : "opacity-100 scale-100"
          }`}
        >
          <span>{username.charAt(0)}</span>
          <span className="blur-sm transition-all duration-300 group-hover:blur-[2px]">{username.slice(1)}</span>
          <span>@</span>
          <span>{domainName.charAt(0)}</span>
          <span className="blur-sm transition-all duration-300 group-hover:blur-[2px]">{domainName.slice(1)}</span>
          <span>.{extension}</span>
        </span>
      </div>

      <button
        onClick={toggleVisibility}
        className={`transition-all duration-200 p-1 rounded-full ${
          isVisible ? "bg-gray-100 text-gray-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        }`}
        aria-label={isVisible ? "Hide email" : "Show email"}
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

const UserList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Email visibility state
  const [visibleEmails, setVisibleEmails] = useState({})

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await getUsers()
        setUsers(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch users")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    return users.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase())
      const emailMatch = user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const roleMatch = user.role.toLowerCase().includes(searchQuery.toLowerCase())
      return nameMatch || emailMatch || roleMatch
    })
  }, [users, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

  // Pagination controls
  const goToPage = (page) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  const handleAddUser = async () => {
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.role ||
      (!isEditing && (!newUser.password || !newUser.confirmPassword))
    ) {
      setError("All fields are required")
      return
    }

    if (!isEditing && newUser.password !== newUser.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsSubmitting(true)
      if (isEditing) {
        const updatedUser = await updateUser(editUser.id, {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        })
        setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
      } else {
        const addedUser = await addUser({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          password_confirmation: newUser.confirmPassword,
          role: newUser.role,
        })
        setUsers([...users, addedUser])
      }
      setNewUser({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      })
      setIsSubmitting(false)
      setShowForm(false)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? "update" : "add"} user`)
      setIsSubmitting(false)
    }
  }

  const handleEditUser = (user) => {
    setIsEditing(true)
    setEditUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
    })
    setShowForm(true)
  }

  const handleDeleteUser = async (id) => {
    try {
      setIsSubmitting(true)
      await deleteUser(id)
      setUsers(users.filter((user) => user.id !== id))
      setIsSubmitting(false)
    } catch (err) {
      setError("Failed to delete user")
      setIsSubmitting(false)
    }
  }

  const formatDate = (date) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(date).toLocaleDateString(undefined, options)
  }

  const toggleEmailVisibility = (userId) => {
    setVisibleEmails((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Card Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-2xl font-semibold">User List</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" /> Add New User
        </Button>
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
            placeholder="Search by name, email, or role..."
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
            <button onClick={clearError} className="text-white hover:text-gray-200" aria-label="Dismiss error">
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">{isEditing ? "Edit User" : "Add User"}</h3>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Name"
              className="w-full px-4 py-2 border rounded-md mb-4"
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-md mb-4"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-md mb-4"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="tattoo_artist">Tattoo Artist</option>
            </select>
            {!isEditing && (
              <>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Password"
                    className="w-full px-4 py-2 border rounded-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="relative mb-4">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={newUser.confirmPassword}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm Password"
                    className="w-full px-4 py-2 border rounded-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setIsEditing(false)
                  setNewUser({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "",
                  })
                  setError(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={isSubmitting}>
                {isEditing ? "Update" : "Add"} User
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-600 text-center p-8">
            {searchQuery ? "No users match your search." : "No users available."}
          </p>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th className="text-left p-3 font-medium">S.N</th>
                  <th className="text-left p-3 font-medium">NAME</th>
                  <th className="text-left p-3 font-medium">EMAIL</th>
                  <th className="text-left p-3 font-medium">ROLE</th>
                  <th className="text-left p-3 font-medium">CREATED AT</th>
                  <th className="text-left p-3 font-medium">UPDATED AT</th>
                  <th className="text-left p-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((user, index) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">{indexOfFirstItem + index + 1}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">
                      <BlurredEmail
                        email={user.email}
                        isVisible={visibleEmails[user.id]}
                        toggleVisibility={() => toggleEmailVisibility(user.id)}
                      />
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "tattoo_artist"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(user.created_at)}</td>
                    <td className="p-3">{formatDate(user.updated_at)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="icon" onClick={() => handleEditUser(user)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="bg-gray-200 hover:bg-gray-300"
                          onClick={() => handleDeleteUser(user.id)}
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
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} variant="secondary">
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
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of{" "}
                      <span className="font-medium">{filteredUsers.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
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
                        let pageNumber

                        // Calculate which page numbers to show
                        if (totalPages <= 5) {
                          pageNumber = i + 1
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i
                        } else {
                          pageNumber = currentPage - 2 + i
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
                        )
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
    </div>
  )
}

export default UserList

