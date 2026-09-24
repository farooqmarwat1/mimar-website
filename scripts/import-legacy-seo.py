import html
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from lxml import html as lxml_html

SOURCE = Path("/Users/manahil/Downloads/mimar.WordPress.2026-08-25.xml")
OUTPUT = Path("src/content/legacy-seo.json")

WP = "{http://wordpress.org/export/1.2/}"
CONTENT = "{http://purl.org/rss/1.0/modules/content/}"

ARTICLE_PREFIXES = (
    "/blog/",
    "/3d-visualization/",
    "/vr-real-estate/",
    "/metaverse/",
    "/technology/",
)
ARTICLE_PAGES = {
    "/3d-architectural-walkthrough-services/",
    "/3d-visualization-services-uae/",
    "/3d-visualization-usa/",
    "/3d-visualization-middle-east/",
    "/mimar-malaysia/",
}


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = value.replace("—", "-").replace("–", "-")
    value = re.sub(r"\[[^\]]+\]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def content_blocks(markup: str) -> list[dict[str, str]]:
    if not markup:
        return []
    try:
        root = lxml_html.fragment_fromstring(markup, create_parent="div")
    except (ValueError, TypeError):
        return []

    for node in root.xpath(".//script|.//style|.//noscript|.//form|.//nav"):
        node.drop_tree()

    blocks = []
    seen = set()
    for node in root.xpath(".//h2|.//h3|.//p|.//li"):
        tag = node.tag.lower()
        text = clean_text(" ".join(node.itertext()))
        if not text or text in seen:
            continue
        if tag == "p" and len(text) < 35:
            continue
        if len(text) > 700:
            text = text[:697].rsplit(" ", 1)[0] + "..."
        seen.add(text)
        blocks.append({"type": tag, "text": text})
        if len(blocks) >= 250:
            break
    return blocks


items = []
for _, item in ET.iterparse(SOURCE, events=("end",)):
    if item.tag != "item":
        continue

    post_type = item.findtext(WP + "post_type", "")
    status = item.findtext(WP + "status", "")
    link = item.findtext("link", "").strip()
    path = re.sub(r"^https?://(?:www\.)?mim\.archi", "", link).split("?", 1)[0]
    if not path.endswith("/"):
        path += "/"

    should_import = (
        post_type in {"post", "page"}
        and status == "publish"
        and (path.startswith(ARTICLE_PREFIXES) or path in ARTICLE_PAGES)
        and path not in {"/blog/", "/blog/architecture/", "/blog/3d-visualization/", "/blog/vr-real-estate/", "/blog/real-estate-tech/"}
    )

    if should_import:
        metadata = {}
        for postmeta in item.findall(WP + "postmeta"):
            key = postmeta.findtext(WP + "meta_key", "")
            if key.startswith("rank_math_"):
                metadata[key] = postmeta.findtext(WP + "meta_value", "")

        title = clean_text(item.findtext("title", ""))
        seo_title = clean_text(metadata.get("rank_math_title", "")) or f"{title} - Mimar Studios"
        description = clean_text(metadata.get("rank_math_description", ""))
        blocks = content_blocks(item.findtext(CONTENT + "encoded", ""))
        if not description:
            description = next((block["text"] for block in blocks if block["type"] == "p"), title)
        description = description[:157].rsplit(" ", 1)[0] if len(description) > 160 else description

        items.append(
            {
                "path": path.rstrip("/"),
                "title": title,
                "seoTitle": seo_title,
                "description": description,
                "keywords": [clean_text(keyword) for keyword in metadata.get("rank_math_focus_keyword", "").split(",") if clean_text(keyword)],
                "published": item.findtext(WP + "post_date_gmt", ""),
                "modified": item.findtext(WP + "post_modified_gmt", ""),
                "blocks": blocks,
            }
        )

    item.clear()

items.sort(key=lambda entry: entry["path"])
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(items, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Imported {len(items)} legacy SEO pages into {OUTPUT}")
