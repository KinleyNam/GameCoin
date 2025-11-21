import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(walletAddress.trim())) {
      newErrors.walletAddress = "Wallet address must be 42 hex characters starting with 0x";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be at least 6 chars, include uppercase, number, and special char";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      await register(name, walletAddress.toLowerCase(), password);
      navigate("/");
    } catch (err) {
      setErrors({ server: err.message || "Something went wrong. Please try again." });
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Register</h2>

        {errors.server && (
          <p style={styles.serverError}>{errors.server}</p>
        )}

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        {errors.name && <p style={styles.error}>{errors.name}</p>}

        <input
          placeholder="Wallet Address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          style={styles.input}
        />
        {errors.walletAddress && <p style={styles.error}>{errors.walletAddress}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        {errors.password && <p style={styles.error}>{errors.password}</p>}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />
        {errors.confirmPassword && <p style={styles.error}>{errors.confirmPassword}</p>}

        <button type="submit" style={styles.button}>Register</button>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <Link to="/" style={styles.loginLink}>Login</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" },
  form: { display: "flex", flexDirection: "column", padding: "30px", borderRadius: "10px", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "350px" },
  title: { textAlign: "center", marginBottom: "20px", color: "#333" },
  input: { marginBottom: "5px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" },
  button: { padding: "10px", borderRadius: "5px", border: "none", backgroundColor: "#4f46e5", color: "#fff", fontSize: "16px", cursor: "pointer", marginTop: "10px" },
  loginText: { textAlign: "center", marginTop: "15px", fontSize: "14px", color: "#555" },
  loginLink: { color: "#4f46e5", textDecoration: "none", fontWeight: "bold" },
  error: { color: "#e53e3e", fontSize: "12px", marginBottom: "10px" },
  serverError: { color: "#e53e3e", fontSize: "14px", textAlign: "center", marginBottom: "10px" },
};
