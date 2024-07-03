import NextAuth, { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<User | null> {
        try {
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);
          const response = await fetch(`${nextAuthUrl.origin}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });
          return {
            ...response.json(),
          };
        } catch (e) {
          console.error("SIWE Verification Error:", e);
          return null;
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  useSecureCookies: true,
  cookies: {
    sessionToken: {
      name: "Authentication",
      options: {
        httpOnly: true,
        secure: true,
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
