import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Assuming `chatId` is available from props or state
useEffect(() => {
  // Initialize Echo with Pusher
  const echo = new Echo({
    broadcaster: "pusher",
    key: "your-pusher-key",
    cluster: "your-pusher-cluster",
    encrypted: true,
  });

  // Subscribe to the chat channel
  const channel = echo.channel(`chat.${chatId}`);

  // Listen for the `MessageSent` event
  channel.listen("MessageSent", (event) => {
    // Update your state with the new message
    setMessages((prevMessages) => [...prevMessages, event.message]);

    // Optionally, focus or scroll to the latest message
  });

  // Cleanup on component unmount
  return () => {
    echo.leaveChannel(`chat.${chatId}`);
  };
}, [chatId]);
