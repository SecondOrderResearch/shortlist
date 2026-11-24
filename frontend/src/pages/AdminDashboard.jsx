import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function AdminDashboard() {
  const { restaurantId } = useParams();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/admin/restaurants')
      .then(res => res.json())
      .then(data => setRestaurants(data))
      .catch(() => setRestaurants([]));
  }, []);

  const selectRestaurant = async (id) => {
    setSelectedRestaurant(restaurants.find(r => r.id === id));
    setMenus([]);
    setItems([]);

    const res = await fetch(`/api/admin/${id}/menus`);
    const data = await res.json();
    setMenus(data);
  };

  const selectMenu = async (menuId) => {
    const res = await fetch(`/api/admin/items/${menuId}`);
    const data = await res.json();
    setItems(data);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {restaurants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No restaurants available
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map(restaurant => (
              <button
                key={restaurant.id}
                onClick={() => selectRestaurant(restaurant.id)}
                className={`border rounded-lg p-4 text-left transition-colors ${
                  selectedRestaurant?.id === restaurant.id
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-200 hover:border-accent'
                }`}
              >
                <h3 className="font-bold text-lg">{restaurant.name}</h3>
                <p className="text-sm text-gray-500">{restaurant.location || 'No location'}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedRestaurant && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Menu for {selectedRestaurant.name}
          </h2>
          
          {menus.length === 0 ? (
            <p className="text-gray-500">No menus available for this restaurant</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {menus.map(menu => (
                <button
                  key={menu.id}
                  onClick={() => selectMenu(menu.id)}
                  className="border rounded-lg p-4 text-left hover:border-accent"
                >
                  <h3 className="font-bold">{menu.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{menu.description}</p>
                </button>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 bg-white">
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <p className="text-sm font-medium mt-2">£{Number(item.price).toFixed(2)}</p>
                    {item.allergens?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Allergens: {item.allergens.join(', ')}
                      </p>
                    )}
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