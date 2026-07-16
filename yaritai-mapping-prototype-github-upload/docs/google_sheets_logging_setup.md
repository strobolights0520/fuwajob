# Google Sheets Logging Setup

ユーザー入力とAI結果をGoogleスプレッドシートの `usage_logs` タブへ自動記録するための設定です。

## 1. Apps Scriptを作る

対象スプレッドシートを開きます。

https://docs.google.com/spreadsheets/d/1wUY9-2O1hCwPn5yNx3KatCwmeuj9M5JKfd6kgS0FBT0/edit

メニューから `拡張機能` → `Apps Script` を開き、`scripts/google-apps-script-usage-logs.js` の中身を貼り付けて保存します。

## 2. 任意のトークンを設定する

Apps Scriptの `プロジェクトの設定` → `スクリプト プロパティ` で以下を追加します。

```text
FUWAJOB_LOG_TOKEN=好きな長い文字列
```

この値はVercel側にも同じものを入れます。未設定でも動きますが、設定する方が安全です。

## 3. Webアプリとしてデプロイする

`デプロイ` → `新しいデプロイ` → 種類で `ウェブアプリ` を選びます。

- 実行するユーザー: 自分
- アクセスできるユーザー: 全員

デプロイ後に表示されるWebアプリURLをコピーします。

## 4. Vercelに環境変数を追加する

Vercelの Project Settings → Environment Variables に以下を追加します。

```text
GOOGLE_SHEET_WEBHOOK_URL=Apps ScriptのWebアプリURL
LOG_WEBHOOK_TOKEN=Apps Scriptに設定したFUWAJOB_LOG_TOKENと同じ文字列
```

`LOG_WEBHOOK_TOKEN` は任意です。Apps Script側でトークンを設定した場合だけ必要です。

## 5. 再デプロイする

環境変数を追加したら、Vercelで再デプロイします。

これで以下のタイミングで `usage_logs` に行が追加されます。

- `input_submitted`: 入力された直後
- `question_generated`: AIが深掘り質問を作った直後
- `exploration_completed`: 最終結果が生成された直後

個人名、メールアドレス、学校名などは取得しない設計にしています。
