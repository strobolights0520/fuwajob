const { callOpenAIJson, readJson, sendJson } = require("./_openai");
const { checkRateLimit, readInt, sendRateLimited } = require("./_rate-limit");

const pathSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "industries",
    "occupations",
    "why",
    "industry_intro",
    "career_steps",
    "first_actions",
    "keywords",
    "references",
    "confidence",
  ],
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
    industry_intro: { type: "string" },
    career_steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["step", "title", "description"],
        properties: {
          step: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    first_actions: {
      type: "array",
      items: { type: "string" },
    },
    keywords: {
      type: "array",
      items: { type: "string" },
    },
    references: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "type", "query", "note"],
        properties: {
          label: { type: "string" },
          type: {
            type: "string",
            enum: ["企業検索", "採用検索", "インタビュー検索", "職種紹介検索", "参考検索"],
          },
          query: { type: "string" },
          note: { type: "string" },
        },
      },
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
- titleは必ず職種名にする。「業界名 / 会社名」ではなく「テレビ番組ディレクター」「音楽プロデューサー」のように書く。
- 業界はindustry_introで「この職種がある業界は...」という自然な説明文にし、industriesにも短い業界名を入れる。
- career_stepsには、その職種に近づくための現実的な歩み方を4段階で書く。例:「まずは法人営業で顧客理解と提案力を鍛える」。
- referencesには、その職種が存在する企業、採用情報、職種紹介、インタビューなどを探すための検索テーマを3件入れる。URLは作らず、queryにGoogle検索向けの日本語キーワードを書く。
- confidenceは入力と回答にかなり近い職種を「高」、関連があるが少し広げた職種を「中」、かなり遠いが入口としてあり得る職種を「低」にする。near_pathsは原則「高」または「中」、wide_pathsは原則「中」または「低」にする。
- 業界、職種例、今からできる経験、調べるキーワードを必ず出す。
- 医療・法律・資格職などは必要資格がある可能性に触れる。
- 日本語で、学生にもわかる表現にする。
- 不確実な部分は「可能性」「入口」として表現する。
- referencesはAIが提示する調査の入口であり、実在URLではなく検索キーワードとして扱われる前提で選ぶ。
`;

function countsForMode(mode) {
  if (mode === "more") return { near: 2, wide: 1, tokenBudget: 6500 };
  return { near: 1, wide: 1, tokenBudget: 5000 };
}

function instructionsForMode(mode, counts) {
  const countInstruction = mode === "more"
    ? `- 追加表示用です。near_pathsは必ず${counts.near}件、wide_pathsは必ず${counts.wide}件、合計3件だけ出す。`
    : `- 初回表示用です。near_pathsは必ず${counts.near}件、wide_pathsは必ず${counts.wide}件、合計2件だけ出す。`;
  const duplicateInstruction = mode === "more"
    ? "- existing_titlesに含まれる職種名と同じ、またはほぼ同じ職種は絶対に出さない。"
    : "";

  return `${instructions}

今回の出力条件:
${countInstruction}
${duplicateInstruction}
- 件数を増やさず、指定件数を守る。
- それぞれの候補は、詳細画面でそのまま使える密度で書く。`;
}

function hasExpectedPaths(result, counts) {
  return Array.isArray(result?.near_paths) && result.near_paths.length >= counts.near
    && Array.isArray(result?.wide_paths) && result.wide_paths.length >= counts.wide;
}

function trimPaths(result, counts) {
  return {
    ...result,
    near_paths: Array.isArray(result.near_paths) ? result.near_paths.slice(0, counts.near) : [],
    wide_paths: Array.isArray(result.wide_paths) ? result.wide_paths.slice(0, counts.wide) : [],
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "method_not_allowed" });

  const rateLimit = checkRateLimit(req, {
    scope: "explore",
    limit: readInt(process.env.EXPLORE_RATE_LIMIT, 8),
    windowMs: readInt(process.env.RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000),
  });
  if (!rateLimit.ok) return sendRateLimited(res, sendJson, rateLimit);

  try {
    const body = await readJson(req);
    const input = String(body.input || "").trim();
    const answer = body.answer || null;
    const interpretation = body.interpretation || null;
    const mode = body.mode === "more" ? "more" : "initial";
    const existingTitles = Array.isArray(body.existing_paths)
      ? body.existing_paths.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    if (!input || !answer || !interpretation) return sendJson(res, 400, { error: "input_interpretation_answer_required" });

    const counts = countsForMode(mode);
    const modeInstructions = instructionsForMode(mode, counts);
    let result = await callOpenAIJson({
      schemaName: "career_exploration_map",
      schema,
      instructions: modeInstructions,
      input: JSON.stringify({ student_input: input, interpretation, selected_answer: answer, mode, existing_titles: existingTitles }, null, 2),
      maxOutputTokens: counts.tokenBudget,
    });

    if (!hasExpectedPaths(result, counts)) {
      result = await callOpenAIJson({
        schemaName: "career_exploration_map_repair",
        schema,
        instructions: `${modeInstructions}

追加の厳守:
- 前回の出力は件数不足です。near_pathsを必ず${counts.near}件、wide_pathsを必ず${counts.wide}件にしてください。
- 各候補のtitleは職種名にしてください。
- 既存候補と重複しない職種を補ってください。`,
        input: JSON.stringify({ student_input: input, interpretation, selected_answer: answer, mode, existing_titles: existingTitles, previous_result: result }, null, 2),
        maxOutputTokens: counts.tokenBudget,
      });
    }

    sendJson(res, 200, { ...trimPaths(result, counts), mode });
  } catch (error) {
    const status = error.statusCode || 500;
    sendJson(res, status, {
      error: error.message || "explore_failed",
      detail: error.details || null,
    });
  }
};
