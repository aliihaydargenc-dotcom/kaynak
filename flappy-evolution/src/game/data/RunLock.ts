// One active run or purchase per origin where Web Locks is available.
// localStorage itself is not a transactional multi-tab database.
let release: (() => void) | undefined;
let token = 0;
export function currentRunLock(): number {
  return token;
}
export async function acquireRunLock(): Promise<boolean> {
  if (!("locks" in navigator)) {
    token++;
    return true;
  }
  return new Promise<boolean>((resolve) => {
    void navigator.locks
      .request(
        "flappy-evolution-session",
        { ifAvailable: true },
        async (lock) => {
          if (!lock) {
            resolve(false);
            return;
          }
          token++;
          const held = new Promise<void>((done) => {
            release = done;
          });
          resolve(true);
          await held;
        },
      )
      .catch(() => resolve(false));
  });
}
export function releaseRunLock(expected = token): void {
  if (expected !== token) return;
  release?.();
  release = undefined;
}
