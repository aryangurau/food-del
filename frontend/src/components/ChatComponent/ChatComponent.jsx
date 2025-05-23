import "./ChatComponent.css";
import { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import { StoreContext } from "../../context/StoreContext";
import { jwtDecode } from "jwt-decode";
import { assets } from "../../assets/assets";

// Initialize socket outside component to prevent multiple connections
let socket;

const ChatComponent = () => {
  const { token } = useContext(StoreContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [isGreetingReceived, setIsGreetingReceived] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized
  const [isVisible, setIsVisible] = useState(false); // New state for controlling visibility
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to handle delayed appearance
  useEffect(() => {
    if (token) {
      // Show component immediately but keep it minimized
      setIsVisible(true);
      // After 2 seconds, open the chat
      const timer = setTimeout(() => {
        setIsMinimized(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsMinimized(true);
    }
  }, [token]);

  // Effect to initialize socket connection
  useEffect(() => {
    if (token) {
      // Initialize socket connection
      socket = io("http://localhost:4000");
      
      let displayName = "Guest";
      let userId = null;
      try {
        const decoded = jwtDecode(token);
        displayName = decoded.name || "Guest";
        userId = decoded._id;
      } catch (err) {
        console.error("Error decoding JWT:", err);
      }

      // Emit user login event with userId
      socket.emit("userLoggedIn", displayName, userId);
      console.log("User logged in as:", displayName);

      // Set up socket event listeners
      socket.on("botMessage", (message) => {
        setBotTyping(true);
        setTimeout(() => {
          simulateTypingEffect("bot", message);
        }, getRandomTypingDelay());
      });

      // Reset chat state
      setMessages([]);
      setInput("");
      setIsGreetingReceived(false);
      setBotTyping(false);

      // Cleanup function
      return () => {
        if (socket) {
          socket.emit("userLoggedOut");
          socket.off("botMessage");
          socket.disconnect();
        }
      };
    }
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
    }, 30);
  };

  const addMessage = (sender, text, isTyping = false) => {
    if (isTyping) {
      setMessages((prev) => [...prev.slice(0, -1), { sender, text, timestamp: new Date() }]);
    } else {
      setMessages((prev) => [...prev, { sender, text, timestamp: new Date() }]);
    }
  };

  const getRandomTypingDelay = () => {
    return Math.floor(Math.random() * 500) + 500;
  };

  const handleSend = () => {
    if (input.trim() && socket) {
      addMessage("user", input);
      socket.emit("userMessage", input);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChatMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  if (!isVisible) return null;

  return (
    <div className={`chat-container ${isMinimized ? "minimized" : ""}`}>
      <div className="chat-header" onClick={toggleChatMinimize}>
        <img src={assets.profile_icon} alt="Chat Bot" className="bot-avatar" />
        <span>Food Delivery Assistant</span>
        <button className="minimize-button">
          {isMinimized ? "+" : "-"}
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
          >
            <div className="message-content">
              {message.sender === "bot" && (
                <img src={assets.profile_icon} alt="Bot" className="message-avatar" />
              )}
              <div className="message-text">
                {message.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                <span className="message-time">{formatTimestamp(message.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
        {botTyping && (
          <div className="bot-typing">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows="1"
        />
        <button onClick={handleSend} disabled={!input.trim() || botTyping}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
