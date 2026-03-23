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

/**
 * Creates a catch handler that shows an error toast (unless the error is an auth redirect).
 * Usage: fetch(url).then(authCheck).then(...).catch(toastError("Failed to load data"))
 */
export function toastError(
  toast: { error: (msg: string) => void },
  fallbackMessage = "Something went wrong"
) {
  return (err: unknown) => {
    if (err instanceof Error && err.message === "UNAUTHORIZED") return;
    toast.error(fallbackMessage);
  };
}
