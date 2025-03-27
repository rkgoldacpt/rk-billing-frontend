import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const formattedDateTime = now.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setDateTime(formattedDateTime);
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup the interval on unmount
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Optionally, you can redirect the user after successful login
      // console.log("Login successful!");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div>
      <div
        style={{
          position: "relative",
          textAlign: "center",
          fontWeight: "bold",
          padding: 20,
          fontFamily: "Arial, sans-serif",
          background: "#f9f9f9",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 20px)",
            zIndex: 0,
          }}
        >
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "#8B4513" }}>RK JEWELLERS</h2>
          <div style={{ textAlign: "right", fontWeight: "bold", color: "#333" }}>
            Date & Time: {dateTime}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 8, margin: 5, width: "200px" }}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 8, margin: 5, width: "200px" }}
          />
          <br />
          <button
            type="submit"
            style={{ padding: 10, backgroundColor: "#8B4513", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;