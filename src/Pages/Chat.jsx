import  { useState, useEffect, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

const BASE_URL = import.meta.env.VITE_API_URL;

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [chats, setChats] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef(null);

  
  const userId = Number.parseInt(localStorage.getItem("user_id"));

  useEffect(() => {
    const userRole = localStorage.getItem("user_role");
    setIsAdmin(userRole === "admin");
    if (userRole === "admin") {
      fetchChats();
      fetchChats();
      const interval = setInterval(() => {
        fetchChats(); 
      }, 100000); 

      return () => clearInterval(interval);
    }
  }, []);

  const checkAuthToken = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("You need to be logged in to access this feature.");
      return false;
    }
    return true;
  };

  const fetchChats = async () => {
    if (!checkAuthToken()) return;

    try {
      const response = await fetch(`${BASE_URL}/chats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      } else {
        console.error("Failed to fetch chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const createChat = async () => {
    if (!checkAuthToken()) return;

    try {
      const response = await fetch(`${BASE_URL}/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatId(data.id);
      } else {
        console.error("Failed to create chat");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/chat/${chatId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          content: newMessage,
          parent_message_id: replyingTo ? replyingTo.id : null,
          sender_id: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const messageWithSender = {
          ...data.message,
          sender_id: userId,
        };
        setMessages((prevMessages) => [...prevMessages, messageWithSender]);
        setNewMessage("");
        setReplyingTo(null);
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!chatId || !checkAuthToken()) return;

    try {
      const response = await fetch(`${BASE_URL}/chat/${chatId}/messages`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    let echoInstance;

    if (chatId) {
      echoInstance = new Echo({
        broadcaster: "pusher",
        key: "a5e943e8d897050be7ab",
        cluster: "ap2",
        forceTLS: true,
      });

      echoInstance.channel(`chat.${chatId}`).listen("MessageSent", (event) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...event.message,
            sender_id: event.sender.id,
            sender_name: event.sender.name,
          },
        ]);
      });
    }

    return () => {
      if (echoInstance && chatId) {
        echoInstance.leaveChannel(`chat.${chatId}`);
      }
    };
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (chatId) {
        fetchMessages();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chatId]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Navigation */}
      <div className="w-64 bg-black border-r border-gray-800 overflow-y-auto ml-12">
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">Chats</h2>
          {isAdmin ? (
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setChatId(chat.id)}
                  className="w-full text-left text-white hover:bg-gray-900 rounded-lg p-3 transition-colors duration-200"
                >
                  {chat.participant}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={createChat}
              className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Start Chat
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {chatId ? `Chat ${chatId}` : "Select a chat"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => {
            const isCurrentUser = Number.parseInt(message.sender_id) === userId;
            return (
              <div
                key={message.id}
                className={`flex mb-4 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    isCurrentUser
                      ? "bg-[#1e2329] text-white"
                      : "bg-[#1e2329] text-white"
                  }`}
                >
                  <div className="flex flex-col">
                    <p className="break-words">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          {replyingTo && (
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-2">
              <p className="text-sm text-gray-600">
                Replying to: {replyingTo.content.substring(0, 50)}
                {replyingTo.content.length > 50 ? "..." : ""}
              </p>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-red-500 hover:text-red-400 ml-2"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-[#1e2329] text-white p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-900 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;