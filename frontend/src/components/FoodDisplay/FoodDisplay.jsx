import { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 2 items per row * 3 rows

  // Filter items based on category
  const filteredItems = food_list.filter(
    item => category === "All" || category === item.category
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of food display
    document.getElementById('food-display').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {currentItems.map((item, index) => (
          <FoodItem
            key={index}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={currentPage === 1 ? 'disabled' : ''}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={currentPage === totalPages ? 'disabled' : ''}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
