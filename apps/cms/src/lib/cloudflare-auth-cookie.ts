export function securePayloadAuthCookie(response: Response) {
  const cookies = response.headers.getSetCookie();
  const needsSecure = (cookie: string) => /^payload-token=/i.test(cookie) && !/;\s*secure(?:;|$)/i.test(cookie);
  if (!cookies.some(needsSecure)) return response;
  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  for (const cookie of cookies) {
    headers.append("set-cookie", needsSecure(cookie) ? `${cookie}; Secure` : cookie);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}


