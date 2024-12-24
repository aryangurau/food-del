import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../FoodDisplay/FoodDisplay.css"; // Reuse FoodDisplay CSS for consistency
import FoodItem from "../FoodItem/FoodItem"; // Import FoodItem component
import { StoreContext } from "../../context/StoreContext"; // For `url`

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const location = useLocation();
  const { url } = useContext(StoreContext);

  const query = new URLSearchParams(location.search).get("query");

  const fetchSearchResults = async () => {
    try {
      const response = await axios.get(`${url}/api/food/search?query=${query}`);
      if (response.status === 200 && response.data.success) {
        setResults(response.data.data);
      } else {
        console.error("Search error:", response.data.message || response.status);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]);

  return (
    <div className="food-display" id="search-results">
      <h2>Search Results for "{query}"</h2>
      <div className="food-display-list">
        {results.length > 0 ? (
          results.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
