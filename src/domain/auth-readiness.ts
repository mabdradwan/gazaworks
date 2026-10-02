/** Fail closed while the application and database are on incompatible releases. */
export async function authRuntimeReady(configured: boolean, probe: () => Promise<boolean>) {
  if (!configured) return false;
  try {
    return await probe();
  } catch {
    return false;
  }
}
