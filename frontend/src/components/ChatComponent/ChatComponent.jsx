import "./ChatComponent.css";
import { useEffect, useState, useContext } from "react";
import io from "socket.io-client";
import { StoreContext } from "../../context/StoreContext";
import { jwtDecode } from "jwt-decode";
import { assets } from "../../assets/assets";

// Establish a Socket.IO connection
const socket = io("http://localhost:4000");

const ChatComponent = () => {
  const { token } = useContext(StoreContext); // Retrieve the token from context
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [isGreetingReceived, setIsGreetingReceived] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // State to track if the chat is minimized

  // Effect to run on token change (either login or logout)
  useEffect(() => {
    setMessages([]);
    setInput("");
    setIsGreetingReceived(false);
    setBotTyping(false);

    if (token) {
      let displayName = "Guest";
      try {
        const decoded = jwtDecode(token); // Decode token to get user details
        displayName = decoded.name || "Guest"; // Display the username or Guest if not available
      } catch (err) {
        console.error("Error decoding JWT:", err);
      }

      // Emit user login event
      socket.emit("userLoggedIn", displayName);
      console.log("User logged in as:", displayName);

      socket.on("botMessage", (message) => {
        if (!isGreetingReceived && message.includes(`Hello ${displayName}`)) {
          setBotTyping(true);
          setTimeout(() => {
            simulateTypingEffect("bot", message);
          }, getRandomTypingDelay());
          setIsGreetingReceived(true);
        } else {
          setBotTyping(true);
          setTimeout(() => {
            simulateTypingEffect("bot", message);
          }, getRandomTypingDelay());
        }
      });
    } else {
      socket.emit("userLoggedOut"); // Emit logout event if token is cleared
    }

    return () => {
      socket.off("botMessage"); // Cleanup on logout or component unmount
    };
  }, [token]);

  const simulateTypingEffect = (sender, text) => {
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex < text.length) {
        addMessage(sender, text.substring(0, charIndex + 1), true);
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setBotTyping(false);
      }
    }, 50);
  };

  const addMessage = (sender, text, isTyping = false) => {
    if (isTyping) {
      setMessages((prev) => [...prev.slice(0, -1), { sender, text }]);
    } else {
      setMessages((prev) => [...prev, { sender, text }]);
    }
  };

  const getRandomTypingDelay = () => {
    return Math.floor(Math.random() * 1000) + 1000;
  };

  const handleSend = () => {
    if (input.trim()) {
      addMessage("user", input);
      socket.emit("userMessage", input); // Send user input to backend
      setInput("");
    }
  };

  const toggleChatMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`chat-container ${isMinimized ? "minimized" : ""}`}>
      <div className="chat-header">
        <div className="header-left">
          <img src={assets.profile_icon} alt="Admin Aryan" />
          <div>
            <h3>Admin Aryan</h3>
            <p>We are online</p>
          </div>
        </div>
        <button className="chat-toggle-btn" onClick={toggleChatMinimize}>
          {isMinimized ? "↑" : "↓"}
        </button>
      </div>
      {!isMinimized && (
        <div className="chat-body">
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {botTyping && <div className="chat-bubble bot typing">...</div>} {/* Typing indicator */}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
