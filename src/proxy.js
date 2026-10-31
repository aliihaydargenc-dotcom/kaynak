import { NextResponse } from "next/server";

function equalConstantTime(left, right) {
  const a = String(left);
  const b = String(right);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function proxy(request) {
  const expectedUser = process.env.KAYNAKLAR_ADMIN_USER;
  const expectedPassword = process.env.KAYNAKLAR_ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return new Response("Site yönetici yapılandırması bekleniyor.", { status: 503 });
  }
  const header = request.headers.get("authorization") || "";
  let supplied = "";
  if (header.startsWith("Basic ")) {
    try { supplied = atob(header.slice(6)); } catch { /* invalid base64 */ }
  }
  if (equalConstantTime(supplied, `${expectedUser}:${expectedPassword}`)) {
    return NextResponse.next();
  }
  return new Response("Yönetici girişi gerekli.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Kaynaklar", charset="UTF-8"', "Cache-Control": "no-store" }
  });
}

export const config = { matcher: ["/", "/web/:path*", "/data/:path*", "/research/:path*"] };
