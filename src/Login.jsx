import { useState, useEffect } from "react";
import TodoList from "./TodoList";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null); 

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setUser(data.username))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch(`${API}/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) return setError(data.error);

    if (mode === "register") {
      setMode("login");
      setPassword("");
      return setError("Account created. Now log in.");
    }

    localStorage.setItem("token", data.token);
    setUser(data.username);
    setPassword("");
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setUsername("");
    setPassword("");
  }

  if (user) {
    return (
      <main className="min-h-screen bg-stone-50 text-stone-900">
        <div className="mx-auto max-w-xl px-6 pt-24 pb-16">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
              Logged in
            </p>
            <button
              onClick={logout}
              className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
              Log out
            </button>
          </div>
          <h1 className="mt-2 mb-10 text-5xl font-semibold tracking-tight">
            Hello, {user}
          </h1>

          <TodoList onUnauthorized={logout} />
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full border-b border-stone-300 bg-transparent py-3 text-lg outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400";

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
          {mode === "login" ? "Log in" : "Register"}
        </h1>

        <div className="mt-10 space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
          />
        </div>

        {error && <p className="mt-4 text-sm text-stone-600">{error}</p>}

        <button
          type="submit"
          className="mt-8 w-full bg-stone-900 text-white py-3 font-medium hover:bg-stone-700 transition-colors"
        >
          {mode === "login" ? "Log in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-4 w-full text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          {mode === "login" ? "No account? Register" : "Have an account? Log in"}
        </button>
      </form>
    </main>
  );
}

export default Login;