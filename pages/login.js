import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result.error) {
      setError("Sai tên đăng nhập hoặc mật khẩu");
    } else {
      router.push("/");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
      <h1>🔐 Đăng Nhập</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px", cursor: "pointer" }}>
          Đăng Nhập
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <hr />
      <p>
        <strong>Demo Credentials:</strong>
      </p>
      <p>
        Student: <code>student / 123456</code> (ROLE_STUDENT)
      </p>
      <p>
        Advisor: <code>advisor / 123456</code> (ROLE_ADVISOR)
      </p>
    </div>
  );
}
