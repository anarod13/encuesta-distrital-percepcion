import csv
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "raw" / "consolidado_preguntas.csv"
OUT_DIR = ROOT / "static" / "data"

NS_CATS = {"ns/nr", "nsnr", "ns", "nr"}
LIKERT_CATS = {
    "totalmente de acuerdo",
    "de acuerdo",
    "ni de acuerdo. ni en desacuerdo",
    "ni de acuerdo ni en desacuerdo",
    "en desacuerdo",
    "totalmente en desacuerdo",
    "muy bueno",
    "muy buena",
    "bueno",
    "buena",
    "regular",
    "malo",
    "mala",
    "muy malo",
    "muy mala",
    "excelente",
    "aceptable",
    "deficiente",
    "lunes",
    "martes",
    "miercoles",
    "miércoles",
    "jueves",
    "viernes",
    "sabado",
    "sábado",
    "domingo",
}
SI_NO = {"sí", "no"}


def slug(title: str) -> str:
    normalized = unicodedata.normalize("NFKD", title.lower())
    stripped = "".join(c for c in normalized if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", stripped).strip("-") or "pregunta"


def parse_num(value: str, digits: int | None = None, as_int: bool = False):
    text = (value or "").strip()
    if text == "":
        return 0
    number = float(text)
    if as_int:
        return int(round(number))
    if digits is not None:
        return round(number, digits)
    return number


def normalize_cat(cat: str) -> str:
    return re.sub(r"\s+", " ", cat.strip().lower())


def is_ns(cat: str) -> bool:
    return normalize_cat(cat).replace(" ", "") in NS_CATS


def chart_kind(categories: list[str]) -> str:
    core = {normalize_cat(c) for c in categories if not is_ns(c)}
    if core and core <= SI_NO:
        return "doughnut"
    if len(core & LIKERT_CATS) >= 2:
        return "stacked"
    return "hbar"


def compact_row(row: dict) -> dict:
    return {
        "cat": (row.get("Categoría respuesta") or "").strip(),
        "personasPct": parse_num(row.get("Personas(%)", ""), 2),
        "hogaresPct": parse_num(row.get("Hogares(%)", ""), 2),
        "personas": parse_num(row.get("Personas", ""), as_int=True),
        "hogares": parse_num(row.get("Hogares", ""), as_int=True),
        "pCvPct": parse_num(row.get("P CV(%)", ""), 2),
        "hCvPct": parse_num(row.get("H CV(%)", ""), 2),
    }


def ns_last(rows: list[dict]) -> list[dict]:
    kept, tail = [], []
    for row in rows:
        (tail if is_ns(row["cat"]) else kept).append(row)
    return kept + tail


def convert():
    answers: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))
    titles: dict[str, str] = {}
    order: list[str] = []
    skipped_empty = 0

    with CSV_PATH.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for raw in reader:
            title = (raw.get("Pregunta") or "").strip()
            if not title:
                skipped_empty += 1
                continue
            question_id = slug(title)
            if question_id not in titles:
                titles[question_id] = title
                order.append(question_id)
            upl = (raw.get("UPL") or "").strip()
            answers[question_id][upl].append(compact_row(raw))

    questions = []
    for question_id in order:
        by_upl = {upl: ns_last(rows) for upl, rows in answers[question_id].items()}
        answers[question_id] = by_upl
        first_upl = next(iter(by_upl))
        categories = [row["cat"] for row in by_upl[first_upl]]
        questions.append(
            {
                "id": question_id,
                "title": titles[question_id],
                "chartKind": chart_kind(categories),
                "categories": categories,
            }
        )

    by_upl: dict[str, dict] = {}
    upl_order: list[str] = []
    for question_id in order:
        for upl_name, rows in answers[question_id].items():
            if not upl_name:
                continue
            upl_id = slug(upl_name)
            if upl_id not in by_upl:
                by_upl[upl_id] = {"name": upl_name, "questions": {}}
                upl_order.append(upl_id)
            by_upl[upl_id]["questions"][question_id] = rows

    upls = [
        {
            "id": upl_id,
            "name": by_upl[upl_id]["name"],
            "questionIds": list(by_upl[upl_id]["questions"].keys()),
        }
        for upl_id in upl_order
    ]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "answers.json").write_text(
        json.dumps(answers, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "questions.json").write_text(
        json.dumps(questions, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "upls.json").write_text(
        json.dumps(upls, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "by-upl.json").write_text(
        json.dumps(by_upl, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"questions: {len(questions)}")
    print(f"upls: {len(upls)}")
    print(f"skipped empty Pregunta: {skipped_empty}")
    print(f"wrote {OUT_DIR / 'answers.json'}")
    print(f"wrote {OUT_DIR / 'questions.json'}")
    print(f"wrote {OUT_DIR / 'upls.json'}")
    print(f"wrote {OUT_DIR / 'by-upl.json'}")

    probe_id = next((q["id"] for q in questions if "hogar unipersonal" in q["title"].lower()), None)
    if probe_id and "Arborizadora" in answers[probe_id]:
        slice_rows = answers[probe_id]["Arborizadora"]
        total = sum(row["personasPct"] for row in slice_rows)
        print(f"sanity {probe_id} Arborizadora Personas(%): {total}")


if __name__ == "__main__":
    convert()