from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import shutil
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "data" / "02-Dados Geo"
DEFAULT_OUTPUT = ROOT / "data" / "geojson" / "sbsj"
SBSJ_BBOX = (-45.98, -23.35, -45.70, -23.10)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def clean_text(value: str | None, limit: int = 1200) -> str:
    if not value:
        return ""
    text = html.unescape(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def direct_text(node: ET.Element, name: str) -> str:
    for child in node:
        if local_name(child.tag) == name and child.text:
            return clean_text(child.text)
    return ""


def descendants(node: ET.Element, name: str) -> list[ET.Element]:
    return [child for child in node.iter() if local_name(child.tag) == name]


def parse_coordinates(text: str | None) -> list[list[float]]:
    coordinates: list[list[float]] = []
    if not text:
        return coordinates

    for token in text.split():
        parts = token.split(",")
        if len(parts) < 2:
            continue
        try:
            lon = float(parts[0])
            lat = float(parts[1])
        except ValueError:
            continue
        coordinates.append([lon, lat])

    return coordinates


def read_kml(path: Path) -> str:
    if path.suffix.lower() == ".kmz":
        with zipfile.ZipFile(path) as kmz:
            names = kmz.namelist()
            kml_name = "doc.kml" if "doc.kml" in names else next((name for name in names if name.lower().endswith(".kml")), None)
            if not kml_name:
                raise FileNotFoundError(f"Nenhum KML encontrado em {path}")
            return kmz.read(kml_name).decode("utf-8-sig")

    return path.read_text(encoding="utf-8-sig")


def build_parent_map(root: ET.Element) -> dict[ET.Element, ET.Element]:
    return {child: parent for parent in root.iter() for child in parent}


def folder_path(node: ET.Element, parents: dict[ET.Element, ET.Element]) -> list[str]:
    names: list[str] = []
    current = parents.get(node)

    while current is not None:
        if local_name(current.tag) in {"Folder", "Document"}:
            name = direct_text(current, "name")
            if name:
                names.append(name)
        current = parents.get(current)

    return list(reversed(names))


def extended_properties(placemark: ET.Element) -> dict[str, str]:
    properties: dict[str, str] = {}

    for node in placemark.iter():
        node_name = local_name(node.tag)
        if node_name not in {"Data", "SimpleData"}:
            continue

        key = node.attrib.get("name")
        if not key:
            continue

        value = ""
        if node_name == "Data":
            for child in node:
                if local_name(child.tag) == "value":
                    value = clean_text(child.text)
                    break
        else:
            value = clean_text(node.text)

        if value and key not in properties:
            properties[key] = value

    return properties


def coordinate_texts(placemark: ET.Element) -> list[str]:
    return [node.text or "" for node in descendants(placemark, "coordinates") if (node.text or "").strip()]


def in_bbox(texts: list[str], bbox: tuple[float, float, float, float] | None) -> bool:
    if bbox is None:
        return True

    min_lon, min_lat, max_lon, max_lat = bbox
    for text in texts:
        for lon, lat in parse_coordinates(text):
            if min_lon <= lon <= max_lon and min_lat <= lat <= max_lat:
                return True

    return False


def base_properties(
    placemark: ET.Element,
    parents: dict[ET.Element, ET.Element],
    dataset: str,
    category: str,
    source_file: str,
) -> dict[str, object]:
    properties: dict[str, object] = {
        "name": direct_text(placemark, "name") or "Sem nome",
        "description": direct_text(placemark, "description"),
        "dataset": dataset,
        "category": category,
        "folderPath": folder_path(placemark, parents),
        "styleUrl": direct_text(placemark, "styleUrl"),
        "rawSource": f"data/02-Dados Geo/{source_file}",
    }
    properties.update(extended_properties(placemark))
    return properties


def feature(geometry_type: str, coordinates: object, properties: dict[str, object]) -> dict[str, object]:
    return {
        "type": "Feature",
        "properties": dict(properties),
        "geometry": {
            "type": geometry_type,
            "coordinates": coordinates,
        },
    }


def polygon_rings(polygon: ET.Element) -> list[list[list[float]]]:
    rings: list[list[list[float]]] = []

    for boundary in descendants(polygon, "outerBoundaryIs"):
        coords_node = next((node for node in descendants(boundary, "coordinates")), None)
        if coords_node is not None:
            coords = parse_coordinates(coords_node.text)
            if coords:
                rings.append(coords)

    for boundary in descendants(polygon, "innerBoundaryIs"):
        coords_node = next((node for node in descendants(boundary, "coordinates")), None)
        if coords_node is not None:
            coords = parse_coordinates(coords_node.text)
            if coords:
                rings.append(coords)

    return rings


def convert_kml_to_geojson(
    source_root: Path,
    output_root: Path,
    source_file: str,
    target_file: str,
    dataset: str,
    category: str,
    bbox: tuple[float, float, float, float] | None = None,
) -> dict[str, object]:
    source_path = source_root / source_file
    target_path = output_root / target_file
    target_path.parent.mkdir(parents=True, exist_ok=True)

    root = ET.fromstring(read_kml(source_path))
    parents = build_parent_map(root)
    features: list[dict[str, object]] = []

    placemarks = [node for node in root.iter() if local_name(node.tag) == "Placemark"]

    for placemark in placemarks:
        texts = coordinate_texts(placemark)
        if not texts or not in_bbox(texts, bbox):
            continue

        properties = base_properties(placemark, parents, dataset, category, source_file)

        for point in descendants(placemark, "Point"):
            coords_node = next((node for node in descendants(point, "coordinates")), None)
            coords = parse_coordinates(coords_node.text if coords_node is not None else "")
            if coords:
                features.append(feature("Point", coords[0], properties))

        for line in descendants(placemark, "LineString"):
            coords_node = next((node for node in descendants(line, "coordinates")), None)
            coords = parse_coordinates(coords_node.text if coords_node is not None else "")
            if len(coords) > 1:
                features.append(feature("LineString", coords, properties))

        for polygon in descendants(placemark, "Polygon"):
            rings = polygon_rings(polygon)
            if rings:
                features.append(feature("Polygon", rings, properties))

    geojson = {
        "type": "FeatureCollection",
        "name": dataset,
        "source": f"data/02-Dados Geo/{source_file}",
        "derivedFor": "Sandbox Sao Jose dos Campos",
        "featureCount": len(features),
        "features": features,
    }

    target_path.write_text(json.dumps(geojson, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "dataset": dataset,
        "source": f"data/02-Dados Geo/{source_file}",
        "target": target_path.relative_to(ROOT).as_posix(),
        "category": category,
        "featureCount": len(features),
    }


def count_placemarks(source_root: Path, source_file: str, bbox: tuple[float, float, float, float] | None = None) -> int:
    root = ET.fromstring(read_kml(source_root / source_file))
    placemarks = [node for node in root.iter() if local_name(node.tag) == "Placemark"]

    if bbox is None:
        return len(placemarks)

    return sum(1 for placemark in placemarks if in_bbox(coordinate_texts(placemark), bbox))


def main() -> None:
    parser = argparse.ArgumentParser(description="Promove KML/KMZ úteis para consumo rastreável no mapa.")
    parser.add_argument("--source-root", default=str(DEFAULT_SOURCE))
    parser.add_argument("--output-root", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    source_root = Path(args.source_root).resolve()
    output_root = Path(args.output_root).resolve()
    output_root.mkdir(parents=True, exist_ok=True)

    original_root = output_root / "originais"
    original_root.mkdir(parents=True, exist_ok=True)
    original_files = [
        {
            "dataset": "OPEA SBSJ",
            "sourceFile": "opeaSBSJ.kml",
            "target": "data/geojson/sbsj/originais/opeaSBSJ.kml",
            "category": "obstaculos",
            "format": "KML",
            "bbox": SBSJ_BBOX,
        },
        {
            "dataset": "PBZPH",
            "sourceFile": "pbzph.kml",
            "target": "data/geojson/sbsj/originais/pbzph.kml",
            "category": "zonas-protecao",
            "format": "KML",
        },
        {
            "dataset": "PBZPA SBSJ",
            "sourceFile": "pbzpa_SBSJ.kmz",
            "target": "data/geojson/sbsj/originais/pbzpa_SBSJ.kmz",
            "category": "zonas-protecao",
            "format": "KMZ",
        },
        {
            "dataset": "PZPANA SBSJ",
            "sourceFile": "pzpana_SBSJ.kmz",
            "target": "data/geojson/sbsj/originais/pzpana_SBSJ.kmz",
            "category": "zonas-protecao",
            "format": "KMZ",
        },
    ]

    items = []
    for item in original_files:
        source_file = item["sourceFile"]
        shutil.copy2(source_root / source_file, ROOT / item["target"])
        feature_count = count_placemarks(source_root, source_file, item.get("bbox"))
        manifest_item = {
            "dataset": item["dataset"],
            "source": f"data/02-Dados Geo/{source_file}",
            "target": item["target"],
            "category": item["category"],
            "format": item["format"],
            "featureCount": feature_count,
        }

        if item.get("bbox"):
            manifest_item["bbox"] = list(item["bbox"])

        items.append(manifest_item)

    manifest = {
        "generatedAt": dt.datetime.now().isoformat(timespec="seconds"),
        "sourceRoot": "data/02-Dados Geo",
        "note": "Arquivos KML/KMZ uteis promovidos para consumo do mapa. O site nao deve carregar diretamente a pasta de dados brutos.",
        "items": items,
    }
    (output_root / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    for item in items:
        print(f"{item['dataset']}: {item['featureCount']} features -> {item['target']}")


if __name__ == "__main__":
    main()
