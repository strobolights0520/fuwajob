const { callOpenAIJson, readJson, sendJson } = require("./_openai");

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "verbs", "nouns", "values", "ambiguities", "question"],
  properties: {
    summary: { type: "string" },
    verbs: {
      type: "array",
      items: { type: "string" },
    },
    nouns: {
      type: "array",
      items: { type: "string" },
    },
    values: {
      type: "array",
      items: { type: "string" },
    },
    ambiguities: {
      type: "array",
      items: { type: "string" },
    },
    question: {
      type: "object",
      additionalProperties: false,
      required: ["title", "body", "choices"],
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        choices: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "label", "meaning"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              meaning: { type: "string" },
            },
          },
        },
      },
    },
  },
};

const instructions = `
あなたは高校生・大学生向けの進路探索サービスのAIです。
目的は、学生のふわっとした言葉を、探索できる言葉に変換することです。

厳守:
- 職業診断をしない。「向いている」と断定しない。
- 最初から固定の業界一覧に押し込めない。
- 入力に名詞や領域がある場合は、それを尊重する。
- 深掘り質問は、その学生の入力に合わせて生成する。
- 質問は1問だけ。選択肢は3〜6個。
- 個人情報、病歴、家庭情報などを聞かない。
- 日本語で、学生が読める自然な言葉にする。
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });

  try {
    const body = await readJson(req);
    const input = String(body.input || "").trim();
    if (!input) return sendJson(res, 400, { error: "input_required" });

    const result = await callOpenAIJson({
      schemaName: "career_interpretation",
      schema,
      instructions,
      input: `学生の入力: ${input}`,
      maxOutputTokens: 1600,
    });

    sendJson(res, 200, result);
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, {
      error: error.message || "interpret_failed",
      detail: error.details || null,
    });
  }
};
