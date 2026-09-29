#!/usr/bin/env python3
"""Exporta participaciones de Ciber Héroes a Excel (sin dependencias extra).

Uso:
  python3 scripts/exportar_excel.py
  python3 scripts/exportar_excel.py /ruta/salida.xlsx
"""
from __future__ import annotations

import csv
import sys
import zipfile
from datetime import datetime
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))

from db_ciberheroes import DEFAULT_DATA, DEFAULT_DB, connect, fmt_tiempo_from_seconds  # noqa: E402


def _resultado(evento: str | None, gano: int | None) -> str:
    if gano:
        return "GANÓ"
    if evento == "ronda_ok":
        return "EN CURSO"
    return "PERDIÓ"


def _col_letter(col: int) -> str:
    letters = ""
    while col:
        col, rem = divmod(col - 1, 26)
        letters = chr(65 + rem) + letters
    return letters


NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_PKG = "http://schemas.openxmlformats.org/package/2006/relationships"
NS_OD = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_CT = "http://schemas.openxmlformats.org/package/2006/content-types"
NS_CORE = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
NS_DC = "http://purl.org/dc/elements/1.1/"
NS_DCTERMS = "http://purl.org/dc/terms/"
NS_XSI = "http://www.w3.org/2001/XMLSchema-instance"
NS_EXT = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
NS_VT = "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"


def _is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _shared_and_sheets(sheets: list[tuple[str, list[str], list[list[object]]]]) -> tuple[str, list[str]]:
    strings: list[str] = []
    index: dict[str, int] = {}

    def sid(text: str) -> int:
        if text not in index:
            index[text] = len(strings)
            strings.append(text)
        return index[text]

    sheet_xmls: list[str] = []
    for _, headers, rows in sheets:
        last_col = _col_letter(max(1, len(headers)))
        last_row = max(1, len(rows) + 1)
        body = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            f'<worksheet xmlns="{NS_MAIN}">',
            f'<dimension ref="A1:{last_col}{last_row}"/>',
            '<sheetViews><sheetView workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>',
            '<sheetFormatPr defaultRowHeight="15"/>',
            "<sheetData>",
        ]

        def add_row(r_i: int, values: list[object]) -> None:
            cells = [f'<row r="{r_i}">']
            for c_i, value in enumerate(values, 1):
                ref = f"{_col_letter(c_i)}{r_i}"
                if value is None or value == "":
                    continue
                if _is_number(value):
                    cells.append(f'<c r="{ref}" t="n"><v>{value}</v></c>')
                else:
                    cells.append(f'<c r="{ref}" t="s"><v>{sid(str(value))}</v></c>')
            cells.append("</row>")
            body.append("".join(cells))

        add_row(1, list(headers))
        for offset, row in enumerate(rows):
            padded = list(row) + [""] * max(0, len(headers) - len(row))
            add_row(offset + 2, padded[: len(headers)])
        body.append("</sheetData></worksheet>")
        sheet_xmls.append("".join(body))

    sst = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        f'<sst xmlns="{NS_MAIN}" count="{len(strings)}" uniqueCount="{len(strings)}">',
    ]
    for text in strings:
        sst.append(f'<si><t xml:space="preserve">{escape(text)}</t></si>')
    sst.append("</sst>")
    return "".join(sst), sheet_xmls


def _zip_write(zf: zipfile.ZipFile, name: str, data: str) -> None:
    info = zipfile.ZipInfo(name, date_time=datetime.now().timetuple()[:6])
    info.compress_type = zipfile.ZIP_DEFLATED
    info.create_system = 0
    zf.writestr(info, data.encode("utf-8"))


def _write_xlsx(path: Path, sheets: list[tuple[str, list[str], list[list[object]]]]) -> None:
    sst, sheet_xmls = _shared_and_sheets(sheets)
    now = datetime.now().replace(microsecond=0).isoformat()
    sheet_names = [name for name, _, _ in sheets]
    n = len(sheets)

    wb_sheets = "".join(
        f'<sheet name="{escape(name)}" sheetId="{i}" r:id="rId{i}"/>'
        for i, name in enumerate(sheet_names, 1)
    )
    wb_rels = "".join(
        f'<Relationship Id="rId{i}" Type="{NS_OD}/worksheet" Target="worksheets/sheet{i}.xml"/>'
        for i in range(1, n + 1)
    )
    wb_rels += (
        f'<Relationship Id="rId{n + 1}" Type="{NS_OD}/styles" Target="styles.xml"/>'
        f'<Relationship Id="rId{n + 2}" Type="{NS_OD}/sharedStrings" Target="sharedStrings.xml"/>'
    )
    ct_sheets = "".join(
        f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for i in range(1, n + 1)
    )

    files = {
        "[Content_Types].xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<Types xmlns="{NS_CT}">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
            '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
            '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
            f"{ct_sheets}</Types>"
        ),
        "_rels/.rels": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<Relationships xmlns="{NS_PKG}">'
            f'<Relationship Id="rId1" Type="{NS_OD}/officeDocument" Target="xl/workbook.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            f'<Relationship Id="rId3" Type="{NS_OD}/extended-properties" Target="docProps/app.xml"/>'
            "</Relationships>"
        ),
        "docProps/app.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<Properties xmlns="{NS_EXT}" xmlns:vt="{NS_VT}">'
            "<Application>Ciber Heroes</Application>"
            f"<HeadingPairs><vt:vector size=\"2\" baseType=\"variant\"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>{n}</vt:i4></vt:variant></vt:vector></HeadingPairs>"
            f"<TitlesOfParts><vt:vector size=\"{n}\" baseType=\"lpstr\">"
            + "".join(f"<vt:lpstr>{escape(name)}</vt:lpstr>" for name in sheet_names)
            + "</vt:vector></TitlesOfParts></Properties>"
        ),
        "docProps/core.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<cp:coreProperties xmlns:cp="{NS_CORE}" xmlns:dc="{NS_DC}" xmlns:dcterms="{NS_DCTERMS}" xmlns:xsi="{NS_XSI}">'
            "<dc:creator>Ciber Heroes</dc:creator>"
            f'<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>'
            f'<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>'
            "</cp:coreProperties>"
        ),
        "xl/workbook.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<workbook xmlns="{NS_MAIN}" xmlns:r="{NS_OD}">'
            "<bookViews><workbookView/></bookViews>"
            f"<sheets>{wb_sheets}</sheets></workbook>"
        ),
        "xl/_rels/workbook.xml.rels": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<Relationships xmlns="{NS_PKG}">{wb_rels}</Relationships>'
        ),
        "xl/styles.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            f'<styleSheet xmlns="{NS_MAIN}">'
            '<fonts count="1"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>'
            '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
            "<borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders>"
            '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
            "</styleSheet>"
        ),
        "xl/sharedStrings.xml": sst,
    }
    for i, xml in enumerate(sheet_xmls, 1):
        files[f"xl/worksheets/sheet{i}.xml"] = xml

    buf = BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for name, xml in files.items():
            _zip_write(zf, name, xml)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(buf.getvalue())


def _write_csv(path: Path, headers: list[str], rows: list[list[object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(headers)
        writer.writerows(rows)


def exportar(salida: Path | None = None, db_path: Path | None = None) -> Path:
    conn = connect(db_path or DEFAULT_DB)
    participaciones = conn.execute(
        """
        SELECT r.*
        FROM ch_resultados r
        JOIN (
          SELECT documento, MAX(id) AS id
          FROM ch_resultados
          GROUP BY documento
        ) u ON u.id = r.id
        ORDER BY r.fecha DESC, r.id DESC
        """
    ).fetchall()
    eventos = conn.execute(
        """
        SELECT *
        FROM ch_eventos
        ORDER BY fecha ASC, id ASC
        """
    ).fetchall()
    conn.close()

    headers1 = [
        "Cédula",
        "Resultado",
        "Ronda alcanzada",
        "Respuestas correctas",
        "Aciertos última ronda",
        "Preguntas última ronda",
        "Duración",
        "Rayos restantes",
        "Inicio",
        "Fin",
        "Último evento",
        "Registrado",
    ]
    rows1: list[list[object]] = []
    for r in participaciones:
        keys = r.keys()
        ms = int(r["duration_ms"] or 0)
        dur_s = ms // 1000 if ms else int(r["duration_s"] or 0)
        correctas = r["respuestas_correctas"] if "respuestas_correctas" in keys and r["respuestas_correctas"] is not None else r["puntaje"]
        rows1.append([
            str(r["documento"]),
            _resultado(r["evento"] if "evento" in keys else None, r["gano"]),
            r["ronda"] if "ronda" in keys and r["ronda"] else ((r["ronda_idx"] or 0) + 1),
            correctas or 0,
            r["aciertos_ronda"] if "aciertos_ronda" in keys else 0,
            r["preguntas_ronda"] if "preguntas_ronda" in keys else 0,
            fmt_tiempo_from_seconds(dur_s or 0),
            r["vidas"] if "vidas" in keys and r["vidas"] is not None else "",
            r["started_at"] or "",
            r["ended_at"] or "",
            r["evento"] if "evento" in keys else "",
            r["fecha"] or "",
        ])

    headers2 = [
        "Cédula",
        "Evento",
        "Ronda",
        "Respuestas correctas (acumulado)",
        "Aciertos de la ronda",
        "Preguntas de la ronda",
        "Duración",
        "Rayos",
        "Ganó",
        "Inicio",
        "Fin",
        "Registrado",
    ]
    rows2: list[list[object]] = []
    for e in eventos:
        keys = e.keys()
        ms = int(e["duration_ms"] or 0) if "duration_ms" in keys else 0
        dur_s = ms // 1000 if ms else int(e["duration_s"] or 0) if "duration_s" in keys else 0
        correctas = e["respuestas_correctas"] if "respuestas_correctas" in keys and e["respuestas_correctas"] is not None else e["puntaje"]
        gano = e["gano"] if "gano" in keys else 0
        rows2.append([
            str(e["documento"]),
            e["evento"],
            e["ronda"],
            correctas or 0,
            e["aciertos_ronda"] or 0,
            e["preguntas_ronda"] or 0,
            fmt_tiempo_from_seconds(dur_s or 0),
            e["vidas"] if e["vidas"] is not None else "",
            "Sí" if gano else "No",
            e["started_at"] or "",
            e["ended_at"] if "ended_at" in keys and e["ended_at"] else "",
            e["fecha"] or "",
        ])

    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    out = Path(salida) if salida else (DEFAULT_DATA / f"ciber-heroes-{stamp}.xlsx")
    _write_xlsx(out, [
        ("Participaciones", headers1, rows1),
        ("Eventos", headers2, rows2),
    ])
    _write_csv(out.with_name(out.stem + "-participaciones.csv"), headers1, rows1)
    _write_csv(out.with_name(out.stem + "-eventos.csv"), headers2, rows2)
    return out


def main(argv: list[str]) -> int:
    dest = Path(argv[1]).expanduser().resolve() if len(argv) > 1 else None
    path = exportar(dest)
    print(str(path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
