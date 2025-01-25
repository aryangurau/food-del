import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from "react-toastify";
import EditFoodModal from '../../components/EditFoodModal/EditFoodModal';
import "./List.css";

const List = ({ url }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [editingFood, setEditingFood] = useState(null);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async (page = 1) => {
    try {
      const response = await axios.get(`${url}/api/food/list?page=${page}&limit=10`);
      if (response.data.success) {
        setFoodItems(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      toast.error("Error fetching food items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: id });
      if (response.data.success) {
        setFoodItems(foodItems.filter(item => item._id !== id));
        toast.success("Food item deleted successfully");
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
      toast.error("Error deleting food item");
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
  };

  const handleUpdate = (updatedFood) => {
    setFoodItems(foodItems.map(item => 
      item._id === updatedFood._id ? updatedFood : item
    ));
    toast.success("Food item updated successfully");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchFoodItems(page);
  };

  if (loading) {
    return (
      <div className="list-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>All Food Items</h2>
      </div>
      
      <div className="list-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foodItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <img 
                    src={`${url}/images/` + item.image} 
                    alt={item.name} 
                    className="food-image"
                  />
                </td>
                <td>
                  <span className="food-name">{item.name}</span>
                </td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
                <td>
                  <span className="price">${item.price}</span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(item)}
                    title="Edit item"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(item._id)}
                    title="Delete item"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        
        <div className="pagination-numbers">
          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>

      <div className="pagination-info">
        Showing {((currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} items
      </div>

      {editingFood && (
        <EditFoodModal
          food={editingFood}
          onClose={() => setEditingFood(null)}
          onUpdate={handleUpdate}
          url={url}
        />
      )}
    </div>
  );
};

export default List;
