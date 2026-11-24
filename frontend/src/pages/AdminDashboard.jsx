import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);

  const base = import.meta.env.VITE_API_BASE_URL || '';

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/restaurants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
      } else {
        setRestaurants([]);
      }
    } catch (e) {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const selectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenus([]);
    setItems([]);
    setMetrics({});
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/restaurants/${restaurant.id}/menus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMenus(data);
      }
    } catch (e) {
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const selectMenu = async (menu) => {
    setItems([]);
    setMetrics({});
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/menus/${menu.id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (restaurantId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/metrics/${restaurantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        setMetrics({});
      }
    } catch (e) {
      setMetrics({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-ink">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-2 rounded bg-accent text-white text-sm"
        >
          Customer Wizard
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading restaurants...</p>}

      {restaurants.length === 0 && !loading && (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No restaurants available
        </div>
      )}

      {selectedRestaurant && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Restaurant: {selectedRestaurant.name}
          </h2>

          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-3">Menus</h2>
            {menus.length === 0 ? (
              <p className="text-gray-500">No menus available for this restaurant</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menus.map(menu => (
                  <button
                    key={menu.id}
                    onClick={() => selectMenu(menu)}
                    className="border rounded-lg p-4 text-left hover:border-accent transition-colors"
                  >
                    <h3 className="font-bold">{menu.name || 'Menu'}</h3>
                    <p className="text-sm text-gray-500 truncate">{menu.raw_menu_text?.slice(0, 80) || 'No description'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Type: {menu.upload_type}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 bg-white">
                    <h4 className="font-bold text-ink">{item.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{item.description}</p>
                    <p className="text-sm font-medium mt-2">£{Number(item.price).toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Allergens: {item.allergens?.join(', ') || '—'}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      <span>Views: {metrics.totalViews}</span>
                      <span className="ml-2 badge bg-green-600">{metrics.shortlisted}</span>
                      <span className="ml-2 badge bg-red-600">{metrics.removed}</span>
                      <span className="ml-2 badge bg-blue-600">{metrics.filtered}</span>
                      <span className="ml-2 badge bg-purple-600">{metrics.finalChoice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}