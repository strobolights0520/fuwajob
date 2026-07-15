# タグ辞書SSテンプレート

空のGoogleスプレッドシートを用意する場合は、以下の5シートを作る。

## 1. tags

| tag_id | axis | label | description | is_active | owner | memo |
|---|---|---|---|---|---|---|
| A001 | action | 企画する | 企画・構想・プロデュースしたい | TRUE |  |  |
| D001 | domain | 笑い・エンタメ | お笑い、番組、ライブ、配信など | TRUE |  |  |
| S001 | style | 表に立つ | 出演・発信など自分が前面に出る | TRUE |  |  |

## 2. tag_synonyms

| synonym_id | tag_id | surface | normalized_surface | source | is_active | memo |
|---|---|---|---|---|---|---|
| SYN000001 | A001 | プロデュース | プロデュース | manual | TRUE |  |
| SYN000002 | D001 | お笑い | お笑い | manual | TRUE |  |

## 3. tag_job_map

| tag_id | job_id | job_name | weight | source | review_status | reviewed_by | notes |
|---|---|---|---:|---|---|---|---|
| A001 | JT0001 |  | 0.80 | manual | draft |  |  |
| D001 | JT0001 |  | 0.90 | manual | draft |  |  |

## 4. student_actions

| action_id | job_id | job_name | category | action_text | priority | source | memo |
|---|---|---|---|---|---:|---|---|
| SA000001 | JT0001 |  | production | 短い動画や記事を作って公開する | 10 | manual |  |

## 5. review_log

| reviewed_at | reviewer | sheet_name | target_id | decision | comment |
|---|---|---|---|---|---|
| 2026-07-15 |  | tag_job_map | A001/JT0001 | approved |  |

## 入力ルール

- `axis` は `action`, `domain`, `style` のみ。
- `source` は `manual`, `log_mined`, `llm_draft`, `rule` のいずれか。
- `weight` は `0.00` から `1.00`。
- `review_status` は `draft`, `approved`, `rejected`。
- `normalized_surface` は後でスクリプト生成してもよいが、SS運用初期は手入力でも可。
- 本番反映は `review_status = approved` の行だけに限定する。
