"""Kaynak kataloğundaki link ve veri bütünlüğünü yerelde denetle."""
import json
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parents[1]


def valid_https_url(link: str) -> bool:
    if not isinstance(link, str) or not link.startswith("https://"):
        return False
    if re.search(r"[\s\[\]()<>|]", link) or link.count("https://") != 1:
        return False
    parsed = urlparse(link)
    return parsed.scheme == "https" and bool(parsed.hostname) and parsed.username is None


def main():
    sources = json.loads((ROOT / "data/sources.json").read_text(encoding="utf-8"))
    assert isinstance(sources, list) and sources, "Katalog boş"
    seen = set()
    for source in sources:
        assert source["id"] not in seen, f"Yinelenen id: {source['id']}"
        seen.add(source["id"])
        assert source["category"] in {"event", "hotel", "internal"}
        assert len(source["summary"]) > 35
        assert source["confidence"]
        assert isinstance(source["links"], list) and source["links"]
        for link in source["links"]:
            assert valid_https_url(link), f"Düz HTTPS URL gerekli: {link}"
    evidence = json.loads((ROOT / "data/rea-evidence.json").read_text(encoding="utf-8"))
    assert evidence["scope"] == "public-web-pages-only"
    assert evidence["raw_captures_in_repository"] is False
    records = evidence["captures"]
    assert len(records) == 2, "İki REA gözlem özeti bekleniyor"
    evidence_ids = set()
    for record in records:
        assert record["source_id"] in seen, "Gözlem katalogda bulunamadı"
        assert re.fullmatch(r"ev_[a-f0-9]{64}", record["evidence_id"])
        assert record["evidence_id"] not in evidence_ids, "Yinelenen kanıt kimliği"
        evidence_ids.add(record["evidence_id"])
        assert re.fullmatch(r"[a-f0-9]{64}", record["raw_capture_sha256"])
        assert record["retained_network_events"] > 0
        assert valid_https_url(record["start_url"])
        assert valid_https_url(record["final_url"])
        assert record["capture_status"] == "complete"
        begin = datetime.fromisoformat(record["observed_from_utc"].replace("Z", "+00:00"))
        end = datetime.fromisoformat(record["observed_to_utc"].replace("Z", "+00:00"))
        assert end >= begin, "Kanıt zamanı ters"

    docs = [ROOT / "README.md", *ROOT.glob("research/**/*.md"), *ROOT.glob("design-system/**/*.md")]
    for doc in docs:
        for link in re.findall(r"\]\(([^)]+)\)", doc.read_text(encoding="utf-8")):
            if link.startswith(("https://", "mailto:", "#")):
                continue
            assert not link.startswith("http://"), f"Güvensiz Markdown URL: {doc}: {link}"
            linked_path = unquote(link.split("#", 1)[0])
            assert (doc.parent / linked_path).exists(), f"Bozuk Markdown dosya bağlantısı: {doc}: {link}"
    print(f"OK: {len(sources)} kaynağın yapısı ve HTTPS bağlantı biçimi doğrulandı.")
    print(f"OK: {len(records)} REA kanıt özeti ve {len(docs)} Markdown dosyasının yerel bağlantıları doğrulandı.")
    print("Not: Bu denetim bağlantıların canlı olduğu veya fiyat sağladığı anlamına gelmez.")


if __name__ == "__main__":
    main()
