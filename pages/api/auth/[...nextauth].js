import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Giả lập hàm gọi API refresh token (Bước 3)
async function refreshAccessToken(token) {
  try {
    console.log("🔄 Token hết hạn, đang refresh...");
    
    // Giả lập độ trễ mạng khi gọi API backend
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Trong thực tế, bạn sẽ gọi API backend tại đây:
    // const response = await fetch('YOUR_API/refresh-token', { ... })

    return {
      ...token,
      // Tạo accessToken mới
      accessToken: `access_token_${Date.now()}_refreshed`,
      // Set lại thời gian sống mới (60 giây)
      accessTokenExpires: Date.now() + 60 * 1000, 
      // Giữ nguyên refreshToken (hoặc thay mới nếu backend trả về refreshToken mới)
      refreshToken: token.refreshToken, 
    };
  } catch (error) {
    console.error("❌ Lỗi khi refresh token:", error);
    return {
      ...token,
      error: "RefreshTokenExpired",
    };
  }
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Bước 1: Xác thực giả lập và trả về 2 tokens & role
        
        // 1. Tài khoản Student
        if (credentials.username === "student" && credentials.password === "123456") {
          return {
            id: "1",
            username: "student",
            role: "ROLE_STUDENT",
            accessToken: `access_token_${Date.now()}`,
            refreshToken: `refresh_token_${Date.now()}`,
          };
        }
        
        // 2. Tài khoản Advisor
        if (credentials.username === "advisor" && credentials.password === "123456") {
          return {
            id: "2",
            username: "advisor",
            role: "ROLE_ADVISOR",
            accessToken: `access_token_${Date.now()}`,
            refreshToken: `refresh_token_${Date.now()}`,
          };
        }

        // Đăng nhập thất bại
        return null;
      }
    })
  ],
  callbacks: {
    // Xử lý JWT Token
    async jwt({ token, user }) {
      // 1. Lần đăng nhập đầu tiên (biến user sẽ có dữ liệu từ hàm authorize)
      if (user) {
        return {
          ...token,
          username: user.username,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 60 * 1000, // Hết hạn sau 60s
        };
      }

      // 2. Các lần request sau: Kiểm tra xem token còn hạn không
      // Trừ đi khoảng 2 giây để tránh lỗi trễ mạng (network latency)
      if (Date.now() < token.accessTokenExpires - 2000) {
        return token; // Token hợp lệ, tiếp tục sử dụng
      }

      // 3. Access Token đã hết hạn -> Tiến hành refresh ngầm
      return await refreshAccessToken(token);
    },

    // Truyền dữ liệu từ token sang session để Frontend (index.js) có thể sử dụng
    async session({ session, token }) {
      if (token) {
        session.user.username = token.username;
        session.user.role = token.role; // Phục vụ phân quyền (Bước 2)
        session.accessToken = token.accessToken; // Phục vụ lấy danh sách lớp
        session.accessTokenExpires = token.accessTokenExpires; // Phục vụ đếm ngược
        session.error = token.error; // Bắt lỗi để logout
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Chỉ định NextAuth dùng trang login custom của bạn
  },
  session: {
    strategy: "jwt",
  },
  // Bắt buộc phải có secret key cho NextAuth
  secret: process.env.NEXTAUTH_SECRET || "do_an_web_secret_key_12345", 
  // Hiển thị log chi tiết trong terminal khi chạy Dev
  debug: true, 
});