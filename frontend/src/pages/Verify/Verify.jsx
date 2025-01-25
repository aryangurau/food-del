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
  const { url } = useContext(StoreContext);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!sessionId) {
          toast.error("Invalid session");
          navigate("/");
          return;
        }

        const response = await axios.post(url + "/api/order/verify", {
          success: success === "true",
          sessionId
        });

        if (response.data.success) {
          toast.success("Order placed successfully!");
          navigate("/myorders");
        } else {
          toast.error(response.data.message || "Payment verification failed");
          navigate("/");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        toast.error(error.response?.data?.message || "Payment verification failed");
        navigate("/");
      }
    };

    verifyPayment();
  }, [success, sessionId, url, navigate]);

  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;
