# job tag データ取り込みメモ

## 取得元

- ページ: https://shigoto.mhlw.go.jp/User/download
- 解説系CSV: `IPD_DL_description_7_01.csv`
- 数値系CSV: `IPD_DL_numeric_7_00.csv`
- 取得日: 2026-07-15

公式ページ上の出典表記例に従い、外部公開時はファイル名、バージョン番号、取得日、URLを残す。

## 生成物

`npm run import:jobtag` で以下を `data/processed/jobtag/` に生成する。

- `jobs.csv` / `jobs.json`: 職種マスタ
- `job_aliases.csv`: 別名
- `job_classifications.csv`: 厚労省編職業分類、日本標準職業分類
- `job_qualifications.csv`: 関連資格
- `job_skills.csv`: スキルスコア
- `job_knowledge.csv`: 知識スコア
- `job_tasks.csv`: タスク、実施率、重要度
- `prototype_jobs_sample.json`: プロトタイプ接続用の軽量サンプル
- `source_manifest.json`: 出典・バージョン情報
- `import_summary.json`: 取り込み件数

## DB投入順

1. `source_files`
2. `jobs`
3. `job_aliases`
4. `job_classifications`
5. `job_qualifications`
6. `job_skills`
7. `job_knowledge`
8. `job_tasks`

タグ辞書、類義語、タグ-職種マッピングは job tag 由来ではなくサービス独自データとして別途管理する。
