import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await api.post("/auth/register", { email, password });
    localStorage.setItem("token", res.data.token);
    navigate("/");
  }

  return (
    <form onSubmit={submit} className="p-6 max-w-sm mx-auto space-y-3">
      <h1 className="text-2xl font-bold text-center">Register</h1>

      <input
        className="border p-2 w-full"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="border p-2 w-full"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className="bg-green-600 text-white p-2 w-full">
        Register
      </button>
    </form>
  );
}
