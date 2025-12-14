import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url(/bg-pic.png)" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      <form
        onSubmit={submit}
        className="relative z-10 bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/30 max-w-sm w-full space-y-4"
      >
        <h1 className="text-3xl font-bold text-center text-white mb-6 drop-shadow-lg">
          Register
        </h1>

        {error && (
          <div className="bg-red-500/80 backdrop-blur-sm border border-red-300/50 text-white px-4 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}

        <input
          className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 placeholder:text-gray-600 text-gray-800"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <input
          className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 placeholder:text-gray-600 text-gray-800"
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={8}
        />

        <button
          type="submit"
          className="bg-green-600/90 hover:bg-green-700/90 backdrop-blur-sm text-white font-semibold p-3 w-full rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm text-white drop-shadow-md">
          Already have an account?{" "}
          <Link to="/login" className="text-green-700 hover:text-green-100 font-semibold underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
