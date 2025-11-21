import { tokenLogout } from "./tokenLogout";

export async function fetchWithRefresh(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status !== 401) return res;

  console.warn("⛔ Access token expired → refreshing token...");

  const refresh = await fetch("http://localhost:5000/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!refresh.ok) {
    console.error("❌ Refresh failed → logging out");
    tokenLogout();
    return res;
  }

  console.log("🔄 Token refreshed → retrying request...");

  return fetch(url, {
    ...options,
    credentials: "include",
  });
}
