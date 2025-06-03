import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      enterpriseId?: string;
      enterpriseName?: string;
    };
  }
  interface User extends DefaultUser {
    role?: string;
    enterpriseId?: string;
    enterpriseName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    enterpriseId?: string;
    enterpriseName?: string;
  }
} 