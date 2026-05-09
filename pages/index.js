import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [classList, setClassList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [secondsUntilExpire, setSecondsUntilExpire] = useState(0);

  // Đếm ngược liên tục và tự động logout khi hết hạn
  useEffect(() => {
    if (!session?.accessTokenExpires) return;

    // Xử lý lỗi token hết hạn
    if (session.error === "RefreshTokenExpired") {
      console.log("❌ Refresh token hết hạn, đang đăng xuất...");
      signOut({ redirect: true, callbackUrl: "/login" });
      return;
    }

    // Tính toán lần đầu
    const updateCountdown = () => {
      const secondsLeft = Math.max(0, Math.ceil((session.accessTokenExpires - Date.now()) / 1000));
      setSecondsUntilExpire(secondsLeft);

      // Nếu token hết hạn, tự động logout
      if (secondsLeft === 0) {
        console.log("⏰ Token hết hạn, đang đăng xuất...");
        signOut({ redirect: true, callbackUrl: "/login" });
      }
    };

    updateCountdown();

    // Cập nhật countdown mỗi giây
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [session?.accessTokenExpires, session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (session.user.role !== "ROLE_ADVISOR") {
    return (
      <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
        <h1>❌ Bị Từ Chối Truy Cập</h1>
        <p>Bạn không có quyền truy cập trang này. Chỉ Cố Vấn (ROLE_ADVISOR) mới được phép.</p>
        <p>
          <strong>Role của bạn:</strong> {session.user.role}
        </p>
        <button onClick={() => signOut()}>Đăng Xuất</button>
      </div>
    );
  }

  const handleFetchClassList = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setClassList({
        classes: [
          { id: 1, name: "Lớp A1", students: 30 },
          { id: 2, name: "Lớp A2", students: 28 },
          { id: 3, name: "Lớp A3", students: 32 },
        ],
        accessToken: session.accessToken.substring(0, 20) + "...",
        expiresAt: new Date(session.accessTokenExpires).toLocaleTimeString("vi-VN"),
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });
    } catch (error) {
      setClassList({ error: "Lỗi khi lấy danh sách lớp" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>📊 Dashboard Cố Vấn</h1>

      <div style={{ 
        background: secondsUntilExpire <= 10 ? "#ffebee" : "#f0f0f0", 
        padding: "15px", 
        borderRadius: "5px", 
        marginBottom: "20px",
        border: secondsUntilExpire <= 10 ? "2px solid #f44336" : "none"
      }}>
        <p>
          <strong>👤 Người dùng:</strong> {session.user.username}
        </p>
        <p>
          <strong>🔑 Role:</strong> {session.user.role}
        </p>
        <p>
          <strong>⏱️ Access Token hết hạn sau:</strong>{" "}
          <span style={{ color: secondsUntilExpire <= 10 ? "#f44336" : "#4caf50", fontWeight: "bold", fontSize: "18px" }}>
            {secondsUntilExpire}s
          </span>
        </p>
        {secondsUntilExpire <= 10 && secondsUntilExpire > 0 && (
          <p style={{ color: "#f44336", fontWeight: "bold", margin: "10px 0 0 0" }}>
            ⚠️ Cảnh báo: Token sẽ hết hạn sớm! Bạn sẽ được tự động logout.
          </p>
        )}
        {session.error && (
          <p style={{ color: "#f44336", fontWeight: "bold", margin: "10px 0 0 0" }}>
            ❌ Lỗi: {session.error} - Vui lòng đăng nhập lại
          </p>
        )}
        <p>
          <strong>🎫 Token hiện tại:</strong> {session.accessToken.substring(0, 30)}...
        </p>
      </div>

      <h3>Kiểm Tra Token Refresh</h3>
      <p>
        <strong>Hướng dẫn demo:</strong>
      </p>
      <ol>
        <li>Bấm "Lấy danh sách lớp" (Token còn hạn) ✅</li>
        <li>Đợi 60+ giây hoặc chờ "Access Token hết hạn sau: 0s"</li>
        <li>Bấm lại "Lấy danh sách lớp" (NextAuth sẽ tự động refresh token) 🔄</li>
        <li>Kiểm tra console để xem log "Token hết hạn, đang refresh..."</li>
      </ol>

      <button
        onClick={handleFetchClassList}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          marginBottom: "20px",
        }}
      >
        {loading ? "⏳ Đang tải..." : "📋 Lấy danh sách lớp"}
      </button>

      {classList && (
        <div style={{ background: "#e8f5e9", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
          <h3>📚 Kết Quả:</h3>
          <pre style={{ background: "white", padding: "10px", overflowX: "auto" }}>
            {JSON.stringify(classList, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={() => signOut()}
        style={{
          padding: "10px 20px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Đăng Xuất
      </button>
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {},
  };
}
