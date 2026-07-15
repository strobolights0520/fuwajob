#!/usr/bin/env python3
import csv
import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "github-data"
CSV_DIR = EXPORT / "data" / "csv"
JSON_DIR = EXPORT / "data" / "json"


TAG_DESCRIPTIONS = {
    "A001": "企画・構想・プロデュースしたい",
    "A002": "制作・開発・デザインしたい",
    "A003": "出演・演技・表現など、自分の表現を前に出したい",
    "A004": "支援・伴走・調整など、誰かの活動を支えたい",
    "A005": "宣伝・PR・販売・流通など、価値を人に届けたい",
    "A006": "調査・研究・データ分析など、物事を深く理解したい",
    "A007": "教育・育成・伝達など、人の学びや成長に関わりたい",
    "A008": "運営・進行・マネジメントなど、場や仕組みを動かしたい",
    "D001": "お笑い、番組、ライブ、配信、ゲーム、アニメなど",
    "D002": "映像、放送、映画、動画、メディア制作など",
    "D003": "都市開発、地域、公共空間、建築、交通など",
    "D004": "食、料理、飲食、食品、食体験など",
    "D005": "スポーツ、試合、チーム、身体づくりなど",
    "D006": "学校、塾、教材、学習支援、生涯学習など",
    "D007": "IT、AI、アプリ、データ、セキュリティなど",
    "D008": "環境、自然、気候、資源循環、サステナビリティなど",
    "D009": "服、美容、コスメ、スタイリング、ブランドなど",
    "D010": "医療、福祉、健康、介護、リハビリなど",
    "S001": "出演・発信など、自分が前面に出る",
    "S002": "支える・調整する・縁の下で関わる",
    "S003": "多くの人、社会、全国規模に届ける",
    "S004": "身近な人や少人数に深く関わる",
}


INITIAL_TAG_JOB_MAP = [
    {
        "tag_id": "A002",
        "job_id": "JT0326",
        "job_name": "Webデザイナー（Web制作会社）",
        "weight": "0.85",
        "source": "manual",
        "review_status": "draft",
        "reviewed_by": "",
        "notes": "作る・制作するとの関連例",
        "route_type": "",
    },
    {
        "tag_id": "D003",
        "job_id": "JT0020",
        "job_name": "建築設計技術者",
        "weight": "0.8",
        "source": "manual",
        "review_status": "draft",
        "reviewed_by": "",
        "notes": "都市・まちづくりとの関連例",
        "route_type": "",
    },
]


INITIAL_STUDENT_ACTIONS = [
    {
        "action_id": "SA000001",
        "job_id": "JT0326",
        "job_name": "Webデザイナー（Web制作会社）",
        "category": "production",
        "action_text": "身近なWebサイトを1ページだけ作って人に見てもらう",
        "priority": "10",
        "source": "manual",
        "memo": "",
    },
    {
        "action_id": "SA000002",
        "job_id": "JT0020",
        "job_name": "建築設計技術者",
        "category": "research",
        "action_text": "駅前や商店街の使われ方を観察して改善案を描く",
        "priority": "10",
        "source": "manual",
        "memo": "",
    },
]


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def write_csv(path, rows, fieldnames):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_prototype_tags():
    app_js = (ROOT / "app.js").read_text(encoding="utf-8")
    tags_block = re.search(r"const tags = \[(.*?)\];", app_js, re.S).group(1)
    rows = []
    synonyms = []
    synonym_index = 1

    pattern = re.compile(
        r'\{\s*id:\s*"(?P<id>[^"]+)",\s*axis:\s*"(?P<axis>[^"]+)",\s*label:\s*"(?P<label>[^"]+)",\s*synonyms:\s*\[(?P<synonyms>[^\]]*)\]\s*\}',
        re.S,
    )
    for match in pattern.finditer(tags_block):
        tag_id = match.group("id")
        rows.append(
            {
                "tag_id": tag_id,
                "axis": match.group("axis"),
                "label": match.group("label"),
                "description": TAG_DESCRIPTIONS.get(tag_id, ""),
                "is_active": "TRUE",
                "owner": "",
                "memo": "prototype canonical tag",
            }
        )
        for surface in re.findall(r'"([^"]+)"', match.group("synonyms")):
            synonyms.append(
                {
                    "synonym_id": f"SYN{synonym_index:06d}",
                    "tag_id": tag_id,
                    "surface": surface,
                    "normalized_surface": surface.lower(),
                    "source": "prototype",
                    "is_active": "TRUE",
                    "memo": "",
                }
            )
            synonym_index += 1

    return rows, synonyms


def build_tag_job_map():
    ready_rows = read_csv(ROOT / "outputs" / "ai_tag_job_map_ready.csv")
    rows = list(INITIAL_TAG_JOB_MAP)
    for row in ready_rows:
        rows.append(
            {
                "tag_id": row["tag_id"],
                "job_id": row["job_id"],
                "job_name": row["job_name"],
                "weight": row["weight"],
                "source": "llm_draft",
                "review_status": "draft",
                "reviewed_by": "",
                "notes": row["reason"],
                "route_type": row["route_type"],
            }
        )
    return rows


def copy_csv(name, rows, fields):
    write_csv(CSV_DIR / name, rows, fields)
    write_json(JSON_DIR / name.replace(".csv", ".json"), rows)


def main():
    if EXPORT.exists():
        shutil.rmtree(EXPORT)
    CSV_DIR.mkdir(parents=True)
    JSON_DIR.mkdir(parents=True)

    tags, tag_synonyms = parse_prototype_tags()
    tag_job_map = build_tag_job_map()
    student_actions = INITIAL_STUDENT_ACTIONS
    job_reference = read_csv(ROOT / "data" / "processed" / "jobtag" / "job_reference_light.csv")
    ai_review = read_csv(ROOT / "outputs" / "ai_tag_job_map_review.csv")
    ai_ready = read_csv(ROOT / "outputs" / "ai_tag_job_map_ready.csv")
    new_tag_candidates = read_csv(ROOT / "outputs" / "ai_new_tag_candidates.csv")

    copy_csv("tags.csv", tags, ["tag_id", "axis", "label", "description", "is_active", "owner", "memo"])
    copy_csv("tag_synonyms.csv", tag_synonyms, ["synonym_id", "tag_id", "surface", "normalized_surface", "source", "is_active", "memo"])
    copy_csv("tag_job_map.csv", tag_job_map, ["tag_id", "job_id", "job_name", "weight", "source", "review_status", "reviewed_by", "notes", "route_type"])
    copy_csv("student_actions.csv", student_actions, ["action_id", "job_id", "job_name", "category", "action_text", "priority", "source", "memo"])
    copy_csv("job_reference.csv", job_reference, ["job_id", "source_job_id", "job_name", "description_short"])
    copy_csv("ai_tag_job_map_review.csv", ai_review, ["row_number", "source_tag_id", "source_tag_label", "target_tag_id", "target_tag_label", "original_job_name", "job_id", "official_job_name", "weight", "reason", "route_type", "tag_status", "job_match_status", "review_status", "note"])
    copy_csv("ai_tag_job_map_ready.csv", ai_ready, ["tag_id", "job_id", "job_name", "weight", "reason", "route_type"])
    copy_csv("ai_new_tag_candidates.csv", new_tag_candidates, ["source_tag_id", "source_tag_label", "suggested_action"])

    manifest = {
        "name": "yaritai-mapping-data",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "spreadsheet_title": "ふわっとやりたいこと",
        "spreadsheet_id": "1wUY9-2O1hCwPn5yNx3KatCwmeuj9M5JKfd6kgS0FBT0",
        "source": {
            "job_reference": "厚生労働省 職業情報提供サイト（日本版O-NET）job tag ダウンロードデータ",
            "jobtag_description_version": "7.01",
            "jobtag_numeric_version": "7.00",
            "prototype_tags": "yaritai-mapping-prototype/app.js",
            "ai_review_input": "outputs/ai_tag_job_map_review.csv",
        },
        "counts": {
            "tags": len(tags),
            "tag_synonyms": len(tag_synonyms),
            "tag_job_map": len(tag_job_map),
            "student_actions": len(student_actions),
            "job_reference": len(job_reference),
            "ai_tag_job_map_review": len(ai_review),
            "ai_tag_job_map_ready": len(ai_ready),
            "ai_new_tag_candidates": len(new_tag_candidates),
        },
        "status_policy": {
            "tag_job_map.review_status": ["draft", "approved", "rejected"],
            "tag_job_map.source": ["manual", "rule", "llm_draft"],
            "route_type": ["classic", "surprise", ""],
        },
    }
    write_json(EXPORT / "manifest.json", manifest)

    readme = """# やりたいことマッピング データパッケージ

このフォルダは、プロトタイプとGoogleスプレッドシートで作成したデータをGitHubに置きやすい形へ整理したものです。

## 使うファイル

- `data/csv/tags.csv`: タグ定義。行動、領域、関わり方のマスター。
- `data/csv/tag_synonyms.csv`: 自由入力からタグを見つけるための表記ゆれ。
- `data/csv/tag_job_map.csv`: タグと職業の対応表。プロトタイプで主に使う候補。
- `data/csv/student_actions.csv`: 高校生向けの次の一歩案。
- `data/csv/job_reference.csv`: job tag由来の職業リファレンス軽量版。
- `data/csv/ai_tag_job_map_review.csv`: 別AIが出した候補の全件レビュー表。
- `data/csv/ai_new_tag_candidates.csv`: 追加検討中の新規タグ候補。

同じ内容を `data/json/` にJSON形式でも置いています。

## 現在の扱い

`tag_job_map.csv` のデータはまだ `draft` です。サービスに出す前に、人間が確認したものを `approved` にしてください。

`ai_tag_job_map_review.csv` は作業ログ兼レビュー材料です。`review_status=ready` は比較的そのまま使いやすい候補、`review` は職業名やタグ追加の確認が必要な候補です。

## 出典

職業リファレンスは、厚生労働省 職業情報提供サイト（日本版O-NET）job tag ダウンロードデータをもとにした軽量加工データです。

GitHubで公開する場合は、READMEやサービス画面に以下のような出典表記を入れてください。

> 職業情報の一部は、厚生労働省 職業情報提供サイト（日本版O-NET）job tag のダウンロードデータを加工して作成しています。

"""
    (EXPORT / "README.md").write_text(readme, encoding="utf-8")

    dictionary = """# Data Dictionary

## tags

- `tag_id`: タグID。例: `A001`, `D003`, `S002`
- `axis`: `action`, `domain`, `style`
- `label`: 表示名
- `description`: タグの説明
- `is_active`: 使用中なら `TRUE`
- `owner`: 管理者メモ用
- `memo`: 補足

## tag_synonyms

- `synonym_id`: 表記ゆれID
- `tag_id`: 対応するタグID
- `surface`: ユーザー入力に出そうな語
- `normalized_surface`: 照合用の正規化文字列
- `source`: `prototype`, `manual` など
- `is_active`: 使用中なら `TRUE`
- `memo`: 補足

## tag_job_map

- `tag_id`: タグID
- `job_id`: `job_reference` の職業ID
- `job_name`: 職業名
- `weight`: 関連度。0から1
- `source`: `manual`, `rule`, `llm_draft`
- `review_status`: `draft`, `approved`, `rejected`
- `reviewed_by`: 確認者
- `notes`: 対応理由
- `route_type`: `classic` または `surprise`

## ai_tag_job_map_review

- `source_tag_id`: 別AI出力時点のタグID
- `target_tag_id`: 現在のタグ体系に変換したID
- `job_match_status`: `exact`, `mapped`, `candidate`, `needs_review`, `not_found`
- `review_status`: `ready` または `review`
"""
    (EXPORT / "DATA_DICTIONARY.md").write_text(dictionary, encoding="utf-8")

    print(json.dumps(manifest["counts"], ensure_ascii=False, indent=2))
    print(EXPORT)


if __name__ == "__main__":
    main()
