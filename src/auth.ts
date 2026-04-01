import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string;
          const password = credentials?.password as string;

          console.log("[auth] Login attempt:", email);

          if (!email || !password) {
            console.log("[auth] Missing email or password");
            return null;
          }

          const result = await db.query(
            `SELECT * FROM users WHERE email = $1`,
            [email.toLowerCase()]
          );

          const user = result.rows[0];

          if (!user) {
            console.log("[auth] User not found:", email);
            return null;
          }

          if (!user.password_hash) {
            console.log("[auth] User has no password (Google account)");
            return null;
          }

          const valid = await bcrypt.compare(password, user.password_hash);
          console.log("[auth] Password valid:", valid);

          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("[auth] Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email && user.name) {
          console.log("[auth] Google sign in:", user.email);

          const existing = await db.query(
            `SELECT * FROM users WHERE email = $1`,
            [user.email.toLowerCase()]
          );

          if (existing.rows.length === 0) {
            await db.query(
              `INSERT INTO users (name, email, provider) VALUES ($1, $2, 'google')`,
              [user.name, user.email.toLowerCase()]
            );
            console.log("[auth] Created Google user:", user.email);
          }
        }
      } catch (error) {
        console.error("[auth] Error in signIn callback:", error);
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      try {
        if (user && account?.provider === "google" && user.email) {
          const result = await db.query(
            `SELECT id FROM users WHERE email = $1`,
            [user.email.toLowerCase()]
          );
          if (result.rows[0]) {
            token.sub = result.rows[0].id;
          }
        } else if (user) {
          token.sub = user.id;
        }
      } catch (error) {
        console.error("[auth] Error in jwt callback:", error);
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});