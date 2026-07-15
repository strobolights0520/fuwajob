import csv
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed" / "jobtag"
DB_PATH = PROCESSED / "jobtag.sqlite"
SCHEMA_PATH = ROOT / "sql" / "schema.sql"


def read_csv(name):
    with (PROCESSED / name).open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def boolish(value):
    return 1 if str(value).strip().lower() in {"1", "true", "t", "yes"} else 0


def nullable(value):
    value = str(value or "").strip()
    return value if value else None


def insert_rows(conn, table, rows, columns, transform=None):
    if not rows:
        return
    placeholders = ",".join(["?"] * len(columns))
    column_sql = ",".join(columns)
    values = []
    for row in rows:
        if transform:
            row = transform(row)
        values.append([row.get(column) for column in columns])
    conn.executemany(
        f"insert into {table} ({column_sql}) values ({placeholders})",
        values,
    )


def main():
    if DB_PATH.exists():
        DB_PATH.unlink()

    conn = sqlite3.connect(DB_PATH)
    conn.execute("pragma foreign_keys = on")
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

    manifest = json.loads((PROCESSED / "source_manifest.json").read_text(encoding="utf-8"))
    source_rows = [
        {
            "source_file_id": "jobtag_description_7_01",
            "source_name": "職業情報データベース 解説系ダウンロードデータ",
            "source_url": manifest["page_url"],
            "file_name": manifest["description_file"],
            "version": manifest["description_version"],
            "published_on": manifest["description_published_on"],
            "downloaded_on": manifest["downloaded_on"],
            "attribution": manifest["attribution"],
        },
        {
            "source_file_id": "jobtag_numeric_7_00",
            "source_name": "職業情報データベース 簡易版数値系ダウンロードデータ",
            "source_url": manifest["page_url"],
            "file_name": manifest["numeric_file"],
            "version": manifest["numeric_version"],
            "published_on": manifest["numeric_published_on"],
            "downloaded_on": manifest["downloaded_on"],
            "attribution": manifest["attribution"],
        },
    ]
    insert_rows(
        conn,
        "source_files",
        source_rows,
        ["source_file_id", "source_name", "source_url", "file_name", "version", "published_on", "downloaded_on", "attribution"],
    )

    insert_rows(
        conn,
        "jobs",
        read_csv("jobs.csv"),
        ["job_id", "source_job_id", "name", "description_short", "description", "how_to_get", "working_conditions", "source_url", "source_file", "source_version", "source_published_on"],
        lambda row: {**row, "description_short": nullable(row["description_short"]), "description": nullable(row["description"]), "how_to_get": nullable(row["how_to_get"]), "working_conditions": nullable(row["working_conditions"])},
    )
    insert_rows(conn, "job_aliases", read_csv("job_aliases.csv"), ["job_id", "alias_no", "alias_name"])
    insert_rows(conn, "job_classifications", read_csv("job_classifications.csv"), ["job_id", "classification_type", "classification_code"])
    insert_rows(conn, "job_qualifications", read_csv("job_qualifications.csv"), ["job_id", "qualification_no", "qualification_name"])
    insert_rows(conn, "job_skills", read_csv("job_skills.csv"), ["job_id", "skill_name", "score", "irrelevant"], lambda row: {**row, "irrelevant": boolish(row["irrelevant"])})
    insert_rows(conn, "job_knowledge", read_csv("job_knowledge.csv"), ["job_id", "knowledge_name", "score", "irrelevant"], lambda row: {**row, "irrelevant": boolish(row["irrelevant"])})
    insert_rows(conn, "job_tasks", read_csv("job_tasks.csv"), ["job_id", "task_no", "task_text", "execution_rate", "importance"])

    conn.commit()

    counts = {}
    for table in [
        "source_files",
        "jobs",
        "job_aliases",
        "job_classifications",
        "job_qualifications",
        "job_skills",
        "job_knowledge",
        "job_tasks",
    ]:
        counts[table] = conn.execute(f"select count(*) from {table}").fetchone()[0]
    conn.close()

    print(json.dumps({"database": str(DB_PATH), "counts": counts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
