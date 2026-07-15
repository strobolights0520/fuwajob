# Data Dictionary

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
