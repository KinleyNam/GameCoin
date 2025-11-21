import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import GamesCoinJSON from "../ContractABI/GamesCoinABI.json";
import { AuthContext } from "../context/AuthContext";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = GamesCoinJSON.abi;

function Dashboard() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");

  const [rewardAddress, setRewardAddress] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");

  const [status, setStatus] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-connect wallet on page load
  useEffect(() => {
    if (user?.walletAddress && !signer) {
      connectWallet();
    }
  }, [user]);

  async function connectWallet() {
    if (!user?.walletAddress) {
      setMessage({ type: "error", text: "User not loaded. Please login first." });
      return;
    }

    try {
      if (!window.ethereum) {
        setMessage({ type: "error", text: "MetaMask not detected!" });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const sign = await provider.getSigner();
      const cont = new ethers.Contract(CONTRACT_ADDRESS, ABI, sign);

      const userAddress = await sign.getAddress();
      if (user.walletAddress.toLowerCase() !== userAddress.toLowerCase()) {
        setMessage({ type: "error", text: `Please connect to your own wallet` });
        return;
      }

      setSigner(sign);
      setContract(cont);
      setAddress(userAddress);

      const bal = await cont.balanceOf(userAddress);
      const name = await cont.name();
      const symbol = await cont.symbol();
      const supply = await cont.totalSupply();

      setBalance(ethers.formatEther(bal));
      setTokenName(name);
      setTokenSymbol(symbol);
      setTotalSupply(ethers.formatEther(supply));
    } catch (err) {
      handleTransactionError(err);
    }
  }

  function handleTransactionError(err) {
    if (
      err?.code === 4001 ||
      (err?.reason && err.reason.toLowerCase().includes("user rejected")) ||
      (err?.message && err.message.toLowerCase().includes("user rejected"))
    ) {
      setMessage({ type: "error", text: "User rejected transaction" });
    } else if (
      err?.message?.toLowerCase().includes("insufficient") ||
      err?.message?.toLowerCase().includes("exceeds balance")
    ) {
      setMessage({ type: "error", text: "Not enough GC for transaction" });
    } else {
      setMessage({ type: "error", text: "Transaction failed" });
    }
  }

  async function updateBalance() {
    if (!contract || !signer) return;
    try {
      const bal = await contract.balanceOf(await signer.getAddress());
      const sup = await contract.totalSupply();
      setBalance(ethers.formatEther(bal));
      setTotalSupply(ethers.formatEther(sup));
    } catch (err) {
      handleTransactionError(err);
    }
  }

  useEffect(() => {
    let interval;
    if (contract && signer) interval = setInterval(updateBalance, 15000);
    return () => clearInterval(interval);
  }, [contract, signer]);

  async function rewardPlayer() {
    setMessage({ type: "", text: "" });

    if (!rewardAddress || !/^0x[a-fA-F0-9]{40}$/.test(rewardAddress)) {
      setMessage({ type: "error", text: "Invalid player wallet address" });
      return;
    }

    if (!rewardAmount || isNaN(rewardAmount) || Number(rewardAmount) <= 0) {
      setMessage({ type: "error", text: "Amount must be greater than zero" });
      return;
    }

    try {
      setStatus("Sending reward...");
      const tx = await contract.rewardPlayer(rewardAddress, ethers.parseEther(rewardAmount));
      await tx.wait();
      setMessage({ type: "success", text: "Reward sent!" });
      updateBalance();
      setRewardAddress("");
      setRewardAmount("");
    } catch (err) {
      handleTransactionError(err);
    } finally {
      setStatus("");
    }
  }

  async function transferTokens() {
    setMessage({ type: "", text: "" });

    if (!transferTo || !/^0x[a-fA-F0-9]{40}$/.test(transferTo)) {
      setMessage({ type: "error", text: "Invalid recipient address" });
      return;
    }

    if (!transferAmount || isNaN(transferAmount) || Number(transferAmount) <= 0) {
      setMessage({ type: "error", text: "Amount must be greater than zero" });
      return;
    }

    try {
      setStatus("Transferring...");
      const tx = await contract.transfer(transferTo, ethers.parseEther(transferAmount));
      await tx.wait();
      setMessage({ type: "success", text: "Transfer successful!" });
      updateBalance();
      setTransferTo("");
      setTransferAmount("");
    } catch (err) {
      handleTransactionError(err);
    } finally {
      setStatus("");
    }
  }

  async function burnTokens() {
    setMessage({ type: "", text: "" });

    if (!burnAmount || isNaN(burnAmount) || Number(burnAmount) <= 0) {
      setMessage({ type: "error", text: "Amount must be greater than zero" });
      return;
    }

    try {
      setStatus("Burning...");
      const tx = await contract.burn(ethers.parseEther(burnAmount));
      await tx.wait();
      setMessage({ type: "success", text: "Burn successful!" });
      updateBalance();
      setBurnAmount("");
    } catch (err) {
      handleTransactionError(err);
    } finally {
      setStatus("");
    }
  }


  if (loading) return <p>Loading user data...</p>;

  return (
    <div className="container">
      <div className="header">
        <h1>GamesCoin Dashboard</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate("/profile")} style={styles.navButton}>Profile</button>
          <button onClick={connectWallet} style={styles.navButton}>Connect Wallet</button>
          <button onClick={logout} style={{ ...styles.navButton, backgroundColor: "#e53e3e" }}>Logout</button>
        </div>
      </div>

      <div className="token-info">
        <p><b>User:</b> {user?.name}</p>
        <p><b>Connected Address:</b> {address || "Not connected"}</p>
        <p><b>GC Balance:</b> {balance}</p>
        <p><b>Token Name:</b> {tokenName}</p>
        <p><b>Symbol:</b> {tokenSymbol}</p>
        <p><b>Total Supply:</b> {totalSupply}</p>
      </div>

      {user?.roles?.includes("admin") && (
        <div className="section">
          <h2>Reward Player (Admin Only)</h2>
          <input placeholder="Player address" value={rewardAddress} onChange={e => setRewardAddress(e.target.value)} />
          <input placeholder="Amount" value={rewardAmount} onChange={e => setRewardAmount(e.target.value)} />
          <button onClick={rewardPlayer}>Reward</button>
        </div>
      )}

      <div className="section">
        <h2>Transfer GC</h2>
        <input placeholder="Recipient address" value={transferTo} onChange={e => setTransferTo(e.target.value)} />
        <input placeholder="Amount" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
        <button onClick={transferTokens}>Transfer</button>
      </div>

      <div className="section">
        <h2>Burn GC</h2>
        <input placeholder="Amount" value={burnAmount} onChange={e => setBurnAmount(e.target.value)} />
        <button onClick={burnTokens}>Burn</button>
      </div>

      {message.text && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "10px 20px",
            borderRadius: "5px",
            color: "#fff",
            backgroundColor: message.type === "success" ? "#4caf50" : "#e53e3e",
            zIndex: 1000,
          }}
        >
          {message.text}
        </div>
      )}

      {status && <p style={{ marginTop: 10 }}>{status}</p>}
    </div>
  );
}

const styles = {
  navButton: {
    padding: "8px 12px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    marginLeft: "10px"
  },
};

export default Dashboard;
