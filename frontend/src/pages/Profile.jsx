import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(""); // store validation/server error
  const [success, setSuccess] = useState(""); // store success message

  useEffect(() => {
    if (user) setName(user.name || "");
  }, [user]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setUpdating(true);
    try {
      const res = await fetch("https://localhost:5000/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.errors && data.errors.length > 0) {
        setError(data.errors[0].msg);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;

    try {
      const res = await fetch("https://localhost:5000/users/me", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Deletion failed");
      }

      setSuccess("Account deleted successfully!");
      logout();
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return null;

  return (
    <div style={styles.container}>
      <form onSubmit={handleUpdate} style={styles.form}>
        <h2 style={styles.title}>Profile</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <label style={styles.label}>Wallet Address (cannot be changed)</label>
        <input value={user.walletAddress} readOnly style={{ ...styles.input, backgroundColor: "#eee" }} />

        <label style={styles.label}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={updating}>
          {updating ? "Updating..." : "Update Profile"}
        </button>

        <hr style={{ margin: "20px 0" }} />

        <button type="button" style={styles.deleteButton} onClick={handleDelete}>
          Delete Account
        </button>

        <button
          type="button"
          style={{ ...styles.button, backgroundColor: "#4caf50" }}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" },
  form: { display: "flex", flexDirection: "column", padding: "30px", borderRadius: "10px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "350px" },
  title: { textAlign: "center", marginBottom: "20px", color: "#333" },
  label: { marginBottom: "5px", fontSize: "14px", color: "#555" },
  input: { marginBottom: "15px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" },
  button: { padding: "10px", borderRadius: "5px", border: "none", backgroundColor: "#4f46e5", color: "#fff", fontSize: "16px", cursor: "pointer", marginBottom: "10px" },
  deleteButton: { padding: "10px", borderRadius: "5px", border: "none", backgroundColor: "#e53e3e", color: "#fff", fontSize: "16px", cursor: "pointer", marginBottom: "10px" },
  error: { color: "#e53e3e", marginBottom: "10px", textAlign: "center" },
  success: { color: "#4caf50", marginBottom: "10px", textAlign: "center" },
};
