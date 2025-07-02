

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Minimize2, User } from 'lucide-react'
import Echo from "laravel-echo"
import Pusher from "pusher-js"

const BASE_URL = import.meta.env.VITE_API_URL;


export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [chats, setChats] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const messagesEndRef = useRef(null)

  const userId = Number.parseInt(localStorage.getItem("user_id"))
  const token = localStorage.getItem("auth_token")


  useEffect(() => {
    const userRole = localStorage.getItem("user_role")
    setIsAdmin(userRole === "admin")
    
    if (userRole === "admin") {
      fetchChats()
      const interval = setInterval(() => {
        fetchChats() 
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [])

 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])


  useEffect(() => {
    let echoInstance

    if (chatId) {
      echoInstance = new Echo({
        broadcaster: "pusher",
        key: "a5e943e8d897050be7ab",
        cluster: "ap2",
        forceTLS: true,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })

      echoInstance.channel(`chat.${chatId}`).listen("MessageSent", (event) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...event.message,
            sender: event.sender
          },
        ])
      })
    }

    return () => {
      if (echoInstance && chatId) {
        echoInstance.leaveChannel(`chat.${chatId}`)
      }
    }
  }, [chatId, token])


  useEffect(() => {
    if (chatId) {
      fetchMessages()
    }
  }, [chatId])


  useEffect(() => {
    const interval = setInterval(() => {
      if (chatId) {
        fetchMessages()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [chatId])

  const checkAuthToken = () => {
    if (!token) {
      alert("You need to be logged in to access this feature.")
      return false
    }
    return true
  }

  const fetchChats = async () => {
    if (!checkAuthToken()) return

    try {
      const response = await fetch(`${BASE_URL}/chats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChats(data)
      } else {
        console.error("Failed to fetch chats")
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const createChat = async () => {
    if (!checkAuthToken()) return

    try {
      const response = await fetch(`${BASE_URL}/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setChatId(data.id)
      } else {
        console.error("Failed to create chat")
      }
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    
    if (!newMessage.trim() || !chatId) return

    setLoading(true)

    try {
      const response = await fetch(`${BASE_URL}/chat/${chatId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        const messageWithSender = {
          ...data.message,
          sender_id: userId,
        }
        setMessages((prevMessages) => [...prevMessages, messageWithSender])
        setNewMessage("")
      } else {
        console.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!chatId || !checkAuthToken()) return

    try {
      const response = await fetch(`${BASE_URL}/chat/${chatId}/messages`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        console.error("Failed to fetch messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    

    if (!isOpen && !isAdmin && !chatId) {
      createChat()
    }
  }

  return (
    <>
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-black hover:bg-black"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 shadow-xl flex flex-col h-[500px] max-h-[80vh] border border-gray-200 rounded-lg bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-black text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="h-8 w-8 mr-2 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                <span className="text-sm font-bold">
                  {isAdmin ? "A" : <User />}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">
                  {isAdmin ? "Admin Support" : "Chat Support"}
                </h3>
                <p className="text-xs opacity-80">
                  {chatId ? `Chat #${chatId}` : isAdmin ? "Select a chat" : "Start a conversation"}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleChat} 
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-black text-white"
              aria-label="Minimize chat"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
          
          {/* Admin Chat Selection */}
          {isAdmin && (
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="text-sm font-medium mb-2">Select a user to chat with:</div>
              <div className="max-h-40 overflow-y-auto">
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setChatId(chat.id)}
                      className={`w-full text-left p-2 text-sm rounded-md mb-1 transition-colors ${
                        chatId === chat.id 
                          ? "bg-red text-black" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">{chat.participant}</div>
                      <div className="text-xs text-gray-500 truncate">{chat.latest_message}</div>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-2">No active chats</p>
                )}
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {!chatId && !isAdmin && (
              <div className="flex justify-center items-center h-full">
                <button
                  onClick={createChat}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-black transition-colors"
                >
                  Start a new chat
                </button>
              </div>
            )}
            
            {chatId && messages.length === 0 && (
              <div className="flex justify-center items-center h-full text-gray-500">
                No messages yet
              </div>
            )}
            
            {messages.map((message) => {
              const isCurrentUser = Number.parseInt(message.sender_id) === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      isCurrentUser
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {!isCurrentUser && message.sender && (
                      <div className="text-xs font-medium mb-1">
                        {message.sender.name || (isAdmin ? "User" : "Admin")}
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? "text-black" : "text-gray-500"}`}>
                      {formatTimestamp(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
         

          {/* Footer with input */}
          {chatId && (
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={loading}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={loading || !newMessage.trim()}
                  className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-md hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  )
}
