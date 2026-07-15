#!/usr/bin/env python3
import csv
import difflib
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT = Path("/Users/hatakeiichiro/.codex/attachments/5889f7e4-cfc4-46fa-ba2f-934f39a8900d/pasted-text.txt")
JOB_REFERENCE = ROOT / "data/processed/jobtag/job_reference_light.csv"
OUTPUT_DIR = ROOT / "outputs"


SOURCE_TAGS = {
    "D001": "教育",
    "D002": "医療",
    "D004": "環境",
    "D005": "食",
    "D006": "テクノロジー",
    "D007": "表現・メディア",
    "D008": "スポーツ",
    "D009": "観光・地域文化",
    "D010": "国際・多文化",
    "D011": "金融",
    "D012": "ものづくり",
    "D013": "ファッション・美容",
    "D014": "ゲーム・アニメ・音楽",
    "D015": "社会課題・公共",
    "D016": "子ども・若者",
    "D017": "高齢者・介護",
    "D018": "住まい・暮らし",
    "D019": "交通・物流",
    "D020": "法律・制度",
    "D021": "動物・ペット",
    "D022": "科学・宇宙",
}


# Current prototype / spreadsheet domain IDs.
TARGET_TAG_MAP = {
    "D001": "D006",  # 教育 -> 教育・学び
    "D002": "D010",  # 医療 -> 医療・福祉
    "D004": "D008",  # 環境 -> 環境・サステナビリティ
    "D005": "D004",  # 食 -> 食
    "D006": "D007",  # テクノロジー -> テクノロジー
    "D007": "D002",  # 表現・メディア -> 映像・放送
    "D008": "D005",  # スポーツ -> スポーツ
    "D013": "D009",  # ファッション・美容 -> ファッション・美容
    "D014": "D001",  # ゲーム・アニメ・音楽 -> 笑い・エンタメ
    "D017": "D010",  # 高齢者・介護 -> 医療・福祉
}


TARGET_TAG_LABELS = {
    "D001": "笑い・エンタメ",
    "D002": "映像・放送",
    "D003": "都市・まちづくり",
    "D004": "食",
    "D005": "スポーツ",
    "D006": "教育・学び",
    "D007": "テクノロジー",
    "D008": "環境・サステナビリティ",
    "D009": "ファッション・美容",
    "D010": "医療・福祉",
}


MANUAL_JOB_MAP = {
    "AIエンジニア": "AIエンジニア",
    "ITコンサルタント": "ITコンサルタント",
    "NPO職員": "NPO法人職員（企画・運営）",
    "UXデザイナー": "UX/UIデザイナー",
    "アニメーター": "アニメーター",
    "インテリアコーディネーター": "インテリアコーディネーター",
    "キャリアカウンセラー": "キャリアカウンセラー/キャリアコンサルタント",
    "ゲームエンジニア": "ゲームクリエーター",
    "ゲームプランナー": "ゲームクリエーター",
    "ケアマネジャー": "介護支援専門員/ケアマネジャー",
    "スポーツトレーナー": "スポーツトレーナー",
    "セキュリティエンジニア": "セキュリティエキスパート（オペレーション）",
    "ソフトウェアエンジニア": "ソフトウェア開発（パッケージソフト）",
    "ソーシャルワーカー": "社会福祉士（ソーシャルワーカー）",
    "データアナリスト": "データサイエンティスト",
    "データサイエンティスト": "データサイエンティスト",
    "トリマー": "トリマー",
    "ファイナンシャルプランナー": "ファイナンシャル・プランナー",
    "ファッションデザイナー": "ファッションデザイナー",
    "フィットネスインストラクター": "フィットネスクラブ・インストラクター",
    "介護職": "施設介護員",
    "保育士": "保育士",
    "児童福祉司": "児童相談所相談員",
    "公認心理師": "公認心理師",
    "動物園飼育員": "動物園飼育員",
    "動物看護師": "愛玩動物看護師",
    "医療ソーシャルワーカー": "医療ソーシャルワーカー",
    "司法書士": "司法書士",
    "図書館司書": "図書館司書",
    "塾講師": "学習塾教師",
    "外交官": "外交官",
    "大学教員": "大学教員",
    "弁護士": "弁護士",
    "日本語教師": "日本語教師",
    "林業職": "林業作業",
    "機械設計": "機械設計技術者",
    "獣医師": "獣医師",
    "理学療法士": "理学療法士（PT）",
    "看護師": "看護師",
    "社会福祉士": "社会福祉士（ソーシャルワーカー）",
    "福祉用具専門相談員": "福祉用具専門相談員",
    "管理栄養士": "栄養士",
    "経理・財務": "経理事務",
    "編集者": "編集者",
    "美容師": "美容師",
    "薬剤師": "薬剤師",
    "行政書士": "行政書士",
    "証券アナリスト": "証券アナリスト",
}


AMBIGUOUS_JOB_MAP = {
    "医師": "内科医",
    "学校教員": "中学校教員",
    "ホテルスタッフ": "ホテル・旅館支配人",
    "航空会社総合職": "航空会社客室乗務員",
    "行政職員": "国家公務員（行政事務）",
    "銀行員": "銀行等窓口事務",
    "広告プランナー": "広告ディレクター",
    "記者・ライター": "新聞記者",
    "販売員": "デパート店員",
    "通訳・翻訳者": "通訳",
    "体育教員": "中学校教員",
    "品質管理": "食料品検査",
    "商品企画": "商品企画開発（チェーンストア）",
    "研究者": "自然科学系研究者",
    "研究職": "自然科学系研究者",
    "研究開発": "化学製品開発技術者",
    "職人": "建築大工",
    "法務": "弁護士",
}


def normalize(value):
    return re.sub(r"[\s・/（）()、,]", "", value or "").lower()


def load_jobs():
    with JOB_REFERENCE.open(encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    by_name = {row["job_name"]: row for row in rows}
    by_normalized = {normalize(row["job_name"]): row for row in rows}
    return rows, by_name, by_normalized


def find_job(original_name, jobs, by_name, by_normalized):
    if original_name in by_name:
        return by_name[original_name], "exact", ""

    if original_name in MANUAL_JOB_MAP:
        target = MANUAL_JOB_MAP[original_name]
        if target in by_name:
            return by_name[target], "mapped", f"{original_name} -> {target}"

    if original_name in AMBIGUOUS_JOB_MAP:
        target = AMBIGUOUS_JOB_MAP[original_name]
        if target in by_name:
            return by_name[target], "candidate", f"{original_name} is broad; candidate: {target}"

    normalized = normalize(original_name)
    if normalized in by_normalized:
        return by_normalized[normalized], "normalized", ""

    substring_matches = [
        row for row in jobs
        if normalized and (normalized in normalize(row["job_name"]) or normalize(row["job_name"]) in normalized)
    ]
    if len(substring_matches) == 1:
        return substring_matches[0], "candidate", f"substring candidate: {substring_matches[0]['job_name']}"
    if len(substring_matches) > 1:
        choices = " / ".join(row["job_name"] for row in substring_matches[:5])
        return None, "needs_review", f"multiple candidates: {choices}"

    close = difflib.get_close_matches(original_name, [row["job_name"] for row in jobs], n=3, cutoff=0.6)
    if close:
        return by_name[close[0]], "candidate", f"fuzzy candidate: {close[0]}"

    return None, "not_found", ""


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    jobs, by_name, by_normalized = load_jobs()

    review_rows = []
    ready_rows = []
    new_tag_rows = []

    with INPUT.open(encoding="utf-8-sig", newline="") as file:
        for row_number, row in enumerate(csv.DictReader(file), start=2):
            source_tag_id = row["tag_id"].strip()
            target_tag_id = TARGET_TAG_MAP.get(source_tag_id, "")
            job, match_status, match_note = find_job(row["job_name"].strip(), jobs, by_name, by_normalized)
            tag_status = "mapped" if target_tag_id else "needs_new_tag"

            review = {
                "row_number": row_number,
                "source_tag_id": source_tag_id,
                "source_tag_label": SOURCE_TAGS.get(source_tag_id, ""),
                "target_tag_id": target_tag_id,
                "target_tag_label": TARGET_TAG_LABELS.get(target_tag_id, ""),
                "original_job_name": row["job_name"].strip(),
                "job_id": job["job_id"] if job else "",
                "official_job_name": job["job_name"] if job else "",
                "weight": row["weight"].strip(),
                "reason": row["reason"].strip(),
                "route_type": row["route_type"].strip(),
                "tag_status": tag_status,
                "job_match_status": match_status,
                "review_status": "ready" if tag_status == "mapped" and match_status in {"exact", "mapped", "normalized"} else "review",
                "note": match_note,
            }
            review_rows.append(review)

            if review["review_status"] == "ready":
                ready_rows.append({
                    "tag_id": target_tag_id,
                    "job_id": review["job_id"],
                    "job_name": review["official_job_name"],
                    "weight": review["weight"],
                    "reason": review["reason"],
                    "route_type": review["route_type"],
                })

            if tag_status == "needs_new_tag":
                new_tag_rows.append({
                    "source_tag_id": source_tag_id,
                    "source_tag_label": SOURCE_TAGS.get(source_tag_id, ""),
                    "suggested_action": "新しいタグとして追加するか、既存タグへ統合するか確認",
                })

    review_path = OUTPUT_DIR / "ai_tag_job_map_review.csv"
    ready_path = OUTPUT_DIR / "ai_tag_job_map_ready.csv"
    new_tags_path = OUTPUT_DIR / "ai_new_tag_candidates.csv"

    with review_path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(review_rows[0].keys()))
        writer.writeheader()
        writer.writerows(review_rows)

    deduped_ready = {}
    for row in ready_rows:
        key = (row["tag_id"], row["job_id"])
        if key not in deduped_ready or float(row["weight"]) > float(deduped_ready[key]["weight"]):
            deduped_ready[key] = row

    with ready_path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["tag_id", "job_id", "job_name", "weight", "reason", "route_type"])
        writer.writeheader()
        writer.writerows(deduped_ready.values())

    unique_new_tags = {}
    for row in new_tag_rows:
        unique_new_tags[row["source_tag_id"]] = row
    with new_tags_path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=["source_tag_id", "source_tag_label", "suggested_action"])
        writer.writeheader()
        writer.writerows(unique_new_tags.values())

    print(f"review_rows={len(review_rows)}")
    print(f"ready_rows={len(deduped_ready)}")
    print(f"new_tag_candidates={len(unique_new_tags)}")
    print(review_path)
    print(ready_path)
    print(new_tags_path)


if __name__ == "__main__":
    main()
