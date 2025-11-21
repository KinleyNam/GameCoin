import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current logged-in user
  async function fetchUser() {
    setLoading(true);
    try {
      const res = await fetch("https://localhost:5000/users/me", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user); 
    } catch (err) {
      console.error("Fetch user failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser(); // run on mount
  }, []);

  async function register(name, walletAddress, password) {
    const res = await fetch("https://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, walletAddress, password }),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {}

    //Express-validator errors
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].msg);
    }

    //Backend custom errors
    if (!res.ok) {
      throw new Error(data.error || "Registration failed");
    }
    await fetchUser();
    return true;
  }

  async function login(walletAddress, password) {
    const res = await fetch("https://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ walletAddress, password }),
    });

    const data = await res.json().catch(() => ({}));

    //express-validator errors
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].msg);
    }

    //backend custom errors
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    await fetchUser();
    return true;
  }

  async function logout() {
    await fetch("https://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
