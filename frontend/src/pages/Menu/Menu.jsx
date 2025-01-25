import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import axios from 'axios';
import './Menu.css';

const Menu = () => {
  const { theme, language, addToWishlist, wishlist } = useApp();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/food/list');
        if (response.data.success) {
          setMenuItems(response.data.data);
          // Extract unique categories
          const uniqueCategories = [...new Set(response.data.data.map(item => item.category))];
          setCategories(['all', ...uniqueCategories]);
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div 
        className="menu-loading"
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        <div className="loader"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div 
      className="menu-container"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      <div className="menu-header">
        <h1>{language.menu}</h1>
        <div 
          className="categories"
          style={{ backgroundColor: theme.secondary }}
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'active' : ''}
              style={{ 
                backgroundColor: selectedCategory === category ? theme.primary : 'transparent',
                color: selectedCategory === category ? 'white' : theme.text
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-grid">
        {filteredItems.map(item => (
          <div 
            key={item._id} 
            className="menu-item"
            style={{ backgroundColor: theme.secondary }}
          >
            <img src={item.image} alt={item.name} />
            <div className="menu-item-content">
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <div className="price-rating">
                <span className="price">Rs. {item.price}</span>
                <span className="rating">★ {item.rating}</span>
              </div>
              <div className="menu-actions">
                <button 
                  className="add-to-cart"
                  style={{ backgroundColor: theme.primary }}
                >
                  Add to Cart
                </button>
                <button 
                  className="add-to-wishlist"
                  onClick={() => addToWishlist(item)}
                  style={{ 
                    backgroundColor: wishlist.some(w => w.id === item._id) 
                      ? theme.accent 
                      : theme.secondary,
                    color: theme.text
                  }}
                >
                  {wishlist.some(w => w.id === item._id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
