import { Elysia, status } from "elysia";
import { auth } from "@/src/server/auth";

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  emailVerified: boolean;
  [key: string]: unknown;
};

/**
 * Auth macros:
 *  - `{ auth: true }`  — requires session; injects `user` + `session`.
 *  - `{ optional: true }` — resolves `user`/`session` if present, never blocks.
 *  - `{ admin: true }` — requires role === 'admin'.
 */
export const authPlugin = new Elysia({ name: "auth-plugin" }).macro({
  auth: {
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) return status(401, { error: "Unauthorized" });

      return {
        user: session.user as SessionUser,
        session: session.session,
      };
    },
  },
  optional: {
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      return {
        user: session ? (session.user as SessionUser) : undefined,
        session: session ? session.session : undefined,
      };
    },
  },
  admin: {
    async resolve({ request: { headers } }) {
      const session = await auth.api.getSession({ headers });

      if (!session) return status(401, { error: "Unauthorized" });

      const role = session.user.role as string | undefined;
      if (role !== "admin") return status(403, { error: "Forbidden" });

      return {
        user: session.user as SessionUser,
        session: session.session,
      };
    },
  },
});
