import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./Loyalty.css";
import { toast } from "react-hot-toast";
import { FaStar, FaGift, FaHistory } from 'react-icons/fa';

const Loyalty = () => {
  const { url, token } = useContext(StoreContext);
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoyaltyData = async () => {
    try {
      const [pointsRes, rewardsRes] = await Promise.all([
        axios.get(`${url}/api/loyalty/points`, {
          headers: { 'Authorization': `Bearer ${token}`, 'token': token }
        }),
        axios.get(`${url}/api/loyalty/rewards`, {
          headers: { 'Authorization': `Bearer ${token}`, 'token': token }
        })
      ]);

      if (pointsRes.data.success) {
        setPoints(pointsRes.data.points);
        setTransactions(pointsRes.data.transactions);
      }

      if (rewardsRes.data.success) {
        setRewards(rewardsRes.data.rewards);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch loyalty data");
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      const response = await axios.post(
        `${url}/api/loyalty/redeem`,
        { rewardId },
        { headers: { 'Authorization': `Bearer ${token}`, 'token': token } }
      );

      if (response.data.success) {
        toast.success("Reward redeemed successfully!");
        fetchLoyaltyData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to redeem reward");
    }
  };

  useEffect(() => {
    if (token) {
      fetchLoyaltyData();
    }
  }, [token]);

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
        </div>
      </div>

      <div className="rewards-section">
        <h3><FaGift /> Available Rewards</h3>
        <div className="rewards-grid">
          {rewards.map(reward => (
            <div key={reward._id} className="reward-card">
              <h4>{reward.name}</h4>
              <p>{reward.description}</p>
              <p className="points-cost">{reward.pointsCost} points</p>
              <button
                onClick={() => redeemReward(reward._id)}
                disabled={points < reward.pointsCost}
              >
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="transactions-section">
        <h3><FaHistory /> Points History</h3>
        <div className="transactions-list">
          {transactions.map(transaction => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-info">
                <p className="transaction-description">{transaction.description}</p>
                <p className="transaction-date">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className={`transaction-points ${transaction.type}`}>
                {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loyalty;