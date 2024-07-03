import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
    error: "/error",
    signOut: "/auth/logout",
    newUser: "/auth/register",
  },
});
