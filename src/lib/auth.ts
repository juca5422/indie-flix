import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { ROLES } from "@/lib/roles";

const trustedOrigins =
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new Error("Defina GOOGLE_CLIENT_ID no ambiente.");
    }    

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg" }),
  trustedOrigins,
  emailAndPassword: { enabled: true },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  
  user: {
    additionalFields: {
      role: {
        type: [ROLES.USER, ROLES.FILMMAKER, ROLES.ADMIN],
        required: true,
        defaultValue: ROLES.USER,
        input: false,
      },
    },
  },

  plugins: [nextCookies()],
});
