import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // for client-side validation & server errors

  const validate = () => {
    const newErrors = {};

    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(walletAddress.trim())) {
      newErrors.walletAddress = "Wallet address must be 42 hex characters starting with 0x";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be at least 6 chars, include uppercase, number, and special char";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); 

    if (!validate()) return;

    try {
      await login(walletAddress, password);
      navigate("/dashboard");
    } catch (err) {
      setErrors({ server: err.message || "Something went wrong. Please try again." });
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Login</h2>

        {errors.server && (
          <p style={styles.error}>{errors.server}</p>
        )}

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

        <button type="submit" style={styles.button}>Login</button>

        <p style={styles.registerText}>
          Don't have an account? <Link to="/register" style={styles.registerLink}>Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f0f2f5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    padding: "30px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "350px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  input: {
    marginBottom: "5px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  registerText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
    color: "#555",
  },
  registerLink: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "bold",
  },
  error: {
    background: "#ffe6e6",
    color: "#cc0000",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    textAlign: "center",
    fontSize: "14px",
    border: "1px solid #cc0000",
  },
};
