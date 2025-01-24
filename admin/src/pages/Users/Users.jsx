import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Users.css";

const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      console.log('Fetching users from:', `${url}/api/user/list?page=${page}&limit=10`);
      const response = await axios.get(`${url}/api/user/list?page=${page}&limit=10`, {
        withCredentials: true
      });
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.data.message || "Error fetching users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchUsers(currentPage);
    }
  }, [currentPage, url]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`${url}/api/user/${userId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers(currentPage);
      } else {
        toast.error(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Error deleting user");
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const response = await axios.put(
        `${url}/api/user/${userId}/status`,
        { blocked: !isBlocked },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
        fetchUsers(currentPage);
      } else {
        toast.error(response.data.message || `Failed to ${isBlocked ? 'unblock' : 'block'} user`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(error.response?.data?.message || "Error updating user status");
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users-container">
      <h2>Users Management</h2>
      {users.length === 0 ? (
        <div className="no-users">No users found</div>
      ) : (
        <>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${user.isBlocked ? 'blocked' : 'active'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className={`btn ${user.isBlocked ? 'unblock' : 'block'}`}
                        onClick={() => handleBlockUser(user._id, user.isBlocked)}
                      >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        className="btn delete"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn"
              >
                Previous
              </button>
              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`btn ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Users;
