# やりたいことマッピング Prototype

学生の「なんとなくやってみたいこと」から、関連しそうな職業候補を広げて見せるプロトタイプです。

## 内容

- フロントエンドの静的プロトタイプ
- タグ、表記ゆれ、職業マッピングの軽量データ
- job tag由来の職業リファレンス軽量版
- 別AIで生成した候補のレビュー用データ

## 起動方法

Node.js がある環境で以下を実行します。

```bash
npm start
```

ブラウザで `http://127.0.0.1:4180/` を開いてください。

ポートを変えたい場合:

```bash
PORT=4181 npm start
```

## 主要ファイル

- `index.html`: 画面構造
- `styles.css`: デザイン
- `app.js`: プロトタイプのロジック
- `server.mjs`: ローカル確認用サーバー
- `github-data/`: GitHub公開・共有向けに整理したデータ

## データ

GitHubで主に見るべきデータは `github-data/` にあります。

- `github-data/data/csv/tags.csv`
- `github-data/data/csv/tag_synonyms.csv`
- `github-data/data/csv/tag_job_map.csv`
- `github-data/data/csv/student_actions.csv`
- `github-data/data/csv/job_reference.csv`

同じ内容を `github-data/data/json/` にJSON形式でも置いています。

## 出典

職業リファレンスは、厚生労働省 職業情報提供サイト（日本版O-NET）job tag のダウンロードデータを加工して作成しています。

公開時は、サービス画面またはREADMEに以下の出典表記を残してください。

> 職業情報の一部は、厚生労働省 職業情報提供サイト（日本版O-NET）job tag のダウンロードデータを加工して作成しています。

## 注意

`tag_job_map.csv` の候補はまだ `draft` 扱いです。サービスに本採用する前に、人間が確認した行を `approved` にしてください。
