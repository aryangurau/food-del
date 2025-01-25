import { useApp } from '../../context/AppContext';
import './Wishlist.css';

const Wishlist = () => {
  const { theme, language, wishlist, removeFromWishlist } = useApp();

  if (wishlist.length === 0) {
    return (
      <div 
        className="wishlist-empty"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <h2>{language.wishlist}</h2>
        <p>Your wishlist is empty</p>
      </div>
    );
  }

  return (
    <div 
      className="wishlist-container"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <h2>{language.wishlist}</h2>
      <div className="wishlist-grid">
        {wishlist.map(item => (
          <div 
            key={item.id} 
            className="wishlist-item"
            style={{ backgroundColor: theme.secondary }}
          >
            <img src={item.image} alt={item.name} />
            <div className="wishlist-item-content">
              <h3>{item.name}</h3>
              <p>Rs. {item.price}</p>
              <div className="wishlist-actions">
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  style={{ backgroundColor: theme.accent }}
                >
                  Remove
                </button>
                <button 
                  onClick={() => {/* Add to cart logic */}}
                  style={{ backgroundColor: theme.primary }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
