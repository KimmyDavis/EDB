import {
  adminClient,
  inferAdditionalFields,
  jwtClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    jwtClient({
      jwks: {
        jwksPath: "/.well-known/jwks.json", // Must match server configuration
      },
    }),
  ],
});
