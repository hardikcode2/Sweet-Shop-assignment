import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      load();
    }
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sweets Shop</h1>

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
            <p className="mt-1">₹{s.price}</p>
            <p className="mt-1">Stock: {s.quantity}</p>

            <button
              onClick={() => purchase(s.id)}
              disabled={s.quantity === 0}
              className="mt-3 bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
