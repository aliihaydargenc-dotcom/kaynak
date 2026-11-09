const root = document.querySelector<HTMLDivElement>("#ui")!;
let lastFocus: HTMLElement | null = null;
export function panel(
  html: string,
  onAction: (action: string) => void,
  modal = false,
): void {
  if (!modal)
    lastFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  root.className = modal ? "modal" : "panel";
  root.innerHTML = `<section ${modal ? 'role="dialog" aria-modal="true"' : ""} aria-label="Flappy Evolution">${html}</section>`;
  document.querySelector<HTMLElement>("#app")!.inert = true;
  root.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-action]",
    );
    if (b && !b.disabled) onAction(b.dataset.action!);
  };
  root.onkeydown = (e) => {
    if (e.key === "Tab") {
      const buttons = Array.from(
        root.querySelectorAll<HTMLElement>(
          "button:not(:disabled),select,input",
        ),
      );
      const first = buttons[0],
        last = buttons.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };
  root
    .querySelector<HTMLElement>("button:not(:disabled)")
    ?.focus({ preventScroll: true });
}
export function clearPanel(): void {
  root.innerHTML = "";
  root.className = "";
  root.onclick = null;
  root.onkeydown = null;
  document.querySelector<HTMLElement>("#app")!.inert = false;
  lastFocus?.focus({ preventScroll: true });
}
export function button(
  action: string,
  label: string,
  primary = false,
  disabled = false,
): string {
  return `<button data-action="${action}" class="${primary ? "primary" : ""}" ${disabled ? "disabled" : ""}>${label}</button>`;
}
export function hud(html: string, onAction: (action: string) => void): void {
  root.className = "hud";
  root.innerHTML = html;
  root.onclick = (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-action]",
    );
    if (b) onAction(b.dataset.action!);
  };
  document.querySelector<HTMLElement>("#app")!.inert = false;
}
