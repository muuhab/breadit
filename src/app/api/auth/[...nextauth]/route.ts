import { authOptions } from "@/lib/auth";
import NextAuth, { getServerSession } from "next-auth/next";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const getAuthSesssion = () => getServerSession(authOptions);
