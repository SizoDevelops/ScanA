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
        // Add logic here to look up the user from the credentials supplied
        let res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          cache: 'no-cache',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            school_code: credentials?.school_code,
            code: credentials?.code,
            password: credentials?.password,
          }),
        })

       let user = await res.json()
       if(user){
        return user
       }
       else {
        return null
       }
      },
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