import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "~/database/schema";

export default function createAuth(db: DrizzleD1Database<typeof schema>) {
  return betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
    },
    callbacks: {
        authorized({ auth, request }: { auth: any; request: any }) {
            return !!auth.session;
        },
    },
    pages: {
        signIn: "/signin",
    },
  });
}
