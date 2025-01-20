import "./ChatComponent.css";
import { useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import { StoreContext } from "../../context/StoreContext";
import { jwtDecode } from "jwt-decode";
import { assets } from "../../assets/assets";

// Establish a Socket.IO connection
const socket = io("http://localhost:4000");

const ChatComponent = () => {
  const { token } = useContext(StoreContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [isGreetingReceived, setIsGreetingReceived] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to run on token change (either login or logout)
  useEffect(() => {
    setMessages([]);
    setInput("");
    setIsGreetingReceived(false);
    setBotTyping(false);

    if (token) {
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

      socket.on("botMessage", (message) => {
        setBotTyping(true);
        setTimeout(() => {
          simulateTypingEffect("bot", message);
        }, getRandomTypingDelay());
      });
    } else {
      socket.emit("userLoggedOut");
    }

    return () => {
      socket.off("botMessage");
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
    }, 30); // Faster typing speed
  };

  const addMessage = (sender, text, isTyping = false) => {
    if (isTyping) {
      setMessages((prev) => [...prev.slice(0, -1), { sender, text, timestamp: new Date() }]);
    } else {
      setMessages((prev) => [...prev, { sender, text, timestamp: new Date() }]);
    }
  };

  const getRandomTypingDelay = () => {
    return Math.floor(Math.random() * 500) + 500; // Faster response time
  };

  const handleSend = () => {
    if (input.trim()) {
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

  return (
    <div className={`chat-container ${isMinimized ? "minimized" : ""}`}>
      <div className="chat-header" onClick={toggleChatMinimize}>
        <img src={assets.bot} alt="Chat Bot" className="bot-avatar" />
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
                <img src={assets.bot} alt="Bot" className="message-avatar" />
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
