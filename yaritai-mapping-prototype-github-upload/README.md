# やりたいことマッピング Prototype

学生の「なんとなくやってみたいこと」から、生成AIが入力文を分解し、学生ごとの深掘り質問と探索地図を生成するプロトタイプです。

## 内容

- フロントエンドの静的プロトタイプ
- OpenAI APIを使った「入力解釈 → 深掘り質問 → 探索地図生成」の体験
- Vercel Serverless FunctionsによるAPI連携
- Google Sheetsへの利用ログ送信
- タグ、表記ゆれ、職業マッピングの軽量データ
- job tag由来の職業リファレンス軽量版
- 別AIで生成した候補のレビュー用データ

## 起動方法

Node.js がある環境で以下を実行します。

```bash
npm start
```

ブラウザで `http://127.0.0.1:4180/` を開いてください。

生成AIを動かすには環境変数が必要です。

```bash
OPENAI_API_KEY=sk-... npm start
```

任意でモデルも指定できます。

```bash
OPENAI_MODEL=gpt-4.1-mini OPENAI_API_KEY=sk-... npm start
```

ポートを変えたい場合:

```bash
PORT=4181 npm start
```

## 主要ファイル

- `index.html`: 画面構造
- `styles.css`: デザイン
- `app.js`: プロトタイプのロジック
- `api/interpret.js`: 入力文を動詞・名詞・価値観に分解し、深掘り質問を生成
- `api/explore.js`: 深掘り回答を踏まえて探索地図を生成
- `api/log.js`: 入力文とAI結果の利用ログをGoogle Sheets webhookへ送信
- `api/_openai.js`: OpenAI Responses APIとの接続
- `server.mjs`: ローカル確認用サーバー
- `scripts/google-apps-script-usage-logs.js`: Google Sheets側に貼り付けるApps Script
- `github-data/`: GitHub公開・共有向けに整理したデータ

## データ

GitHubで主に見るべきデータは `github-data/` にあります。

- `github-data/data/csv/tags.csv`
- `github-data/data/csv/tag_synonyms.csv`
- `github-data/data/csv/tag_job_map.csv`
- `github-data/data/csv/student_actions.csv`
- `github-data/data/csv/job_reference.csv`

同じ内容を `github-data/data/json/` にJSON形式でも置いています。

## 生成AI前提の設計

このプロトタイプは、職種DB検索ではなく生成AIによる探索地図生成を中心にしています。

生成AIが担当すること:

- 学生の自由入力を動詞・名詞・価値観・曖昧な点に分解
- その学生に合わせた深掘り質問を1問だけ生成
- 回答を踏まえて、近い道・広がる道・業界・職種例・今できる行動を生成

DBや職業リファレンスは、本番では実在性確認・資格確認・出典管理の補助として使う想定です。

重要な方針は、入力から領域が読み取れた場合に業界一覧を聞き直さないことです。たとえば「ヒット音楽を作りたい」は音楽・音声領域として扱い、次は音楽内での関わり方を質問します。

## Vercel設定

Vercelで本物の生成AIを動かすには、Project Settings の Environment Variables に以下を追加してください。

```text
OPENAI_API_KEY=自分のOpenAI APIキー
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_MODEL` は省略可能です。

Google Sheetsへ利用ログを記録する場合は、追加で以下を設定してください。

```text
GOOGLE_SHEET_WEBHOOK_URL=Apps ScriptのWebアプリURL
LOG_WEBHOOK_TOKEN=任意の共有トークン
```

`LOG_WEBHOOK_TOKEN` は省略可能ですが、設定する方が安全です。設定手順は `docs/google_sheets_logging_setup.md` を見てください。

## 出典

職業リファレンスは、厚生労働省 職業情報提供サイト（日本版O-NET）job tag のダウンロードデータを加工して作成しています。

公開時は、サービス画面またはREADMEに以下の出典表記を残してください。

> 職業情報の一部は、厚生労働省 職業情報提供サイト（日本版O-NET）job tag のダウンロードデータを加工して作成しています。

## 注意

`tag_job_map.csv` の候補はまだ `draft` 扱いです。サービスに本採用する前に、人間が確認した行を `approved` にしてください。
