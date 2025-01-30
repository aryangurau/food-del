import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./Loyalty.css";
import { toast } from "react-hot-toast";
import { FaStar, FaGift, FaHistory, FaInfoCircle } from 'react-icons/fa';

const Loyalty = () => {
  const { url, token } = useContext(StoreContext);
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoyaltyData = async () => {
    try {
      const pointsRes = await axios.get(`${url}/api/loyalty/points`, {
        headers: { 'Authorization': `Bearer ${token}`, 'token': token }
      });

      if (pointsRes.data.success) {
        setPoints(pointsRes.data.points);
        setTransactions(pointsRes.data.transactions);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch loyalty data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLoyaltyData();
    }
  }, [token, url]);

  const MAX_POINTS = 300;
  const progressPercentage = (points / MAX_POINTS) * 100;

  if (loading) {
    return <div className="loyalty-loading">Loading loyalty data...</div>;
  }

  return (
    <div className="loyalty-container">
      <div className="loyalty-header">
        <FaStar className="loyalty-icon" />
        <h2>My Loyalty Points</h2>
      </div>

      <div className="loyalty-info">
        <FaInfoCircle className="info-icon" />
        <div className="info-content">
          <h3>How Points Work</h3>
          <ul>
            <li>Earn 10 points for every ₹100 spent on orders</li>
            <li>Redeem 300 points for a 50% discount on your next order</li>
            <li>Points are not earned when redeeming a discount</li>
          </ul>
        </div>
      </div>

      <div className="points-progress-section">
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            <span className="progress-text">{points}/{MAX_POINTS}</span>
          </div>
        </div>
        <div className="points-milestones">
          <span>0</span>
          <span>100</span>
          <span>200</span>
          <span>300</span>
        </div>
        <div className="current-points">
          <h3>{points}</h3>
          <p>Points Available</p>
          {points >= 300 && (
            <div className="redemption-available">
              You have enough points for a 50% discount!
            </div>
          )}
        </div>
      </div>

      <div className="points-history">
        <h3><FaHistory /> Points History</h3>
        <div className="transactions-list">
          {transactions.map((transaction, index) => (
            <div 
              key={index} 
              className={`transaction-item ${transaction.type}`}
            >
              <div className="transaction-info">
                <p>{transaction.description}</p>
                <span className="transaction-date">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className={`points-change ${transaction.type}`}>
                {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loyalty;