export function assertDekoCleanAdminRole(role: "admin" | "participant" | undefined): void {
  if (role !== "admin") {
    const error = new Error("DekoClean is restricted to administrators.");
    Object.assign(error, { status: role ? 403 : 401 });
    throw error;
  }
}
