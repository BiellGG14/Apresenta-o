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
from xml.sax.saxutils import escape


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


def clean_property(value: object) -> str:
    if value is None:
        return ""

    text = str(value).strip()

    if not text or text.lower() == "nan":
        return ""

    return text


def kml_coordinates(coords: object) -> str:
    return " ".join(f"{float(lon):.8f},{float(lat):.8f},0" for lon, lat, *_ in coords)


def kml_polygon(polygon: object) -> str:
    outer = kml_coordinates(polygon.exterior.coords)
    inner = []

    for ring in polygon.interiors:
        inner.append(
            "<innerBoundaryIs><LinearRing>"
            f"<coordinates>{kml_coordinates(ring.coords)}</coordinates>"
            "</LinearRing></innerBoundaryIs>"
        )

    return (
        "<Polygon>"
        "<outerBoundaryIs><LinearRing>"
        f"<coordinates>{outer}</coordinates>"
        "</LinearRing></outerBoundaryIs>"
        f"{''.join(inner)}"
        "</Polygon>"
    )


def kml_geometry(geometry: object) -> str:
    if geometry is None or geometry.is_empty:
        return ""

    geom_type = geometry.geom_type

    if geom_type == "Polygon":
        return kml_polygon(geometry)

    if geom_type == "MultiPolygon":
        return "<MultiGeometry>" + "".join(kml_polygon(item) for item in geometry.geoms) + "</MultiGeometry>"

    if geom_type == "LineString":
        return f"<LineString><coordinates>{kml_coordinates(geometry.coords)}</coordinates></LineString>"

    if geom_type == "MultiLineString":
        return (
            "<MultiGeometry>"
            + "".join(f"<LineString><coordinates>{kml_coordinates(item.coords)}</coordinates></LineString>" for item in geometry.geoms)
            + "</MultiGeometry>"
        )

    if geom_type == "Point":
        return f"<Point><coordinates>{geometry.x:.8f},{geometry.y:.8f},0</coordinates></Point>"

    if geom_type == "GeometryCollection":
        parts = "".join(kml_geometry(item) for item in geometry.geoms)
        return f"<MultiGeometry>{parts}</MultiGeometry>" if parts else ""

    return ""


def kml_description(row: object) -> str:
    labels = [
        ("tipo", "Tipo"),
        ("classe", "Classe"),
        ("trecho", "Trecho"),
        ("fca", "FCA"),
        ("ats", "ATS"),
        ("altmin", "Alt min"),
        ("altmax", "Alt max"),
        ("fixo_a_nom", "Fixo A"),
        ("fixo_b_nom", "Fixo B"),
        ("carta_nome", "Carta"),
        ("efetivacao", "Efetivação"),
        ("identifica", "Identificação"),
    ]
    lines = []

    for key, label in labels:
        value = clean_property(row.get(key))

        if value:
            lines.append(f"{label}: {value}")

    return " | ".join(lines)


def write_vector_kml(source_path: Path, target_path: Path, dataset: str) -> dict[str, object]:
    import geopandas as gpd

    gdf = gpd.read_file(source_path)

    if gdf.crs is None:
        gdf = gdf.set_crs(4326)

    gdf = gdf.to_crs(4326)
    target_path.parent.mkdir(parents=True, exist_ok=True)
    placemarks = []

    for _, row in gdf.iterrows():
        geometry = kml_geometry(row.geometry)

        if not geometry:
            continue

        name_parts = [clean_property(row.get("nome")), clean_property(row.get("trecho"))]
        name = " ".join(part for part in name_parts if part) or dataset
        description = kml_description(row)
        placemarks.append(
            "<Placemark>"
            f"<name>{escape(name)}</name>"
            f"<description>{escape(description)}</description>"
            f"{geometry}"
            "</Placemark>"
        )

    kml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n'
        "<Document>\n"
        f"<name>{escape(dataset)}</name>\n"
        + "\n".join(placemarks)
        + "\n</Document>\n</kml>\n"
    )
    target_path.write_text(kml, encoding="utf-8")

    return {
        "dataset": dataset,
        "source": source_path.relative_to(ROOT).as_posix(),
        "target": target_path.relative_to(ROOT).as_posix(),
        "category": "superficies",
        "format": "KML derivado",
        "featureCount": len(placemarks),
        "bounds": [round(float(value), 8) for value in gdf.total_bounds],
    }


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

    surface_files = [
        {
            "dataset": "REA São Paulo",
            "source": ROOT / "data" / "geojson" / "sbsj" / "CV_REA_SP.gpkg",
            "target": output_root / "superficies" / "rea_sp.kml",
        },
        {
            "dataset": "REH XP São Paulo",
            "source": ROOT / "data" / "geojson" / "sbsj" / "REH" / "CV_REH_XP_SAO_PAULO.shp",
            "target": output_root / "superficies" / "reh_xp_sao_paulo.kml",
        },
        {
            "dataset": "EAC D",
            "source": ROOT / "data" / "geojson" / "sbsj" / "EAC" / "D" / "eac_d.shp",
            "target": output_root / "superficies" / "eac_d.kml",
        },
        {
            "dataset": "EAC P",
            "source": ROOT / "data" / "geojson" / "sbsj" / "EAC" / "P" / "eac_p.shp",
            "target": output_root / "superficies" / "eac_p.kml",
        },
    ]

    for surface in surface_files:
        if surface["source"].exists():
            items.append(write_vector_kml(surface["source"], surface["target"], surface["dataset"]))

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
