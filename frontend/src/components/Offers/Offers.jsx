import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Offers.css';

const Offers = () => {
  const { theme, language } = useApp();
  const [offers, setOffers] = useState([
    {
      id: 1,
      code: 'WELCOME50',
      discount: '50% OFF',
      description: 'Get 50% off on your first order',
      validUntil: '2025-02-28',
      minOrder: 500
    },
    {
      id: 2,
      code: 'SPECIAL20',
      discount: '20% OFF',
      description: 'Special discount on orders above Rs. 1000',
      validUntil: '2025-02-15',
      minOrder: 1000
    }
  ]);

  return (
    <div className="offers-container" style={{ backgroundColor: theme.background, color: theme.text }}>
      <h2>{language.offers}</h2>
      <div className="offers-grid">
        {offers.map(offer => (
          <div key={offer.id} className="offer-card" style={{ backgroundColor: theme.secondary }}>
            <div className="offer-header" style={{ backgroundColor: theme.primary }}>
              <h3>{offer.discount}</h3>
              <span className="promo-code">{offer.code}</span>
            </div>
            <div className="offer-content">
              <p>{offer.description}</p>
              <div className="offer-details">
                <span>Min. Order: Rs. {offer.minOrder}</span>
                <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
              </div>
              <button 
                className="copy-code"
                onClick={() => {
                  navigator.clipboard.writeText(offer.code);
                  alert('Promo code copied!');
                }}
                style={{ backgroundColor: theme.accent }}
              >
                Copy Code
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
