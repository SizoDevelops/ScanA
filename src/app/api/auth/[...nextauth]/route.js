import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        school_code: { label: "Company Code", type: "text" },
        code: {label: "Your Code", type: 'text'},
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          let res = await fetch(process.env.NEXTAUTH_URL + "/api/login-user", {
            method: "POST",
            cache: 'no-cache',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              school_code: credentials?.school_code,
              code: credentials?.code,
              password: credentials?.password,
            })
          });
      
          if (!res.ok) {
            // Handle non-successful HTTP responses (e.g., 4xx or 5xx errors)
            throw new Error(`Error! Status: ${res.status}`);
          }
      
          let user = await res.json();
          if (user) {
            return user;
          } else {
           
            return null;
          }
        } catch (error) {
          throw new Error("Authentication failed");
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },

    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },

});

export { handler as GET, handler as POST };