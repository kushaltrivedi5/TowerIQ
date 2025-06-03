import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { promises as fs } from 'fs';
import path from 'path';
import { Enterprise, UserRole } from "@/lib/data/domain-types";

// Use salt rounds from env or fallback to 10
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// Helper functions
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, saltRounds);
};

const comparePasswords = async (plainPassword: string, hash: string) => {
  return await bcrypt.compare(plainPassword, hash);
};

// Pre-hash password123 for all enterprise users
const samplePasswordHash = await hashPassword("password123");

// Define the enterprise user type
interface EnterpriseUser {
  id: string;
  email: string;
  role: UserRole;
  department: string;
  devices: string[];
  enterpriseId: string;
  enterpriseName: string;
}

// Load enterprise users from seed data
async function loadEnterpriseUsers(): Promise<EnterpriseUser[]> {
  try {
    console.log('Loading enterprise users...');
    const enterprisesDir = path.join(process.cwd(), 'lib/data/seed-data/enterprises');
    console.log('Enterprises directory:', enterprisesDir);
    
    const enterpriseDirs = await fs.readdir(enterprisesDir);
    console.log('Found enterprise directories:', enterpriseDirs);
    
    const users: EnterpriseUser[] = [];
    
    for (const dir of enterpriseDirs) {
      const enterprisePath = path.join(enterprisesDir, dir, 'enterprise.json');
      console.log('Reading enterprise file:', enterprisePath);
      
      try {
        const data = await fs.readFile(enterprisePath, 'utf-8');
        const enterprise = JSON.parse(data) as Enterprise;
        console.log(`Found enterprise: ${enterprise.name} (${enterprise.id})`);
        console.log(`Number of users in enterprise: ${enterprise.users.length}`);
        
        // Add enterprise info to each user
        const enterpriseUsers = enterprise.users.map(user => ({
          ...user,
          enterpriseId: enterprise.id,
          enterpriseName: enterprise.name
        }));
        
        users.push(...enterpriseUsers);
      } catch (error) {
        console.error(`Error reading enterprise ${dir}:`, error);
      }
    }
    
    const adminUsers = users.filter(user => user.role === 'admin');
    console.log('Total users found:', users.length);
    console.log('Admin users found:', adminUsers.length);
    console.log('Admin user emails:', adminUsers.map(u => u.email));
    
    return adminUsers;
  } catch (error) {
    console.error('Error loading enterprise users:', error);
    return [];
  }
}

// Pre-hashed password for all enterprise users (password123)
const HASHED_PASSWORD = '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9Uu';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Authorization attempt for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          throw new Error('Please enter your email and password');
        }

        // Load enterprise users
        const users = await loadEnterpriseUsers();
        console.log('Loaded users count:', users.length);
        
        // Find user by email
        const user = users.find(u => u.email === credentials.email);
        console.log('Found user:', user ? 'Yes' : 'No');
        
        if (user) {
          console.log('User details:', {
            id: user.id,
            email: user.email,
            role: user.role,
            enterpriseId: user.enterpriseId
          });
        }
        
        // Verify password (all users use the same password for demo)
        if (user && credentials.password === 'password123') {
          console.log('Password verification successful');
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            enterpriseId: user.enterpriseId,
            enterpriseName: user.enterpriseName,
          };
        }

        console.log('Authentication failed');
        throw new Error('Invalid email or password');
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - adding user data to token:', {
          role: user.role,
          enterpriseId: user.enterpriseId,
          enterpriseName: user.enterpriseName
        });
        token.role = user.role;
        token.enterpriseId = user.enterpriseId;
        token.enterpriseName = user.enterpriseName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('Session callback - adding token data to session:', {
          role: token.role,
          enterpriseId: token.enterpriseId,
          enterpriseName: token.enterpriseName
        });
        session.user.role = token.role;
        session.user.enterpriseId = token.enterpriseId;
        session.user.enterpriseName = token.enterpriseName;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: true, // Enable debug mode
});

export { handler as GET, handler as POST };
