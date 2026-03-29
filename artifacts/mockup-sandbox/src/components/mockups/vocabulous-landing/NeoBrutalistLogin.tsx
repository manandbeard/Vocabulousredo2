import { useState } from "react";

export function NeoBrutalistLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "16px",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    border: "3px solid #000000",
    borderRadius: "0px",
    outline: "none",
    backgroundColor: "#ffffff",
    boxShadow: "4px 4px 0px #000000",
    boxSizing: "border-box",
    color: "#000000",
    letterSpacing: "-0.01em",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily: "'Space Grotesk', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: "8px",
          backgroundColor: "#FF00AA",
          width: "100%",
        }}
      />

      {/* Header / Brand */}
      <div
        style={{
          padding: "32px 28px 0",
          position: "relative",
        }}
      >
        {/* Yellow accent block behind brand */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "20px",
            width: "64px",
            height: "64px",
            backgroundColor: "#FFE600",
            border: "3px solid #000",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#000000",
              padding: "4px 12px 6px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#FFE600",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Learn. Retain. Master.
            </span>
          </div>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              lineHeight: "0.9",
              color: "#000000",
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            VOCAB
            <br />
            <span style={{ color: "#000" }}>ULOUS</span>
            <sup
              style={{
                fontSize: "28px",
                color: "#FF00AA",
                verticalAlign: "super",
                fontWeight: 800,
              }}
            >
              2
            </sup>
          </div>
        </div>
      </div>

      {/* Divider stripe */}
      <div
        style={{
          margin: "24px 28px",
          height: "5px",
          backgroundColor: "#FFE600",
          border: "2px solid #000",
          boxShadow: "3px 3px 0 #000",
        }}
      />

      {/* Hero text */}
      <div style={{ padding: "0 28px 28px" }}>
        <p
          style={{
            fontSize: "32px",
            fontWeight: 800,
            lineHeight: "1.05",
            color: "#000000",
            letterSpacing: "-0.03em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          YOUR BRAIN
          <br />
          <span
            style={{
              backgroundColor: "#FFE600",
              padding: "0 6px",
              border: "2px solid #000",
            }}
          >
            NEVER FORGETS
          </span>
          <br />
          AGAIN.
        </p>
      </div>

      {/* Login Form */}
      <div
        style={{
          margin: "0 28px",
          padding: "28px",
          backgroundColor: "#f8f8f8",
          border: "3px solid #000000",
          boxShadow: "6px 6px 0px #000000",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#000",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            borderBottom: "3px solid #000",
            paddingBottom: "12px",
          }}
        >
          Sign In
        </div>

        {/* Email field */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#000",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Password field */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#000",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: "56px" }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                bottom: "0",
                padding: "0 16px",
                backgroundColor: "transparent",
                border: "none",
                borderLeft: "3px solid #000",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 800,
                fontFamily: "'Space Grotesk', sans-serif",
                color: "#000",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div style={{ textAlign: "right", marginTop: "-8px" }}>
          <a
            href="#"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#FF00AA",
              textDecoration: "none",
              letterSpacing: "0.04em",
              borderBottom: "2px solid #FF00AA",
            }}
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In button */}
        <button
          style={{
            width: "100%",
            padding: "18px",
            backgroundColor: "#FFE600",
            border: "3px solid #000000",
            boxShadow: "5px 5px 0px #000000",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            color: "#000000",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            transition: "transform 0.1s, box-shadow 0.1s",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(3px, 3px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0px #000000";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "5px 5px 0px #000000";
          }}
        >
          Sign In →
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1, height: "2px", backgroundColor: "#000" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#666", letterSpacing: "0.1em" }}>
            OR
          </span>
          <div style={{ flex: 1, height: "2px", backgroundColor: "#000" }} />
        </div>

        {/* Sign up CTA */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#000",
              letterSpacing: "-0.01em",
            }}
          >
            New student?{" "}
          </span>
          <a
            href="#"
            style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "#FF00AA",
              textDecoration: "none",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              borderBottom: "2px solid #FF00AA",
            }}
          >
            Create Account
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          margin: "20px 28px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#999",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          © 2026 Vocabulous²
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#FFE600",
              border: "2px solid #000",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#FF00AA",
              border: "2px solid #000",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#000",
              border: "2px solid #000",
            }}
          />
        </div>
      </div>
    </div>
  );
}
