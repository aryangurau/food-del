import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './EditFoodModal.css';

const EditFoodModal = ({ food, onClose, onUpdate, url }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name,
        category: food.category,
        price: food.price,
        description: food.description || '',
        image: null
      });
    }
  }, [food]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({
        ...prev,
        image: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.put(`${url}/api/food/update/${food._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Food item updated successfully');
        onUpdate(response.data.data);
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update food item');
      }
    } catch (error) {
      console.error('Error updating food item:', error);
      toast.error(error.response?.data?.message || 'Failed to update food item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Food Item</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              accept="image/*"
              disabled={isSubmitting}
            />
            <small>Leave empty to keep current image</small>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFoodModal;
