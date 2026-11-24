import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  useEffect(() => {
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token) {
      navigate('/login', { replace: true });
    } else if (user && user.role !== 'restaurant_admin') {
      // Not an admin - go to customer area
      navigate('/upload', { replace: true });
    }
  }, [token, userStr, navigate]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || user.role !== 'restaurant_admin') {
    return <Navigate to="/upload" replace />;
  }

  return children;
}
