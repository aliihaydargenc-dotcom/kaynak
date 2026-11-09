let registration: ServiceWorkerRegistration | undefined;
let ready = false;
let applying = false;
let reloaded = false;
export function installPwa(isMenu: () => boolean): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  const render = (): void => {
    const status = document.querySelector("#offline-status");
    if (status)
      status.textContent = ready
        ? "Çevrimdışı hazır"
        : "Çevrimdışı hazırlanıyor…";
    const slot = document.querySelector("#update-slot");
    if (slot) {
      slot.innerHTML = registration?.waiting
        ? '<button id="apply-update" class="primary">Güncelleme hazır · Şimdi yenile</button>'
        : "";
      slot.querySelector("button")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!isMenu() || !registration?.waiting || applying) return;
        applying = true;
        registration.waiting.postMessage("ACTIVATE");
      });
    }
  };
  const checkReady = async (): Promise<void> => {
    const active = registration?.active;
    if (!active) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => {
      ready = e.data?.ready === true;
      channel.port1.close();
      render();
    };
    active.postMessage("STATUS", [channel.port2]);
  };
  window.addEventListener("flappy-menu", () => {
    render();
    void checkReady();
  });
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    void checkReady();
    if (applying && !reloaded) {
      reloaded = true;
      location.reload();
    }
  });
  void navigator.serviceWorker
    .register("/sw.js", { updateViaCache: "none" })
    .then((r) => {
      registration = r;
      r.addEventListener("updatefound", () => {
        const worker = r.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed") {
            render();
            void checkReady();
          }
        });
      });
      void navigator.serviceWorker.ready.then(() => {
        void checkReady();
      });
      render();
    })
    .catch(() => {
      const status = document.querySelector("#offline-status");
      if (status)
        status.textContent =
          "Çevrimdışı hazırlık tamamlanamadı. Normal oyun kullanılabilir.";
    });
}
