export function tokenLogout() {
  localStorage.removeItem("user");
  window.location.href = "/";
}
