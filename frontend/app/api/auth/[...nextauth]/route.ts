import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Mock user store
const users = [
  {
    id: "1",
    name: "Alice Admin",
    email: "alice@enterprise.com",
    password: "$2a$10$7Qw8Qw8Qw8Qw8Qw8Qw8QwOQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Q", // 'password123' hashed
    role: "admin",
  },
  {
    id: "2",
    name: "Bob Operator",
    email: "bob@enterprise.com",
    password: "$2a$10$7Qw8Qw8Qw8Qw8Qw8Qw8QwOQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Q", // 'password123' hashed
    role: "operator",
  },
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = users.find(u => u.email === credentials?.email);
        if (user && credentials?.password && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = (token as any).role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 