const state = {
  input: "",
  interpretation: null,
  selectedAnswer: null,
  exploration: null,
  route: "未入力",
  activePath: null,
  isLoading: false,
  loadingMessage: "考えています…",
  sessionId: readSessionId(),
};

const $ = (id) => document.getElementById(id);
const APP_VERSION = "2026-07-16-social-share-v1";

function readSessionId() {
  try {
    const stored = sessionStorage.getItem("fuwajob_session_id");
    if (stored) return stored;
    const generated = globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem("fuwajob_session_id", generated);
    return generated;
  } catch {
    return `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `request_failed_${response.status}`);
    error.statusCode = response.status;
    error.detail = data.detail;
    throw error;
  }
  return data;
}

async function fetchRecentInputs() {
  try {
    const response = await fetch("/api/recent-inputs", { method: "GET" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.items)) return [];
    return data.items;
  } catch {
    return [];
  }
}

function renderFloatingInputs(items = []) {
  const track = $("floatingInputTrack");
  if (!track) return;
  const cleanItems = items
    .map((item) => String(item || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 10);

  if (!cleanItems.length) {
    track.innerHTML = "";
    return;
  }

  const rows = cleanItems.map((label, index) => {
    const top = 8 + ((index * 17) % 74);
    const startX = -50 - ((index * 19) % 70);
    const duration = 32 + ((index * 5) % 18);
    const delay = -1 * ((index * 7) % 28);
    return `
      <span
        class="floating-input-item"
        style="--top: ${top}%; --start-x: ${startX}%; --duration: ${duration}s; --delay: ${delay}s;"
      >${escapeHtml(label)}</span>
    `;
  });

  track.innerHTML = rows.join("");
}

async function hydrateRecentInputs() {
  renderFloatingInputs(await fetchRecentInputs());
}

function summarizeChoices() {
  return state.interpretation?.question?.choices?.map((choice) => choice.label) || [];
}

function summarizePaths(paths = []) {
  return paths.map((path) => path.title);
}

function logUsage(eventType) {
  const payload = {
    event_type: eventType,
    session_id: state.sessionId,
    input_text: state.input,
    ai_summary: state.interpretation?.summary || "",
    verbs: state.interpretation?.verbs || [],
    nouns: state.interpretation?.nouns || [],
    values: state.interpretation?.values || [],
    question_title: state.interpretation?.question?.title || "",
    question_body: state.interpretation?.question?.body || "",
    question_choices: summarizeChoices(),
    selected_answer: state.selectedAnswer?.label || "",
    result_headline: state.exploration?.headline || "",
    near_paths: summarizePaths(state.exploration?.near_paths),
    wide_paths: summarizePaths(state.exploration?.wide_paths),
    industries: state.exploration?.industries || [],
    page_url: location.href,
    app_version: APP_VERSION,
  };

  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function buildSignals() {
  if (!state.interpretation) return [];
  return [
    ...state.interpretation.verbs.map((value) => ["動詞", value]),
    ...state.interpretation.nouns.map((value) => ["名詞", value]),
    ...state.interpretation.values.map((value) => ["価値観", value]),
  ];
}

function renderMetrics() {
  $("routeLabel").textContent = state.route;
  $("cacheLabel").textContent = state.interpretation ? "生成AI" : "待機中";
  $("tagCountLabel").textContent = `${buildSignals().length}件`;
  $("bookmarkCountLabel").textContent = state.exploration ? "結果あり" : "未生成";
}

function renderChips() {
  const chipsBand = $("chipsBand");
  if (!state.interpretation || state.exploration || state.isLoading) {
    chipsBand.classList.add("hidden");
    return;
  }

  const question = state.interpretation.question;
  $("chipsTitle").textContent = question.title;
  $("chipQuestion").textContent = question.body;
  $("chipHelper").textContent = state.interpretation.summary;
  $("chipHelper").classList.remove("hidden");
  $("chipList").innerHTML = question.choices
    .map((choice) => `<button type="button" class="choice-chip" data-choice-id="${escapeAttr(choice.id)}">${escapeHtml(choice.label)}</button>`)
    .join("");
  chipsBand.classList.remove("hidden");
}

function renderResults() {
  const shouldShow = Boolean(state.exploration) && !state.isLoading;
  $("resultsBand").classList.toggle("hidden", !shouldShow);
  $("emptyState").classList.toggle("hidden", shouldShow || Boolean(state.input));
  if (!shouldShow) return;

  $("resultsEyebrow").textContent = `「${state.input}」の探索地図`;
  $("resultsTitle").textContent = state.exploration.headline;
  const lead = $("resultsBand").querySelector(".section-heading p");
  if (lead) lead.textContent = `${state.exploration.reading} あくまでAIが出した例です。ご自身で調べてみてください。`;

  const signals = [
    ["動詞", state.interpretation?.verbs || []],
    ["名詞", state.interpretation?.nouns || []],
    ["価値観", state.interpretation?.values || []],
    ["回答", state.selectedAnswer ? [state.selectedAnswer.label] : []],
    ["業界", state.exploration.industries.slice(0, 4)],
  ];
  $("tagRow").innerHTML = signals
    .filter(([, values]) => values.length)
    .map(([kind, values]) => `
      <div class="tag-group">
        <span class="tag-label">${escapeHtml(kind)}</span>
        <div class="tag-list">${values.map((label) => `<span class="tag">${escapeHtml(label)}</span>`).join("")}</div>
      </div>
    `)
    .join("");

  $("classicJobs").innerHTML = state.exploration.near_paths.map((path) => pathCard(path, "近い道")).join("");
  $("surpriseJobs").innerHTML = state.exploration.wide_paths.map((path) => pathCard(path, "広がる道")).join("");
}

function pathCard(path, label) {
  const industries = path.industries.map((industry) => `<span class="industry-chip">${escapeHtml(industry)}</span>`).join("");
  const careerPreview = path.career_steps?.[0]?.description || path.first_actions?.[0] || "まずは関連する仕事や企業を調べ、近い経験を小さく試してみましょう。";
  const isClassic = label === "近い道";
  const confidence = path.confidence || (isClassic ? "高" : "中");
  return `
    <article class="job-card ${isClassic ? "classic-card" : "adjacent-card"}" data-path-title="${escapeAttr(path.title)}">
      <div class="confidence-row ${confidenceClass(confidence)}">
        <span class="confidence-dot" aria-hidden="true"></span>
        <span>${escapeHtml(label)} / 確度${escapeHtml(confidence)}</span>
      </div>
      <h4>${escapeHtml(path.title)}</h4>
      <p>${escapeHtml(path.why)}</p>
      <div class="job-reason">${escapeHtml(path.industry_intro || "この職種がある業界を見てみましょう。")}</div>
      <div class="industry-row" aria-label="関係する業界">${industries}</div>
      <p class="career-preview">歩み方の例: ${escapeHtml(careerPreview)}</p>
      <div class="card-footer">
        <span class="score">探索候補</span>
        <span class="card-link">詳しく見る →</span>
      </div>
    </article>
  `;
}

function confidenceClass(confidence) {
  if (confidence === "高") return "confidence-high";
  if (confidence === "中") return "confidence-medium";
  return "confidence-low";
}

function renderAll() {
  $("inputBand").classList.toggle("hidden", Boolean(state.input));
  $("loadingState").classList.toggle("hidden", !state.isLoading);
  const loadingText = $("loadingState").querySelector("p");
  if (loadingText) loadingText.textContent = state.loadingMessage;
  renderMetrics();
  renderChips();
  renderResults();
}

async function runQuery(value) {
  const input = value.trim();
  if (!input) {
    showToast("やってみたいことを少しだけ入力してください");
    return;
  }

  state.input = input;
  state.interpretation = null;
  state.selectedAnswer = null;
  state.exploration = null;
  state.activePath = null;
  state.route = "生成AI: 入力を分解中";
  state.isLoading = true;
  state.loadingMessage = "言葉を分解しています…";
  updateHash();
  renderAll();
  logUsage("input_submitted");

  try {
    state.interpretation = await postJson("/api/interpret", { input });
    state.route = "生成AI: 深掘り質問を生成";
    state.isLoading = false;
    renderAll();
    logUsage("question_generated");
  } catch (error) {
    state.isLoading = false;
    state.route = "AI接続エラー";
    renderAll();
    showApiError(error);
  }
}

async function chooseAnswer(choiceId) {
  const choice = state.interpretation?.question?.choices?.find((item) => item.id === choiceId);
  if (!choice) return;

  state.selectedAnswer = choice;
  state.route = "生成AI: 探索地図を生成中";
  state.isLoading = true;
  state.loadingMessage = "探索地図を作っています…";
  updateHash();
  renderAll();

  try {
    state.exploration = await postJson("/api/explore", {
      input: state.input,
      interpretation: state.interpretation,
      answer: choice,
    });
    state.route = "生成AI: 探索地図";
    state.isLoading = false;
    renderAll();
    logUsage("exploration_completed");
  } catch (error) {
    state.isLoading = false;
    state.route = "AI接続エラー";
    renderAll();
    showApiError(error);
  }
}

function showApiError(error) {
  if (error.message === "missing_openai_api_key") {
    showToast("Vercelの環境変数 OPENAI_API_KEY が未設定です");
    return;
  }
  if (error.message === "rate_limited" || error.statusCode === 429) {
    showToast("アクセスが集中しています。少し時間をおいてからもう一度お試しください");
    return;
  }
  showToast(`AI接続でエラーが起きました: ${error.message}`);
}

function googleSearchUrl(query) {
  const params = new URLSearchParams({ q: query });
  return `https://www.google.com/search?${params.toString()}`;
}

function searchQueryForReference(path, item) {
  const industry = path.industries?.[0] || "";
  const label = item.label || "";
  const query = item.query || "";
  const type = item.type || "";
  return [query, path.title, industry, label, type].filter(Boolean).join(" ");
}

function fallbackReferences(path) {
  const title = path.title || "職種";
  const industry = path.industries?.[0] || "";
  return [
    { label: `${title}の仕事内容を調べる`, type: "職種紹介検索", query: `${title} 仕事内容 ${industry}`, note: "仕事内容や必要な経験を調べる入口です。" },
    { label: `${title}の採用情報を調べる`, type: "採用検索", query: `${title} 採用 新卒 中途 ${industry}`, note: "実際に募集している企業や条件を調べる入口です。" },
    { label: `${title}のインタビューを読む`, type: "インタビュー検索", query: `${title} インタビュー キャリア ${industry}`, note: "働いている人の話を探す入口です。" },
  ];
}

function renderReferences(path) {
  const references = path.references?.length ? path.references : fallbackReferences(path);
  if (!references.length) {
    return `<p class="reference-empty">職種名と業界名で検索してみてください。</p>`;
  }

  return references
    .slice(0, 3)
    .map((item) => {
      const type = escapeHtml(item.type || "検索");
      const label = escapeHtml(item.label || "Googleで検索する");
      const note = escapeHtml(item.note || "");
      const url = googleSearchUrl(searchQueryForReference(path, item));
      return `
        <article class="reference-item">
          <div>
            <span class="reference-type">${type}</span>
            <h4><a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${label}</a></h4>
          </div>
          <p>${note}</p>
        </article>
      `;
    })
    .join("");
}

function renderCareerSteps(steps = []) {
  if (!steps.length) {
    return `<li><span class="step-badge">1</span><div><strong>入口を探す</strong><span>近い業界の求人やインタビューを読み、必要な経験を調べてみましょう。</span></div></li>`;
  }

  return steps
    .map((item, index) => {
      const title = item.title || item.step || "次の一歩";
      return `<li><span class="step-badge">${index + 1}</span><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(item.description || "")}</span></div></li>`;
    })
    .join("");
}

function openDetail(title) {
  const allPaths = [...(state.exploration?.near_paths || []), ...(state.exploration?.wide_paths || [])];
  const path = allPaths.find((item) => item.title === title);
  if (!path) return;
  state.activePath = path;
  $("detailCategory").textContent = "職種詳細";
  $("detailTitle").textContent = path.title;
  $("detailDescription").textContent = path.why;
  $("detailIndustryIntro").textContent = path.industry_intro || "この職種がある業界を確認して、企業や働き方を調べてみましょう。";
  $("detailIndustries").innerHTML = path.industries.map((industry) => `<span class="tag">${escapeHtml(industry)}</span>`).join("");
  $("detailCareerSteps").innerHTML = renderCareerSteps(path.career_steps);
  $("detailSkills").innerHTML = path.keywords.map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join("");
  $("detailActions").innerHTML = path.first_actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("");
  $("detailReferences").innerHTML = renderReferences(path);
  $("detailPanel").classList.add("open");
  $("detailPanel").setAttribute("aria-hidden", "false");
}

function closeDetail() {
  $("detailPanel").classList.remove("open");
  $("detailPanel").setAttribute("aria-hidden", "true");
  state.activePath = null;
}

function shareText() {
  const input = state.input || $("queryInput").value.trim() || "ふわっとしたやりたいこと";
  return `ふわっとjob｜「${input}」に該当する職種を見てみた。なんとなくふわっとした仕事のイメージを入力すると、それに該当する職種を例示します。`;
}

function ensureShareTarget() {
  if (state.input || $("queryInput").value.trim()) return true;
  showToast("まずはやってみたいことを入力してください");
  return false;
}

function shareToX() {
  if (!ensureShareTarget()) return;
  const params = new URLSearchParams({
    text: shareText(),
    url: location.href,
  });
  window.open(`https://twitter.com/intent/tweet?${params.toString()}`, "_blank", "noopener,noreferrer");
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = Array.from(text);
  let line = "";
  let lineCount = 0;
  for (const char of chars) {
    const testLine = line + char;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      line = char;
      lineCount += 1;
      if (lineCount >= maxLines - 1) {
        while (context.measureText(`${line}…`).width > maxWidth && line.length > 0) {
          line = Array.from(line).slice(0, -1).join("");
        }
        line = `${line}…`;
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (lineCount < maxLines) context.fillText(line, x, y);
  return y + lineHeight;
}

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.92));
}

async function createShareImageBlob() {
  const scale = 1080 / 340;
  const unit = (value) => value * scale;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.shadowColor = "rgba(0,0,0,0.1)";
  context.shadowBlur = unit(30);
  context.shadowOffsetY = unit(8);
  context.fillStyle = "rgba(0,0,0,0.08)";
  drawRoundedRect(context, 0, 0, canvas.width, canvas.height, unit(28));
  context.fill();
  context.restore();

  drawRoundedRect(context, 0, 0, canvas.width, canvas.height, unit(28));
  context.clip();

  const gradient = context.createLinearGradient(unit(280), 0, unit(30), canvas.height);
  gradient.addColorStop(0, "#8B7FF5");
  gradient.addColorStop(0.35, "#6FA8F0");
  gradient.addColorStop(0.65, "#5CE0C6");
  gradient.addColorStop(1, "#F0A8E8");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1350);

  const left = unit(28);
  const top = unit(32);
  const contentWidth = unit(284);

  context.font = `900 ${unit(22)}px 'Noto Sans JP', sans-serif`;
  context.fillStyle = "#ffffff";
  context.fillText("ふわっとjob", left, top + unit(22));

  context.font = `700 ${unit(12)}px 'Noto Sans JP', sans-serif`;
  context.fillStyle = "rgba(255,255,255,0.85)";
  context.fillText("ふわっとした、なりたい姿", left, top + unit(66));

  context.font = `900 ${unit(19)}px 'Noto Sans JP', sans-serif`;
  context.fillStyle = "#ffffff";
  const input = state.input || $("queryInput").value.trim() || "ふわっとしたやりたいこと";
  const afterInputY = wrapCanvasText(context, `「${input}」`, left, top + unit(95), contentWidth, unit(28.5), 3);

  const paths = [...(state.exploration?.near_paths || []), ...(state.exploration?.wide_paths || [])]
    .slice(0, 3)
    .map((path) => path.title);
  const labels = paths.length ? paths : ["まずは入力して、キャリアの道を見てみよう"];

  const panelX = left;
  const panelY = Math.min(afterInputY + unit(16), unit(212));
  const panelWidth = unit(284);
  const panelHeight = unit(78 + labels.length * 24);
  context.fillStyle = "rgba(255,255,255,0.92)";
  drawRoundedRect(context, panelX, panelY, panelWidth, panelHeight, unit(16));
  context.fill();

  context.font = `700 ${unit(11)}px 'Noto Sans JP', sans-serif`;
  context.fillStyle = "#9a9a9a";
  context.fillText("例えばこんなん出ました", panelX + unit(20), panelY + unit(32));

  context.font = `700 ${unit(14)}px 'Noto Sans JP', sans-serif`;
  context.fillStyle = "#2a2a2a";
  let y = panelY + unit(62);
  labels.forEach((label, index) => {
    const text = `${index + 1}. ${label}`;
    wrapCanvasText(context, text, panelX + unit(20), y, panelWidth - unit(40), unit(21), 1);
    y += unit(25);
  });

  context.font = `500 ${unit(11)}px 'Noto Sans JP', sans-serif`;
  context.fillStyle = "rgba(255,255,255,0.8)";
  wrapCanvasText(context, "AIが出した例です。自分でも調べてみてください。", left, unit(369), unit(200), unit(17.6), 2);

  context.font = `700 ${unit(13)}px 'Noto Sans JP', sans-serif`;
  context.fillStyle = "#ffffff";
  context.textAlign = "right";
  context.fillText("fuwajob.vercel.app", unit(312), unit(386));
  context.textAlign = "left";

  return canvasToBlob(canvas);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function shareImage() {
  if (!ensureShareTarget()) return;
  const blob = await createShareImageBlob();
  if (!blob) {
    showToast("シェア画像を作れませんでした");
    return;
  }
  const file = new File([blob], "fuwajob-share.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: "ふわっとjob", text: shareText() });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  downloadBlob(blob, "fuwajob-share.png");
  showToast("画像を保存しました。Instagramなどに投稿できます");
}

function reset() {
  state.input = "";
  state.interpretation = null;
  state.selectedAnswer = null;
  state.exploration = null;
  state.route = "未入力";
  state.isLoading = false;
  $("queryInput").value = "";
  history.replaceState(null, "", location.pathname);
  renderAll();
}

function returnToTop() {
  reset();
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function updateHash() {
  const params = new URLSearchParams();
  if (state.input) params.set("q", state.input);
  if (state.selectedAnswer) params.set("answer", state.selectedAnswer.id);
  history.replaceState(null, "", params.toString() ? `#${params.toString()}` : location.pathname);
}

function hydrateFromHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const query = params.get("q");
  if (!query) return;
  $("queryInput").value = query;
  runQuery(query);
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => $("toast").classList.remove("show"), 3600);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function bindEvents() {
  $("queryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    runQuery($("queryInput").value);
  });

  $("queryInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      runQuery($("queryInput").value);
    }
  });

  $("resetButton").addEventListener("click", reset);
  $("brandHomeButton").addEventListener("click", returnToTop);
  $("backTopButton").addEventListener("click", returnToTop);
  $("headerShareButton").addEventListener("click", shareImage);
  $("xShareButton").addEventListener("click", shareToX);
  $("imageShareButton").addEventListener("click", shareImage);
  $("closePanel").addEventListener("click", closeDetail);
  $("panelBackdrop").addEventListener("click", closeDetail);

  document.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-choice-id]");
    if (choice) chooseAnswer(choice.dataset.choiceId);

    const path = event.target.closest("[data-path-title]");
    if (path) openDetail(path.dataset.pathTitle);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetail();
  });
}

bindEvents();
hydrateFromHash();
hydrateRecentInputs();
renderAll();
