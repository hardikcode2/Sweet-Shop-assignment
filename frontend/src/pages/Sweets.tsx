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
  const [isAdmin, setIsAdmin] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const navigate = useNavigate();

  async function load() {
    const res = await api.get("/sweets");
    setSweets(res.data);
  }

  async function searchSweets(value: string) {
    setSearch(value);
    if (!value) {
      load();
      return;
    }
    const res = await api.get(`/sweets/search?name=${value}`);
    setSweets(res.data);
  }

  async function purchase(id: string) {
    await api.post(`/sweets/${id}/purchase`);
    load();
  }

  async function deleteSweet(id: string) {
    await api.delete(`/sweets/${id}`);
    load();
  }

  async function addSweet(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/sweets", { name, category, price, quantity });
    setName("");
    setCategory("");
    setPrice(0);
    setQuantity(0);
    load();
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sweets Shop</h1>

      {/* ADMIN ADD FORM */}
      {isAdmin && (
        <form onSubmit={addSweet} className="mb-6 grid grid-cols-5 gap-2">
          <input
            className="border p-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="border p-2"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <input
            className="border p-2"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
          <input
            className="border p-2"
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <button className="bg-blue-600 text-white rounded">
            Add
          </button>
        </form>
      )}

      <input
        className="border p-2 mb-6 w-full"
        placeholder="Search sweets..."
        value={search}
        onChange={(e) => searchSweets(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sweets.map((s) => (
          <div key={s.id} className="border p-4 rounded">
            <h2 className="font-bold">{s.name}</h2>
            <p className="text-sm text-gray-600">{s.category}</p>
            <p>₹{s.price}</p>
            <p>Stock: {s.quantity}</p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => purchase(s.id)}
                disabled={s.quantity === 0}
                className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Purchase
              </button>

              {isAdmin && (
                <button
                  onClick={() => deleteSweet(s.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
