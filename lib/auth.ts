import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";

import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubId?: number;
      username?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  }

  interface User {
    githubId?: number;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    githubId?: number;
    username?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }): Promise<JWT> {
      // 首次登录时，从 GitHub profile 获取信息并创建/更新用户
      if (account && profile) {
        const githubId = (profile as any).id;
        const username = (profile as any).login;
        const avatarUrl = (profile as any).avatar_url;

        // 在数据库中创建或更新用户
        const user = await prisma.user.upsert({
          where: { githubId },
          create: {
            githubId,
            username,
            avatarUrl,
          },
          update: {
            username,
            avatarUrl,
          },
        });

        token.id = user.id;
        token.githubId = githubId;
        token.username = username;
      }

      return token;
    },
    async session({ session, token }) {
      // 将 JWT 中的信息传递给 session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.githubId = token.githubId;
        session.user.username = token.username;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
};
