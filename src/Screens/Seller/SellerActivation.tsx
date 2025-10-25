import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface ActivationResponse {
  success: boolean;
  message: string;
}

const SellerActivation: React.FC = () => {
  const { activation_token } = useParams<{ activation_token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your seller account...");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return; // ✅ prevents React strict mode double calls
    calledRef.current = true;

    const activateSeller = async () => {
      if (!activation_token) {
        toast.error("Invalid activation link!");
        setStatus("error");
        setMessage("Invalid activation link!");
        return;
      }

      try {
        const res = await fetch("/api/v2/shop/activation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activation_token }),
        });

        const data: ActivationResponse = await res.json();

        if (res.ok && data.success) {
          toast.success(data.message || "Seller verified successfully!");
          setStatus("success");
          setMessage("✅ Your seller account has been verified successfully!");
          setTimeout(() => navigate("/login"), 5000); // ⏳ Auto redirect in 5s
        } else {
          toast.error(data.message || "Activation failed. Please try again.");
          setStatus("error");
          setMessage(data.message || "Activation failed. Please try again.");
        }
      } catch (error) {
        console.error("Activation error:", error);
        toast.error("Activation link expired or invalid!");
        setStatus("error");
        setMessage("⚠️ Activation link expired or invalid!");
      }
    };

    activateSeller();
  }, [activation_token, navigate]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#333",
      }}
    >
      <h2 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "10px" }}>
        {status === "loading"
          ? "Verifying your seller account..."
          : status === "success"
          ? "Seller Verified!"
          : "Verification Failed"}
      </h2>

      <p
        style={{
          fontSize: "16px",
          color: status === "success" ? "#2e7d32" : "#d32f2f",
          marginBottom: "30px",
        }}
      >
        {message}
      </p>

      {status === "success" && (
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "12px 28px",
            fontSize: "16px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#1976d2",
            color: "white",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.backgroundColor = "#1258a8")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.backgroundColor = "#1976d2")
          }
        >
          Go to Login (Redirecting in 5s...)
        </button>
      )}

      {status === "error" && (
        <button
          onClick={() => navigate("/signup-seller")}
          style={{
            padding: "12px 28px",
            fontSize: "16px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#d32f2f",
            color: "white",
            cursor: "pointer",
          }}
        >
          Back to Signup
        </button>
      )}
    </div>
  );
};

export default SellerActivation;
