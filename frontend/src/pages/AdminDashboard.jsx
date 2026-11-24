import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
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
      const data = await res.json();
      if (res.ok) setRestaurants(data);
      else setRestaurants([]);
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

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/restaurants/${restaurant.id}/menus`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMenus(data);
    } catch (e) {
      setMenus([]);
    }
  };

  const selectMenu = async (menu) => {
    setItems([]);
    setMetrics({});

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${base}/api/admin/menus/${menu.id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setItems(data);
    } catch (e) {
      setItems([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-left">
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
          No restaurants found. Load the sample menu from the customer wizard first.
        </div>
      )}

      {restaurants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map(restaurant => (
              <button
                key={restaurant.id}
                onClick={() => selectRestaurant(restaurant)}
                className={`border rounded-lg p-4 text-left transition-colors ${
                  selectedRestaurant?.id === restaurant.id
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-200 hover:border-accent'
                }`}
              >
                <h3 className="font-bold text-lg text-ink">{restaurant.name}</h3>
                <p className="text-sm text-gray-500">{restaurant.location || 'No location'}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedRestaurant && menus.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Menus for {selectedRestaurant.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => selectMenu(menu)}
                className="border rounded-lg p-4 text-left hover:border-accent transition-colors"
              >
                <h3 className="font-bold text-ink">{menu.name || 'Menu'}</h3>
                <p className="text-sm text-gray-500 truncate">{menu.raw_menu_text?.slice(0, 80) || 'No description'}</p>
                <p className="text-xs text-gray-400 mt-1">Type: {menu.upload_type}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Allergens</th>
                  <th className="py-2 pr-4">Category</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 pr-4 font-medium text-ink">{item.name}</td>
                    <td className="py-2 pr-4">£{Number(item.price).toFixed(2)}</td>
                    <td className="py-2 pr-4">
                      {item.allergens?.length > 0 ? item.allergens.join(', ') : '—'}
                    </td>
                    <td className="py-2 pr-4">{item.category || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRestaurant && menus.length > 0 && items.length === 0 && (
        <p className="text-gray-500 mt-4">Select a menu to view its items.</p>
      )}
    </div>
  );
}
