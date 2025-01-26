import { useContext, useEffect } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import toast from 'react-hot-toast';

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const sessionId = searchParams.get("session_id");
  const { url, clearCart } = useContext(StoreContext);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          toast.error("Invalid session");
          navigate("/home");
          return;
        }

        console.log("Verifying payment with session:", sessionId);
        const response = await axios.get(`${url}/api/order/verify?session_id=${sessionId}`);
        console.log("Verification response:", response.data);

        if (response.data.success) {
          toast.success("Order placed successfully!");
          clearCart(); // Clear the cart after successful order
          navigate("/my-orders");
        } else {
          console.error("Verification failed:", response.data);
          toast.error(response.data.message || "Payment verification failed");
          navigate("/home");
        }
      } catch (error) {
        console.error("Payment verification error:", error.response?.data || error);
        toast.error(error.response?.data?.message || "Payment verification failed");
        navigate("/home");
      }
    };

    if (success === "true") {
      verifyPayment();
    } else {
      toast.error("Payment was cancelled");
      navigate("/home");
    }
  }, [success, sessionId, url, navigate, clearCart]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Verifying your payment...</p>
    </div>
  );
};

export default Verify;
