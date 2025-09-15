import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Teszt felhasználó (keménykódolt)
        if (
          credentials?.username === "admin" &&
          credentials?.password === "1234"
        ) {
          return { id: "1", name: "Admin User" }
        }
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
