import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, jwt, username } from "better-auth/plugins";
import { customAlphabet } from "nanoid";
import { sendEmail } from "./sendEmail";
const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const client = new MongoClient(process.env.MONGODB_URL!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // so that trasactions may work
    client,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `Click the link to verify your email: ${url}`,
      });
    },
    sendOnSignUp: true,
  },
  plugins: [
    username(),
    admin(),
    jwt({ jwks: { jwksPath: "/secure/jwks.json" } }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
        unique: true,
      },
      gender: {
        type: ["m", "f"],
        required: false,
        input: true,
      },
      matricule: {
        type: "string",
        required: false,
        input: true,
        unique: true,
      },
      passport: {
        type: "string",
        required: false,
        input: true,
        unique: true,
      },
      algerianId: {
        type: "string",
        required: false,
        input: true,
        unique: true,
      },
      country: {
        type: "string",
        required: false,
        input: true,
        index: true,
      },
      birthdate: {
        type: "string",
        required: false,
        input: true,
      },
      course: {
        type: "string",
        required: false,
        input: true,
      },
      userCode: {
        type: "string",
        required: false,
        defaultValue: randomCode(),
        input: false,
      },
      left: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      deleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      language: {
        type: "string",
        required: false,
        defaultValue: "english",
        input: true,
      },
    },
  },
});
