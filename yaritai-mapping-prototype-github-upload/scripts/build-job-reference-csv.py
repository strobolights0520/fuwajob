import csv
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "processed" / "jobtag" / "jobtag.sqlite"
OUT_PATH = ROOT / "data" / "processed" / "jobtag" / "job_reference_light.csv"


def shorten(text, limit):
    text = " ".join(str(text or "").split())
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


def joined(rows, key, limit):
    values = [shorten(row[key], limit) for row in rows if row[key]]
    return " / ".join(values)


def main():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row

    jobs = con.execute(
        """
        select job_id, source_job_id, name, description_short
        from jobs
        order by cast(source_job_id as integer)
        """
    ).fetchall()

    with OUT_PATH.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=[
                "job_id",
                "source_job_id",
                "job_name",
                "description_short",
            ],
        )
        writer.writeheader()

        for job in jobs:
            writer.writerow(
                {
                    "job_id": job["job_id"],
                    "source_job_id": job["source_job_id"],
                    "job_name": job["name"],
                    "description_short": shorten(job["description_short"], 40),
                }
            )

    con.close()
    print(OUT_PATH)


if __name__ == "__main__":
    main()
