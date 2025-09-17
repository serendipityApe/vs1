import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = body?.session ?? null;

    const res = NextResponse.json({ ok: true });

    if (!session) {
      // clear cookies
      res.cookies.set(ACCESS_COOKIE, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });
      res.cookies.set(REFRESH_COOKIE, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });

      return res;
    }

    const access = session.access_token || null;
    const refresh = session.refresh_token || null;
    const expires_at = session.expires_at ? Number(session.expires_at) : null;

    // set cookies; use expires if available
    const now = Date.now();

    let accessMaxAge = undefined;

    if (expires_at) {
      const expiresMs = expires_at * 1000 - now;

      // ensure non-negative
      accessMaxAge = Math.max(Math.floor(expiresMs / 1000), 0);
    }

    res.cookies.set(ACCESS_COOKIE, access ?? "", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      ...(accessMaxAge !== undefined ? { maxAge: accessMaxAge } : {}),
    });

    // refresh token: set a longer expiry (30 days) unless expires_at provided
    res.cookies.set(REFRESH_COOKIE, refresh ?? "", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });

  return res;
}
