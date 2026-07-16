const { callOpenAIJson, readJson, sendJson } = require("./_openai");

const pathSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "industries", "occupations", "why", "first_actions", "keywords", "confidence"],
  properties: {
    title: { type: "string" },
    industries: {
      type: "array",
      items: { type: "string" },
    },
    occupations: {
      type: "array",
      items: { type: "string" },
    },
    why: { type: "string" },
    first_actions: {
      type: "array",
      items: { type: "string" },
    },
    keywords: {
      type: "array",
      items: { type: "string" },
    },
    confidence: {
      type: "string",
      enum: ["高", "中", "低"],
    },
  },
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "reading", "near_paths", "wide_paths", "industries", "note"],
  properties: {
    headline: { type: "string" },
    reading: { type: "string" },
    near_paths: {
      type: "array",
      items: pathSchema,
    },
    wide_paths: {
      type: "array",
      items: pathSchema,
    },
    industries: {
      type: "array",
      items: { type: "string" },
    },
    note: { type: "string" },
  },
};

const instructions = `
あなたは高校生・大学生向けの進路探索サービスのAIです。
入力と深掘り回答から、職種DBに縛られない探索地図を生成してください。

厳守:
- 「向いている」と断定しない。
- 実在しそうな職種・業界名を中心にするが、DBの候補に閉じない。
- 近い道と、視野を広げる道を分ける。
- 業界、職種例、今からできる経験、調べるキーワードを必ず出す。
- 医療・法律・資格職などは必要資格がある可能性に触れる。
- 日本語で、学生にもわかる表現にする。
- 不確実な部分は「可能性」「入口」として表現する。
`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });

  try {
    const body = await readJson(req);
    const input = String(body.input || "").trim();
    const answer = body.answer || null;
    const interpretation = body.interpretation || null;
    if (!input || !answer || !interpretation) return sendJson(res, 400, { error: "input_interpretation_answer_required" });

    const result = await callOpenAIJson({
      schemaName: "career_exploration_map",
      schema,
      instructions,
      input: JSON.stringify({ student_input: input, interpretation, selected_answer: answer }, null, 2),
      maxOutputTokens: 3200,
    });

    sendJson(res, 200, result);
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, {
      error: error.message || "explore_failed",
      detail: error.details || null,
    });
  }
};
