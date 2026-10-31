"""Run Kaynak's browser smoke checks at mobile, tablet and desktop widths."""
from __future__ import annotations

import argparse
import functools
import http.server
import json
import pathlib
import threading

from playwright.sync_api import sync_playwright


ROOT = pathlib.Path(__file__).resolve().parents[1]
EDGE = pathlib.Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=pathlib.Path, default=ROOT / "work" / "browser")
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    results = []
    try:
        with sync_playwright() as p:
            browser = (p.chromium.launch(executable_path=str(EDGE), headless=True)
                       if EDGE.is_file() else p.chromium.launch(headless=True))
            for width, height, label in [(360, 780, "mobile"), (768, 900, "tablet"), (1440, 900, "desktop")]:
                page = browser.new_page(viewport={"width": width, "height": height}, locale="tr-TR", reduced_motion="reduce")
                errors = []
                page.on("pageerror", lambda err: errors.append("pageerror: " + str(err)))
                page.on("console", lambda msg: errors.append("console: " + msg.text) if msg.type == "error" else None)
                response = page.goto(f"http://127.0.0.1:{server.server_port}/web/", wait_until="networkidle")
                assert response and response.status == 200, f"{label}: HTML status"
                page.locator(".card").first.wait_for()
                assert page.locator(".card").count() == 8, f"{label}: card count"
                assert page.locator("#source-count").inner_text() == "8"
                assert page.locator("#event-count").inner_text() == "5"
                assert page.locator("#hotel-count").inner_text() == "3"
                hrefs = page.locator(".card-footer a").evaluate_all("nodes => nodes.map(a => ({url:a.href,target:a.target,rel:a.rel}))")
                assert len(hrefs) == 8
                assert all(h["url"].startswith("https://") and h["target"] == "_blank" and "noopener" in h["rel"] for h in hrefs)
                page.locator('[data-category="hotel"]').click()
                assert page.locator(".card").count() == 3, f"{label}: hotel filter"
                page.locator("#source-search").fill("booking")
                assert page.locator(".card").count() == 1, f"{label}: search"
                page.locator("#source-search").fill("olmayan-kaynak-xyz")
                assert page.locator(".card").count() == 0 and page.locator("#empty").is_visible(), f"{label}: empty state"
                page.locator("#source-search").fill("")
                page.locator('[data-category="event"]').click()
                assert page.locator(".card").count() == 4, f"{label}: event filter"
                page.locator('[data-category="internal"]').click()
                assert page.locator(".card").count() == 1, f"{label}: internal filter"
                page.locator('[data-category="all"]').click()
                assert page.locator(".card").count() == 8, f"{label}: reset filter"
                assert not page.locator("#empty").is_visible()
                dimensions = page.evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})")
                assert dimensions["scrollWidth"] <= dimensions["width"], f"{label}: horizontal overflow {dimensions}"
                if label in {"mobile", "desktop"}:
                    page.screenshot(path=str(args.output_dir / f"kaynak-{label}.png"), full_page=True)
                with page.expect_popup() as popup_wait:
                    page.locator(".card-footer a").first.click()
                popup = popup_wait.value
                popup.wait_for_url("https://**", timeout=12000)
                assert popup.url.startswith("https://docs.pretix.eu/"), f"{label}: popup {popup.url}"
                popup.close()
                assert errors == [], f"{label}: JavaScript console errors: {errors}"
                results.append({"viewport": label, "size": [width, height], "cards": 8, "search": "pass", "filters": "pass", "external_link_popup": "pass", "overflow": False, "console_errors": errors})
                page.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
