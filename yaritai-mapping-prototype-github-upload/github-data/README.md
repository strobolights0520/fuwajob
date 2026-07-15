# やりたいことマッピング データパッケージ

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

