import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Use salt rounds from env or fallback to 10
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// Helper functions inside same file
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};

const comparePasswords = async (plainPassword: string, hash: string) => {
  return await bcrypt.compare(plainPassword, hash);
};

// Pre-hash password123 using dynamic salt rounds
const samplePasswordHash = await hashPassword("password123");

// Mock user store with dynamically hashed password
const users = [
  {
    id: "1",
    name: "Alice Admin",
    email: "alice@enterprise.com",
    password: "$2b$10$teniCJfqGWdX6Z.IcCYosu0w/WnfynR9Nt3A6RYQNGA5WxH1Q4CE2",
    role: "admin",
  },
  {
    id: "2",
    name: "Bob Operator",
    email: "bob@enterprise.com",
    password: "$2b$10$teniCJfqGWdX6Z.IcCYosu0w/WnfynR9Nt3A6RYQNGA5WxH1Q4CE2",
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
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const user = users.find(u => u.email === credentials.email);
        console.log("Found user:", user ? "yes" : "no");

        if (!user) {
          console.log("User not found");
          return null;
        }

        const isValid = await comparePasswords(credentials.password, user.password);
        console.log("Password valid:", isValid);

        if (isValid) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        console.log("Invalid password");
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
