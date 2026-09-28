import { useState, useEffect } from "react";

const API = "http://localhost:5000";

function authFetch(path, options = {}) {
  return fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...options.headers,
    },
  });
}

function TodoList({ onUnauthorized }) {
  const [todo, setTodo] = useState([]);
  const [text, setText] = useState("");
  useEffect(() => {
    async function load() {
      const res = await authFetch("/todos");
      if (res.status === 401) return onUnauthorized();
      if (res.ok) setTodo(await res.json());
    }
    load();
  }, []);

  async function addTodo() {
    if (text.trim() === "") return;
    const res = await authFetch("/todos", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) {
      const created = await res.json();
      setTodo((prev) => [...prev, created]);
      setText("");
    }
  }

  async function toggleTodo(id, done) {
    const res = await authFetch(`/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ done: !done }),
    });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) {
      const updated = await res.json();
      setTodo((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  }

  async function deleteTodo(id) {
    const res = await authFetch(`/todos/${id}`, { method: "DELETE" });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) {
      setTodo((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-stone-300 transition-colors focus-within:border-stone-900">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task"
          className="flex-1 bg-transparent py-3 text-lg outline-none placeholder:text-stone-400"
        />
        <button
          onClick={addTodo}
          className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
        >
          Add ↵
        </button>
      </div>

      {todo.length === 0 ? (
        <p className="mt-10 text-stone-400">Nothing yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-stone-200">
          {todo.map((item) => (
            <li key={item.id} className="group flex items-center gap-4 py-4">
              <button
                onClick={() => toggleTodo(item.id, item.done)}
                aria-label="Toggle task"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  item.done
                    ? "border-stone-900 bg-stone-900"
                    : "border-stone-300 hover:border-stone-900"
                }`}
              >
                {item.done && (
                  <svg viewBox="0 0 20 20" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 10.5l3.5 3.5L15 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <span
                className={`flex-1 text-lg transition-colors ${
                  item.done ? "text-stone-400 line-through" : "text-stone-900"
                }`}
              >
                {item.text}
              </span>

              <button
                onClick={() => deleteTodo(item.id)}
                aria-label="Delete task"
                className="text-stone-300 transition-colors hover:text-stone-900 sm:opacity-0 sm:group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoList;