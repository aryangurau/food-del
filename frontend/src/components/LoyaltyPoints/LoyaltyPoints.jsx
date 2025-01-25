import { useApp } from '../../context/AppContext';
import './LoyaltyPoints.css';

const LoyaltyPoints = () => {
  const { theme, language, loyaltyPoints } = useApp();

  const rewards = [
    {
      id: 1,
      points: 100,
      reward: 'Free Delivery',
      description: 'Get free delivery on your next order'
    },
    {
      id: 2,
      points: 200,
      reward: '10% Off',
      description: 'Get 10% off on your next order'
    },
    {
      id: 3,
      points: 500,
      reward: '25% Off',
      description: 'Get 25% off on your next order'
    },
    {
      id: 4,
      points: 1000,
      reward: '50% Off',
      description: 'Get 50% off on your next order'
    }
  ];

  return (
    <div 
      className="loyalty-container"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="loyalty-header">
        <h2>{language.loyalty}</h2>
        <div 
          className="points-display"
          style={{ backgroundColor: theme.primary }}
        >
          <span className="points-value">{loyaltyPoints}</span>
          <span className="points-label">Points</span>
        </div>
      </div>

      <div className="loyalty-progress">
        <div 
          className="progress-bar"
          style={{ backgroundColor: theme.secondary }}
        >
          <div 
            className="progress-fill"
            style={{ 
              backgroundColor: theme.accent,
              width: `${Math.min((loyaltyPoints / 1000) * 100, 100)}%`
            }}
          />
        </div>
        <span className="progress-text">
          {1000 - loyaltyPoints} points until next tier
        </span>
      </div>

      <div className="rewards-grid">
        {rewards.map(reward => (
          <div 
            key={reward.id}
            className="reward-card"
            style={{ backgroundColor: theme.secondary }}
          >
            <div 
              className="reward-header"
              style={{ backgroundColor: theme.primary }}
            >
              <h3>{reward.reward}</h3>
              <span className="points-required">{reward.points} Points</span>
            </div>
            <div className="reward-content">
              <p>{reward.description}</p>
              <button
                className={loyaltyPoints >= reward.points ? 'active' : 'disabled'}
                disabled={loyaltyPoints < reward.points}
                style={{ 
                  backgroundColor: loyaltyPoints >= reward.points 
                    ? theme.accent 
                    : theme.secondary 
                }}
              >
                {loyaltyPoints >= reward.points ? 'Redeem' : 'Not Enough Points'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoyaltyPoints;
