import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api"

export const authOptions: NextAuthOptions = {
  // Use JWT strategy — no database needed on the Next.js side
  session: { strategy: "jwt" },

  // Custom login page
  pages: { signIn: "/admin/login" },

  providers: [
    CredentialsProvider({
      name: "KOSRES Admin",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()
          // data = { access_token: "...", user: { id, name, email, role } }
          if (!data.access_token) return null

          return {
            id:           data.user.id,
            name:         data.user.name,
            email:        data.user.email,
            role:         data.user.role,
            accessToken:  data.access_token,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    // Persist extra fields (role, accessToken) into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id          = user.id
        token.role        = (user as any).role
        token.accessToken = (user as any).accessToken
      }
      return token
    },

    // Expose them on the session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id          = token.id
        ;(session.user as any).role       = token.role
        ;(session.user as any).accessToken = token.accessToken
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET ?? "kosres_nextauth_secret_change_in_production",
}
