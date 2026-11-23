import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ALLERGENS = [
  'Gluten','Dairy','Nuts','Peanuts','Shellfish','Fish','Eggs','Soy','Sesame','Mustard','Celery','Sulphites'
];

export default function Upload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1:source, 2:allergens, 3:dislikes, 4:shortlist
  const [menuText, setMenuText] = useState('');
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [dislikeInput, setDislikeInput] = useState('');
  const [dislikes, setDislikes] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [finalChoice, setFinalChoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const base = import.meta.env.VITE_API_BASE_URL || '';

  const loadSample = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${base}/api/upload/sample`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load sample');
      setRestaurantId(data.restaurantId);
      setMenuId(data.menuId);
      // fetch items
      const itemsRes = await fetch(`${base}/api/menus/${data.menuId}/items`);
      const itemsData = await itemsRes.json();
      setItems(itemsData);
      setSampleLoaded(true);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseUploadedText = async () => {
    if (!menuText.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Use sample restaurantId for demo (normally user selects a restaurant)
      const res = await fetch(`${base}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurantId || '00000000-0000-0000-0000-000000000000',
          uploadType: 'text',
          rawText: menuText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload');
      setMenuId(data.menuId);
      setItems(data.items);
      setSampleLoaded(true);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergen = (a) => {
    setSelectedAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const addDislike = () => {
    if (dislikeInput.trim()) {
      setDislikes((prev) => [...prev, ...dislikeInput.split(',').map((s) => s.trim()).filter(Boolean)]);
      setDislikeInput('');
    }
  };

  const removeDislike = (idx) => {
    setDislikes((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleShortlist = (itemId) => {
    setShortlisted((prev) =>
      prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
    );
  };

  const setFinal = (itemId) => {
    setFinalChoice(itemId);
    // save session when final choice set
    saveSession(itemId);
  };

  const saveSession = async (finalChoiceId) => {
    const token = localStorage.getItem('token');
    if (!token || !restaurantId) return;
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
    // create or update session: for MVP, create new session on final choice
    try {
      const sessionRes = await fetch(`${base}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          restaurantId,
          finalChoice: finalChoiceId || null,
          shortlistedItems: shortlisted
        })
      });
      if (sessionRes.ok) {
        // optionally update session with final choice
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFilteredItems = () => {
    return items.filter((item) => {
      // allergen filter
      if (item.allergens?.some((a) => selectedAllergens.includes(a))) return false;
      // dislike filter (keyword match on name + description)
      const text = `${item.name} ${item.description || ''}`.toLowerCase();
      if (dislikes.some((d) => text.includes(d.toLowerCase()))) return false;
      return true;
    });
  };

  const filteredItems = getFilteredItems();
  const shortlistedItems = filteredItems.filter((i) => shortlisted.includes(i.id));

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Step {step} of 4</h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Menu</h3>
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              disabled={loading}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Sample Menu'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Paste menu text</label>
            <textarea
              value={menuText}
              onChange={(e) => setMenuText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Paste menu here..."
            />
            <button
              onClick={parseUploadedText}
              disabled={loading || !menuText.trim()}
              className="mt-2 px-4 py-2 bg-ink text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              Parse Menu
            </button>
          </div>
          {sampleLoaded && (
            <div className="p-4 bg-green-50 border rounded">
              <p className="text-green-800">Menu loaded: {items.length} items</p>
              <button
                onClick={() => setStep(2)}
                className="mt-2 px-4 py-2 bg-accent text-white rounded"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Allergens to Filter</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ALLERGENS.map((a) => (
              <label key={a} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAllergens.includes(a)}
                  onChange={() => toggleAllergen(a)}
                  className="w-4 h-4"
                />
                <span>{a}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => setStep(3)}
            className="px-4 py-2 bg-accent text-white rounded"
          >
            Continue to Dislikes
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add Dislikes</h3>
          <div className="flex gap-2">
            <input
              value={dislikeInput}
              onChange={(e) => setDislikeInput(e.target.value)}
              placeholder="e.g. fish, mushrooms, spicy"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={addDislike}
              className="px-4 py-2 bg-ink text-white rounded"
            >
              Add
            </button>
          </div>
          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {dislikes.map((d, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-200 rounded text-sm cursor-pointer"
                  onClick={() => removeDislike(i)}
                >
                  {d} &times;
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setStep(4)}
            className="px-4 py-2 bg-accent text-white rounded"
          >
            View Shortlist
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Shortlist</h3>
          <p className="text-sm text-gray-600">
            {filteredItems.length} items remaining after filters.
            {shortlistedItems.length} shortlisted.
          </p>
          {finalChoice && (
            <div className="p-4 bg-green-50 border rounded">
              <p className="text-green-800">Final choice: {items.find((i) => i.id === finalChoice)?.name}</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`border rounded p-4 flex flex-col ${
                  shortlisted.includes(item.id) ? 'border-accent ring-2 ring-accent' : ''
                }`}
              >
                <h4 className="font-bold text-lg">{item.name}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  <span>£{item.price?.toFixed(2)}</span>
                  {item.calories && <span className="ml-2">{item.calories} cal</span>}
                  {item.allergens?.length > 0 && (
                    <span className="ml-2 text-xs">Allergens: {item.allergens.join(', ')}</span>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => toggleShortlist(item.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      shortlisted.includes(item.id)
                        ? 'bg-accent text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {shortlisted.includes(item.id) ? 'Shortlisted' : 'Shortlist'}
                  </button>
                  {shortlisted.includes(item.id) && (
                    <button
                      onClick={() => setFinal(item.id)}
                      className="px-3 py-1 rounded text-sm bg-ink text-white"
                    >
                      Most Likely
                    </button>
                  )}
                </div>
                {shortlisted.includes(item.id) && (
                  <p className="text-xs mt-1 text-accent">Matches your preferences</p>
                )}
              </div>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <p className="text-gray-600">No items left after filtering. Try adjusting allergens/dislikes.</p>
          )}
        </div>
      )}
    </div>
  );
}