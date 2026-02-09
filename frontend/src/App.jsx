import React, { useEffect, useState } from "react";

const API_BASE = "/api";

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Try to get current user session
    fetch(`${API_BASE}/auth/me`, {
      credentials: "include"
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    fetchNotes();
  }, []);

  async function fetchNotes(query = "") {
    try {
      const url = query ? `${API_BASE}/notes?search=${encodeURIComponent(query)}` : `${API_BASE}/notes`;
      const res = await fetch(url);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Authentication failed");
        return;
      }
      setUser(data.user);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Auth error", err);
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
  }

  async function handleCreateNote(e) {
    e.preventDefault();
    setError("");
    if (!newTitle || !newBody) {
      setError("Title and body are required");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle, body: newBody })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to create note");
        return;
      }
      setNewTitle("");
      setNewBody("");
      fetchNotes(search);
    } catch (err) {
      console.error("Create note error", err);
      setError("Failed to create note");
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchNotes(search);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Shared Notes</h1>
        <div className="header-right">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="btn secondary">
                Logout
              </button>
            </>
          ) : null}
        </div>
      </header>

      <main className="layout">
        <section className="panel auth-panel">
          <h2>{authMode === "login" ? "Login" : "Register"}</h2>
          <div className="auth-toggle">
            <button
              className={authMode === "login" ? "tab active" : "tab"}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
            <button
              className={authMode === "register" ? "tab active" : "tab"}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleAuthSubmit} className="form">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
          {!user && (
            <p className="hint">
              You need to be logged in to post notes, but anyone can search and read them.
            </p>
          )}
        </section>

        <section className="panel notes-panel">
          <div className="notes-header">
            <h2>Notes</h2>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="search"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn secondary" type="submit">
                Search
              </button>
            </form>
          </div>

          {user && (
            <form onSubmit={handleCreateNote} className="form note-form">
              <h3>Post a note</h3>
              <label>
                Title
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Body
                <textarea
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  required
                />
              </label>
              <button className="btn primary" type="submit">
                Publish
              </button>
            </form>
          )}

          <ul className="notes-list">
            {notes.map((note) => (
              <li key={note._id} className="note-card">
                <h3>{note.title}</h3>
                <p className="note-body">{note.body}</p>
                <div className="note-meta">
                  <span>{note.author?.email || "Anonymous"}</span>
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                </div>
              </li>
            ))}
            {notes.length === 0 && <p className="empty-state">No notes yet. Try posting one!</p>}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;

