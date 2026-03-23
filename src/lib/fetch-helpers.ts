/**
 * Client-side fetch helper that redirects to /signin on 401 responses.
 * Use in .then() chains: fetch(url).then(authCheck).then(r => r.json())
 */
export function authCheck(res: Response): Response {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error("UNAUTHORIZED");
  }
  return res;
}
