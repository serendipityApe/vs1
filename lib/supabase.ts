import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_BASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing SUPABASE_BASE_URL or SUPABASE_KEY in environment");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    // server-side usage
  },
});

type SessionLike = {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  isRefreshed?: boolean;
};

/**
 * Set HttpOnly session cookies on a NextResponse so the browser will persist server-side session
 */
export function setSessionCookies(res: NextResponse, session: SessionLike) {
  const ACCESS_COOKIE = "sb-access-token";
  const REFRESH_COOKIE = "sb-refresh-token";

  const access = session.access_token ?? "";
  const refresh = session.refresh_token ?? "";

  // access token expiry
  let maxAgeAccess: number | undefined = undefined;

  if (session.expires_at) {
    const expiresMs = session.expires_at * 1000 - Date.now();

    maxAgeAccess = Math.max(Math.floor(expiresMs / 1000), 0);
  }

  res.cookies.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    ...(maxAgeAccess !== undefined ? { maxAge: maxAgeAccess } : {}),
  });

  res.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

/**
 * Try to extract an access token from the request and return the authenticated user and session.
 * If the access token is missing/invalid but a refresh token is present, try to exchange it for a new session.
 */
export async function getUserFromRequest(req: Request): Promise<{
  user: any | null;
  session?: SessionLike | null;
}> {
  try {
    let token: string | null = null;

    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // fallback: cookie named 'sb-access-token'
    if (!token) {
      const cookie = req.headers.get("cookie");

      if (cookie) {
        const match = cookie.match(/sb-access-token=([^;]+)/);

        if (match) token = decodeURIComponent(match[1]);
      }
    }

    // try with access token first
    if (token) {
      // @ts-ignore
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data?.user) {
        return { user: data.user, session: { access_token: token } };
      }
    }

    // try refresh token flow
    const cookie = req.headers.get("cookie");

    if (cookie) {
      const match = cookie.match(/sb-refresh-token=([^;]+)/);

      if (match) {
        const refreshToken = decodeURIComponent(match[1]);

        try {
          const url = `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`;

          const resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
            body: `refresh_token=${encodeURIComponent(refreshToken)}`,
          });

          if (resp.ok) {
            const data = await resp.json();

            const newAccess = data.access_token;
            const newRefresh = data.refresh_token;
            const expiresAt = data.expires_at ?? null;

            if (newAccess) {
              // @ts-ignore
              const { data: userData, error: userErr } =
                await supabase.auth.getUser(newAccess);

              if (!userErr && userData?.user) {
                return {
                  user: userData.user,
                  session: {
                    access_token: newAccess,
                    refresh_token: newRefresh,
                    expires_at: expiresAt,
                    isRefreshed: true,
                  },
                };
              }
            }
          }
        } catch {
          // ignore
        }
      }
    }

    return { user: null, session: null };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getUserFromRequest error", err);

    return { user: null, session: null };
  }
}

/**
 * Given an array of storage paths (e.g. 'projects/xxx.png'), return a map from path to signed URL or null.
 */
export async function createSignedUrls(
  paths: string[],
  expiresIn = 60 * 60 * 24 * 7, // 7 days
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};

  if (!Array.isArray(paths) || paths.length === 0) return result;

  const bucket = "project_show";

  await Promise.all(
    paths.map(async (p) => {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(p, expiresIn);

        if (!error && data?.signedUrl) {
          result[p] = data.signedUrl;
        } else {
          result[p] = null;
        }
      } catch (e) {
        result[p] = null;
      }
    }),
  );

  return result;
}
