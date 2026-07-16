const state = {
  input: "",
  interpretation: null,
  selectedAnswer: null,
  exploration: null,
  route: "未入力",
  activePath: null,
  isLoading: false,
  loadingMessage: "考えています…",
  bookmarks: readBookmarks(),
};

const $ = (id) => document.getElementById(id);

function readBookmarks() {
  try {
    return JSON.parse(sessionStorage.getItem("yaritai_ai_bookmarks") || "[]");
  } catch {
    return [];
  }
}

function writeBookmarks() {
  sessionStorage.setItem("yaritai_ai_bookmarks", JSON.stringify(state.bookmarks));
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
  $("bookmarkCountLabel").textContent = `${state.bookmarks.length}件`;
  $("costStatus").textContent = `保存 ${state.bookmarks.length}件`;
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
  if (lead) lead.textContent = state.exploration.reading;

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
  const occupations = path.occupations.slice(0, 3).map((job) => escapeHtml(job)).join(" / ");
  return `
    <article class="job-card" data-path-title="${escapeAttr(path.title)}">
      <div><span class="route-badge">${escapeHtml(label)} / 確度 ${escapeHtml(path.confidence)}</span></div>
      <h4>${escapeHtml(path.title)}</h4>
      <p>${escapeHtml(path.why)}</p>
      <p class="job-reason">職種例: ${occupations}</p>
      <div class="industry-row" aria-label="関係する業界">${industries}</div>
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

  try {
    state.interpretation = await postJson("/api/interpret", { input });
    state.route = "生成AI: 深掘り質問を生成";
    state.isLoading = false;
    renderAll();
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

function openDetail(title) {
  const allPaths = [...(state.exploration?.near_paths || []), ...(state.exploration?.wide_paths || [])];
  const path = allPaths.find((item) => item.title === title);
  if (!path) return;
  state.activePath = path;
  $("detailCategory").textContent = path.industries.join(" / ");
  $("detailTitle").textContent = path.title;
  $("detailDescription").textContent = path.why;
  $("detailSkills").innerHTML = path.keywords.map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join("");
  $("detailActions").innerHTML = path.first_actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("");
  $("bookmarkButton").textContent = state.bookmarks.some((item) => item.title === path.title) ? "保存済み" : "保存する";
  $("detailPanel").classList.add("open");
  $("detailPanel").setAttribute("aria-hidden", "false");
}

function closeDetail() {
  $("detailPanel").classList.remove("open");
  $("detailPanel").setAttribute("aria-hidden", "true");
  state.activePath = null;
}

function bookmarkActivePath() {
  if (!state.activePath) return;
  if (!state.bookmarks.some((item) => item.title === state.activePath.title)) {
    state.bookmarks.push({ title: state.activePath.title, savedAt: new Date().toISOString() });
    writeBookmarks();
    showToast("セッション内に保存しました");
  } else {
    showToast("すでに保存されています");
  }
  $("bookmarkButton").textContent = "保存済み";
  renderMetrics();
}

async function shareUrl() {
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    showToast("共有URLをコピーしました");
  } catch {
    showToast(url);
  }
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
  $("shareButton").addEventListener("click", shareUrl);
  $("closePanel").addEventListener("click", closeDetail);
  $("panelBackdrop").addEventListener("click", closeDetail);
  $("bookmarkButton").addEventListener("click", bookmarkActivePath);

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
