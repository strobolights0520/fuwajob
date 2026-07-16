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
    ...buildSignals().slice(0, 8),
    ...(state.selectedAnswer ? [["回答", state.selectedAnswer.label]] : []),
    ...state.exploration.industries.slice(0, 4).map((industry) => ["業界", industry]),
  ];
  $("tagRow").innerHTML = signals.map(([kind, label]) => `<span class="tag">${escapeHtml(kind)}: ${escapeHtml(label)}</span>`).join("");

  $("classicJobs").innerHTML = state.exploration.near_paths.map((path) => pathCard(path, "近い道")).join("");
  $("surpriseJobs").innerHTML = state.exploration.wide_paths.map((path) => pathCard(path, "広がる道")).join("");
}

function pathCard(path, label) {
  const industries = path.industries.map((industry) => `<span class="industry-chip">${escapeHtml(industry)}</span>`).join("");
  const careerPreview = path.career_steps?.[0]?.description || path.first_actions?.[0] || "まずは関連する仕事や企業を調べ、近い経験を小さく試してみましょう。";
  return `
    <article class="job-card" data-path-title="${escapeAttr(path.title)}">
      <div><span class="route-badge">${escapeHtml(label)} / 確度 ${escapeHtml(path.confidence)}</span></div>
      <h4>${escapeHtml(path.title)}</h4>
      <p>${escapeHtml(path.why)}</p>
      <p class="job-reason">${escapeHtml(path.industry_intro || "この職種がある業界を見てみましょう。")}</p>
      <div class="industry-row" aria-label="関係する業界">${industries}</div>
      <p class="career-preview">歩み方の例: ${escapeHtml(careerPreview)}</p>
      <div class="card-footer">
        <span class="score">探索候補</span>
        <span class="card-link">詳しく見る →</span>
      </div>
    </article>
  `;
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
  showToast(`AI接続でエラーが起きました: ${error.message}`);
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function renderReferences(references = []) {
  if (!references.length) {
    return `<p class="reference-empty">参考リンクは生成されませんでした。職種名と業界名で検索してみてください。</p>`;
  }

  return references
    .slice(0, 5)
    .map((item) => {
      const type = escapeHtml(item.type || "参考");
      const label = escapeHtml(item.label || item.url || "参考リンク");
      const note = escapeHtml(item.note || "");
      const url = String(item.url || "");
      const title = isSafeHttpUrl(url)
        ? `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : `<span>${label}</span>`;
      return `
        <article class="reference-item">
          <div>
            <span class="reference-type">${type}</span>
            <h4>${title}</h4>
          </div>
          <p>${note}</p>
        </article>
      `;
    })
    .join("");
}

function renderCareerSteps(steps = []) {
  if (!steps.length) {
    return `<li><strong>入口を探す</strong><span>近い業界の求人やインタビューを読み、必要な経験を調べてみましょう。</span></li>`;
  }

  return steps
    .map((item) => {
      const title = item.title || item.step || "次の一歩";
      return `<li><strong>${escapeHtml(title)}</strong><span>${escapeHtml(item.description || "")}</span></li>`;
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
  $("detailReferences").innerHTML = renderReferences(path.references);
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
  return `「${input}」から、ふわっとjobでキャリアの道を見てみた。`;
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
      if (lineCount >= maxLines - 1) break;
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
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#eef6ff");
  gradient.addColorStop(0.4, "#ecfbf7");
  gradient.addColorStop(0.75, "#fff3fb");
  gradient.addColorStop(1, "#fff8ef");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1350);

  context.fillStyle = "rgba(255,255,255,0.88)";
  drawRoundedRect(context, 76, 92, 928, 1166, 42);
  context.fill();

  context.font = "900 54px 'Noto Sans JP', sans-serif";
  context.fillStyle = "#111111";
  context.fillText("ふわっとjob", 122, 172);

  context.font = "700 28px 'Noto Sans JP', sans-serif";
  context.fillStyle = "#6b6b6b";
  context.fillText("入力したこと", 122, 270);

  context.font = "900 62px 'Noto Sans JP', sans-serif";
  context.fillStyle = "#111111";
  const input = state.input || $("queryInput").value.trim() || "ふわっとしたやりたいこと";
  const nextY = wrapCanvasText(context, `「${input}」`, 122, 350, 836, 82, 4);

  context.font = "700 30px 'Noto Sans JP', sans-serif";
  context.fillStyle = "#6b6b6b";
  context.fillText("AIが見つけた道の例", 122, nextY + 70);

  const paths = [...(state.exploration?.near_paths || []), ...(state.exploration?.wide_paths || [])]
    .slice(0, 4)
    .map((path) => path.title);
  const labels = paths.length ? paths : ["まずは入力して、キャリアの道を見てみよう"];

  let y = nextY + 128;
  context.font = "800 38px 'Noto Sans JP', sans-serif";
  labels.forEach((label, index) => {
    context.fillStyle = ["#2d5be3", "#4ab9ab", "#8b7ff5", "#111111"][index] || "#111111";
    context.fillText(`${index + 1}. ${label}`, 122, y);
    y += 66;
  });

  context.font = "700 28px 'Noto Sans JP', sans-serif";
  context.fillStyle = "#6b6b6b";
  wrapCanvasText(context, "これはAIが出した例です。気になった職種や企業は自分でも調べてみてください。", 122, 1084, 836, 44, 3);

  context.font = "900 34px 'Noto Sans JP', sans-serif";
  context.fillStyle = "#2d5be3";
  context.fillText("fuwajob.vercel.app", 122, 1212);

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
renderAll();
