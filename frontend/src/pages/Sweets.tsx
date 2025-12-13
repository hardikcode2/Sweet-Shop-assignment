import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";

type Sweet = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export default function Sweets() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restocking, setRestocking] = useState<string | null>(null);
  const [editing, setEditing] = useState<Sweet | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [adding, setAdding] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editQuantity, setEditQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [restockAmounts, setRestockAmounts] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/sweets");
      setSweets(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load sweets");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function performSearch() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("name", search);
      if (searchCategory) params.append("category", searchCategory);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      if (params.toString()) {
        const res = await api.get(`/sweets/search?${params.toString()}`);
        setSweets(res.data);
      } else {
        load();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function searchSweets(value: string) {
    setSearch(value);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search || searchCategory || minPrice || maxPrice) {
        performSearch();
      } else {
        load();
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchCategory, minPrice, maxPrice]);

  function clearFilters() {
    setSearch("");
    setSearchCategory("");
    setMinPrice("");
    setMaxPrice("");
  }

  async function purchase(id: string) {
    try {
      setPurchasing(id);
      setError("");
      await api.post(`/sweets/${id}/purchase`);
      setSuccess("Purchase successful!");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Purchase failed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setPurchasing(null);
    }
  }

  async function deleteSweet(id: string) {
    if (!confirm("Are you sure you want to delete this sweet?")) {
      return;
    }
    try {
      setDeleting(id);
      setError("");
      await api.delete(`/sweets/${id}`);
      setSuccess("Sweet deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Delete failed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(sweet: Sweet) {
    setEditing(sweet);
    setEditName(sweet.name);
    setEditCategory(sweet.category);
    setEditPrice(sweet.price);
    setEditQuantity(sweet.quantity);
  }

  function cancelEdit() {
    setEditing(null);
    setEditName("");
    setEditCategory("");
    setEditPrice(0);
    setEditQuantity(0);
  }

  async function updateSweet(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      setUpdating(true);
      setError("");
      await api.put(`/sweets/${editing.id}`, {
        name: editName,
        category: editCategory,
        price: editPrice,
        quantity: editQuantity,
      });
      setSuccess("Sweet updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
      cancelEdit();
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update sweet");
      setTimeout(() => setError(""), 5000);
    } finally {
      setUpdating(false);
    }
  }

  async function restockSweet(id: string) {
    const amount = Number(restockAmounts[id]);
    if (!amount || amount <= 0) {
      setError("Please enter a valid restock amount");
      setTimeout(() => setError(""), 5000);
      return;
    }
    try {
      setRestocking(id);
      setError("");
      await api.post(`/sweets/${id}/restock`, { amount });
      setSuccess(`Restocked ${amount} items successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      setRestockAmounts({ ...restockAmounts, [id]: "" });
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Restock failed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setRestocking(null);
    }
  }

  async function addSweet(e: React.FormEvent) {
    e.preventDefault();
    try {
      setAdding(true);
      setError("");
      await api.post("/sweets", { name, category, price, quantity });
      setName("");
      setCategory("");
      setPrice(0);
      setQuantity(0);
      setSuccess("Sweet added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add sweet");
      setTimeout(() => setError(""), 5000);
    } finally {
      setAdding(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setIsAdmin(getUserRole() === "ADMIN");
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🍬 Sweets Shop</h1>
            <p className="text-gray-600">
              {isAdmin ? "Admin Dashboard" : "Browse our delicious collection"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md">
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Admin Add Form */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Sweet</h2>
            <form onSubmit={addSweet} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Sweet Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={adding}
              />
              <input
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={adding}
              />
              <input
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                type="number"
                step="0.01"
                min="0"
                placeholder="Price (₹)"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                disabled={adding}
              />
              <input
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                type="number"
                min="0"
                placeholder="Quantity"
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                disabled={adding}
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add Sweet"}
              </button>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <input
                className="w-full border border-gray-300 rounded-lg p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="🔍 Search by name..."
                value={search}
                onChange={(e) => searchSweets(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors font-medium"
            >
              {showAdvancedSearch ? "Hide" : "Advanced"} Filters
            </button>
            {(search || searchCategory || minPrice || maxPrice) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Advanced Search */}
          {showAdvancedSearch && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filter by category..."
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Minimum price..."
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Maximum price..."
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && sweets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🍭</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No sweets found</h3>
            <p className="text-gray-600">
              {search ? "Try a different search term" : "Check back later for new sweets!"}
            </p>
          </div>
        )}

        {/* Sweets Grid */}
        {!loading && sweets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sweets.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-gray-800">{s.name}</h2>
                    <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                      {s.category}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-2xl font-bold text-purple-600">₹{s.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span
                        className={`font-semibold ${
                          s.quantity > 10
                            ? "text-green-600"
                            : s.quantity > 0
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {s.quantity} {s.quantity === 0 && "(Out of Stock)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => purchase(s.id)}
                      disabled={s.quantity === 0 || purchasing === s.id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {purchasing === s.id ? "Purchasing..." : "Purchase"}
                    </button>

                    {isAdmin && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSweet(s.id)}
                          disabled={deleting === s.id}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {deleting === s.id ? (
                            <svg className="animate-spin h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Restock amount"
                          value={restockAmounts[s.id] || ""}
                          onChange={(e) => setRestockAmounts({ ...restockAmounts, [s.id]: e.target.value })}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && restockAmounts[s.id]) {
                              restockSweet(s.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => restockSweet(s.id)}
                          disabled={!restockAmounts[s.id] || restocking === s.id}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {restocking === s.id ? "..." : "Restock"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Sweet</h2>
              <form onSubmit={updateSweet} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={editPrice || ""}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    required
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={editQuantity || ""}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    required
                    disabled={updating}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-3 rounded-lg transition-colors"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
