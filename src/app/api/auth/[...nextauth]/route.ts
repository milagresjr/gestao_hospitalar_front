import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { cookies } from "next/headers";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`http://127.0.0.1:8000/api/login`, {
            login: credentials?.login,
            senha: credentials?.password,
            device_name: 'Windows 01'
          }, { withCredentials: true });

          const user = response.data.utilizador;
          const token = response.data.token;

          if (user && token) {
            return { ...user, token };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/signin',  // Rota da sua página de login personalizada
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: "next-auth-session-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "development",
        sameSite: "lax",
        path: "/"
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// export default NextAuth(authOptions);
