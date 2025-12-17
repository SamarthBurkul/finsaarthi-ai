// src/utils/authFetch.ts
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    // invalid token — clear and reload (or redirect to sign in)
    localStorage.removeItem("authToken");
    window.location.reload();
  }
  return res;
}
