import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Enter any username' },
        password: { label: 'Password', type: 'password' },
        email: { label: 'Recovery Email (Optional)', type: 'email', placeholder: 'Optional, for password recovery' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        let user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        const isSignup = credentials.action === 'signup';

        if (isSignup) {
          if (user) {
            throw new Error('Username is already taken');
          }
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              username: credentials.username,
              name: credentials.username,
              email: credentials.email || null,
              password: hashedPassword,
            },
          });
        } else {
          // Login flow
          if (!user) {
            throw new Error('User not found');
          }
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password!);
          if (!isPasswordValid) {
            throw new Error('Incorrect password');
          }
        }

        return { id: user.id, name: user.name, username: user.username };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
