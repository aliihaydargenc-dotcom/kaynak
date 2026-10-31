"""Check public source URLs; do not treat HTTP access as proof of live product data."""
import argparse
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]


def probe(url):
    headers = {"User-Agent": "Kaynak-Research-Link-Check/1.0"}
    for method in ("HEAD", "GET"):
        try:
            with urlopen(Request(url, headers=headers, method=method), timeout=12) as response:
                code = response.status
                return {"url": url, "status": "reachable", "http_status": code}
        except HTTPError as exc:
            if method == "HEAD" and exc.code in (405, 501):
                continue
            if exc.code in (401, 403, 429):
                state = "access_restricted_or_rate_limited"
            elif exc.code in (404, 410):
                # Private GitHub repositories return 404 to anonymous visitors.
                state = ("not_publicly_accessible_or_missing" if urlparse(url).hostname == "github.com"
                         else "missing")
            else:
                state = "http_error"
            return {"url": url, "status": state, "http_status": exc.code}
        except (URLError, TimeoutError, OSError) as exc:
            return {"url": url, "status": "network_error", "error_type": type(exc).__name__}
    return {"url": url, "status": "unknown"}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, help="Optional JSON report path")
    args = parser.parse_args()
    sources = json.loads((ROOT / "data/sources.json").read_text(encoding="utf-8"))
    evidence = json.loads((ROOT / "data/rea-evidence.json").read_text(encoding="utf-8"))
    links = sorted({link for source in sources for link in source["links"]})
    with ThreadPoolExecutor(max_workers=5) as pool:
        results = sorted(pool.map(probe, links), key=lambda item: item["url"])
    counts = {status: sum(1 for item in results if item["status"] == status)
              for status in sorted({item["status"] for item in results})}
    report = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "scope": "public_documentation_urls_only",
        "sources": len(sources),
        "links": len(links),
        "status_counts": counts,
        "latest_rea_observation_utc": max(record["observed_to_utc"] for record in evidence["captures"]),
        "live_price_queries": "not_performed",
        "limitations": "Reachability is not API authorization, data freshness, or price availability. Private GitHub repositories may return 404 to anonymous requests; 403/429 may reflect access policy. No production-query failure rate was measured.",
        "results": results,
    }
    contents = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(contents + "\n", encoding="utf-8")
    print(contents)


if __name__ == "__main__":
    main()
