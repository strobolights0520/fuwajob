const tags = [
  { id: "A001", axis: "action", label: "企画する", synonyms: ["企画", "考える", "プロデュース", "立ち上げ", "プラン"] },
  { id: "A002", axis: "action", label: "作る・制作する", synonyms: ["作り", "つくり", "制作", "開発", "デザイン", "番組を作"] },
  { id: "A003", axis: "action", label: "演じる・表現する", synonyms: ["出演", "演じ", "表現", "出たい", "舞台", "表に立"] },
  { id: "A004", axis: "action", label: "支える・サポートする", synonyms: ["支え", "サポート", "裏方", "助け", "伴走"] },
  { id: "A005", axis: "action", label: "売る・広める", synonyms: ["広め", "売る", "届け", "宣伝", "マーケ", "流行らせ"] },
  { id: "A006", axis: "action", label: "分析する", synonyms: ["分析", "調べ", "研究", "データ", "検証"] },
  { id: "A007", axis: "action", label: "教える・育てる", synonyms: ["教え", "育て", "教育", "学び", "伝え"] },
  { id: "A008", axis: "action", label: "運営する・仕切る", synonyms: ["運営", "仕切", "まとめ", "マネジメント", "進行"] },
  { id: "D001", axis: "domain", label: "笑い・エンタメ", synonyms: ["お笑い", "笑い", "芸人", "バラエティ", "エンタメ"] },
  { id: "D002", axis: "domain", label: "映像・放送", synonyms: ["番組", "テレビ", "映像", "放送", "映画", "動画"] },
  { id: "D003", axis: "domain", label: "都市・まちづくり", synonyms: ["都市", "まち", "街", "地域", "再開発", "建築"] },
  { id: "D004", axis: "domain", label: "食", synonyms: ["食", "料理", "カフェ", "レストラン", "食品"] },
  { id: "D005", axis: "domain", label: "スポーツ", synonyms: ["スポーツ", "試合", "チーム", "アスリート"] },
  { id: "D006", axis: "domain", label: "教育・学び", synonyms: ["教育", "学校", "塾", "学び", "子ども"] },
  { id: "D007", axis: "domain", label: "テクノロジー", synonyms: ["アプリ", "AI", "IT", "テック", "プログラミング"] },
  { id: "D008", axis: "domain", label: "環境・サステナビリティ", synonyms: ["環境", "サステナ", "自然", "気候", "リサイクル"] },
  { id: "D009", axis: "domain", label: "ファッション・美容", synonyms: ["ファッション", "服", "美容", "コスメ", "メイク"] },
  { id: "D010", axis: "domain", label: "医療・福祉", synonyms: ["医療", "福祉", "健康", "病院", "介護"] },
  { id: "S001", axis: "style", label: "表に立つ", synonyms: ["表に立", "出演", "自分が出", "発信者"] },
  { id: "S002", axis: "style", label: "裏方", synonyms: ["裏方", "支える", "縁の下", "サポート"] },
  { id: "S003", axis: "style", label: "大勢に届ける", synonyms: ["大勢", "多くの人", "世の中", "全国", "広く"] },
  { id: "S004", axis: "style", label: "少人数に深く", synonyms: ["一人ひとり", "身近", "寄り添", "深く"] },
];

const jobs = [
  {
    id: "J001",
    name: "テレビ番組ディレクター",
    industries: ["映像・放送", "笑い・エンタメ"],
    description: "番組の企画、取材、撮影、編集、出演者との調整を進め、視聴者に届く形へまとめる仕事です。",
    skills: ["企画力", "構成力", "進行管理", "コミュニケーション"],
    studentActions: ["大学祭やサークルで動画企画を作る", "短いインタビュー動画を撮影・編集する", "好きな番組の構成を分解してメモする"],
    weights: { A001: 0.95, A002: 0.9, A008: 0.7, D001: 0.75, D002: 1, S002: 0.5, S003: 0.5 },
  },
  {
    id: "J002",
    name: "放送作家",
    industries: ["笑い・エンタメ", "映像・放送"],
    description: "番組や配信コンテンツの企画、台本、コーナー案を考え、面白さが伝わる流れを設計します。",
    skills: ["発想力", "言語化", "リサーチ", "構成力"],
    studentActions: ["企画書を1ページで書く練習をする", "漫才や番組の面白い構造を分析する", "友人とラジオや配信を作ってみる"],
    weights: { A001: 1, A002: 0.75, A006: 0.35, D001: 1, D002: 0.8, S002: 0.5 },
  },
  {
    id: "J003",
    name: "イベントプロデューサー",
    industries: ["イベント", "笑い・エンタメ"],
    description: "ライブ、展示、地域イベントなどの目的を決め、出演者・会場・予算・集客を組み立てます。",
    skills: ["企画力", "交渉力", "予算管理", "運営設計"],
    studentActions: ["小規模イベントを企画して集客する", "会場手配やタイムテーブル作成を経験する", "SNS告知の効果を記録する"],
    weights: { A001: 0.9, A008: 0.9, A005: 0.55, D001: 0.65, D002: 0.35, S003: 0.45 },
  },
  {
    id: "J004",
    name: "都市計画コンサルタント",
    industries: ["都市・まちづくり", "調査"],
    description: "地域の課題や人の流れを調査し、行政や企業と一緒に土地利用、交通、公共空間の計画を作ります。",
    skills: ["調査設計", "データ分析", "合意形成", "資料作成"],
    studentActions: ["身近な駅前の課題を観察して地図にする", "都市計画や建築の基礎授業を取る", "地域イベントやまち歩きに参加する"],
    weights: { A001: 0.7, A006: 0.85, A004: 0.45, D003: 1, S002: 0.45, S004: 0.35 },
  },
  {
    id: "J005",
    name: "不動産開発",
    industries: ["都市・まちづくり", "不動産"],
    description: "土地や建物の価値を見立て、商業施設、住宅、オフィスなどの開発計画を推進する仕事です。",
    skills: ["事業企画", "収支計画", "交渉力", "法律・契約理解"],
    studentActions: ["気になる施設の利用者や導線を観察する", "宅建や都市開発の記事に触れる", "地域の再開発事例を比較する"],
    weights: { A001: 0.85, A008: 0.65, A006: 0.55, D003: 1, S003: 0.3 },
  },
  {
    id: "J006",
    name: "コミュニティマネージャー",
    industries: ["都市・まちづくり", "教育・学び"],
    description: "地域、施設、オンラインコミュニティで人が関わり続ける場を設計し、活動を支えます。",
    skills: ["ファシリテーション", "傾聴", "運営力", "情報発信"],
    studentActions: ["サークルやゼミの運営役を担う", "地域ボランティアで参加者の声を聞く", "小さな交流会を継続開催する"],
    weights: { A004: 0.9, A008: 0.8, A005: 0.4, D003: 0.8, D006: 0.5, S004: 0.75 },
  },
  {
    id: "J007",
    name: "商品企画",
    industries: ["食", "ファッション・美容"],
    description: "生活者の欲しいものを調べ、コンセプト、仕様、価格、売り方まで商品として成立させます。",
    skills: ["市場調査", "企画書作成", "仮説検証", "ブランド理解"],
    studentActions: ["好きな商品の不満点を10個書く", "試作品やアンケートを小さく試す", "店頭観察で売れ方を記録する"],
    weights: { A001: 0.9, A006: 0.65, A005: 0.45, D004: 0.85, D009: 0.85, S003: 0.35 },
  },
  {
    id: "J008",
    name: "UXデザイナー",
    industries: ["テクノロジー", "調査"],
    description: "アプリやサービスを使う人の行動を調べ、迷わず使える体験や画面構成を設計します。",
    skills: ["ユーザー調査", "情報設計", "プロトタイピング", "検証"],
    studentActions: ["身近なアプリの使いにくさを記録する", "Figmaなどで画面を作って人に触ってもらう", "インタビューから改善案を出す"],
    weights: { A002: 0.75, A006: 0.9, A004: 0.4, D007: 1, S004: 0.45 },
  },
  {
    id: "J009",
    name: "スポーツマーケター",
    industries: ["スポーツ", "広告・PR"],
    description: "チーム、選手、大会の価値を整理し、ファンやスポンサーに届く企画と発信を行います。",
    skills: ["マーケティング", "企画力", "データ分析", "SNS運用"],
    studentActions: ["試合観戦者の導線や投稿を観察する", "チームSNSの投稿を分析する", "スポーツイベントの運営に参加する"],
    weights: { A005: 0.95, A001: 0.55, A006: 0.5, D005: 1, S003: 0.7 },
  },
  {
    id: "J010",
    name: "環境教育プランナー",
    industries: ["環境・サステナビリティ", "教育・学び"],
    description: "環境問題を学びや体験に変え、学校、地域、企業向けのプログラムを企画・実施します。",
    skills: ["教材設計", "ファシリテーション", "環境知識", "企画運営"],
    studentActions: ["環境イベントでボランティアをする", "子ども向けワークショップ案を作る", "地域のごみや資源循環を調べる"],
    weights: { A007: 0.9, A001: 0.65, A008: 0.45, D008: 1, D006: 0.7, S004: 0.55 },
  },
  {
    id: "J011",
    name: "医療ソーシャルワーカー",
    industries: ["医療・福祉"],
    description: "患者や家族が生活に戻るために、制度、施設、地域資源をつなぎながら支援します。",
    skills: ["相談援助", "制度理解", "調整力", "記録力"],
    studentActions: ["福祉施設や病院ボランティアに参加する", "社会福祉士の仕事内容を調べる", "相手の話を要約する練習をする"],
    weights: { A004: 1, A007: 0.45, A008: 0.35, D010: 1, S004: 0.9 },
  },
  {
    id: "J012",
    name: "クリエイティブディレクター",
    industries: ["広告・PR", "映像・放送"],
    description: "商品や企業の伝えたい価値を整理し、コピー、映像、デザインなどの表現全体を導きます。",
    skills: ["コンセプト設計", "表現判断", "チームディレクション", "プレゼン"],
    studentActions: ["広告やMVの意図を言葉にする", "架空商品のキャンペーン案を作る", "制作チームで役割分担を経験する"],
    weights: { A001: 0.95, A002: 0.75, A005: 0.8, D002: 0.7, D009: 0.45, S003: 0.6 },
  },
  {
    id: "J013",
    name: "ブランドコンテンツプランナー",
    industries: ["広告・PR", "テクノロジー"],
    description: "企業やサービスの魅力を、動画、SNS企画、記事、イベントなどのコンテンツとして届ける仕事です。",
    skills: ["企画力", "編集視点", "SNS理解", "効果検証"],
    studentActions: ["好きなブランドのSNS投稿を分類する", "ショート動画や記事企画を作って公開する", "反応が良かった表現を記録する"],
    weights: { A001: 0.75, A002: 0.65, A005: 0.75, D001: 0.45, D002: 0.75, D007: 0.45, S003: 0.55 },
  },
  {
    id: "J014",
    name: "地域プロモーションプランナー",
    industries: ["都市・まちづくり", "広告・PR"],
    description: "地域の魅力や課題を整理し、観光、移住、イベント、SNSなどを通じて人の流れを作ります。",
    skills: ["地域調査", "企画力", "情報発信", "関係者調整"],
    studentActions: ["地元の好きな場所を紹介する記事を書く", "地域イベントの運営に参加する", "観光マップやSNS企画を試作する"],
    weights: { A001: 0.7, A005: 0.85, A008: 0.45, D003: 0.9, S003: 0.55 },
  },
  {
    id: "J015",
    name: "公共空間デザイナー",
    industries: ["都市・まちづくり", "デザイン"],
    description: "公園、駅前、広場、歩道など、人が使う場所の体験を観察し、過ごしやすい空間を設計します。",
    skills: ["観察力", "空間設計", "プロトタイピング", "合意形成"],
    studentActions: ["街の居心地が良い場所を写真で記録する", "ベンチや導線など小さな改善案を描く", "建築・ランドスケープの事例を見る"],
    weights: { A001: 0.55, A002: 0.65, A006: 0.55, D003: 0.9, S004: 0.35 },
  },
  {
    id: "J016",
    name: "モビリティサービス企画",
    industries: ["都市・まちづくり", "テクノロジー"],
    description: "移動しやすい街を作るために、交通データ、アプリ、シェアサービスなどを組み合わせて新しい移動体験を企画します。",
    skills: ["課題発見", "サービス設計", "データ読解", "実証実験"],
    studentActions: ["通学路や駅周辺の不便を記録する", "交通アプリの改善案を画面にする", "地域交通やMaaSの事例を調べる"],
    weights: { A001: 0.7, A002: 0.55, A006: 0.65, D003: 0.85, D007: 0.55, S003: 0.3 },
  },
];

const examples = [
  "お笑い番組を作りたい",
  "都市開発に関わりたい",
  "スポーツをもっと広めたい",
  "環境のことを子どもに教えたい",
];

const state = {
  input: "",
  selectedTags: [],
  route: "未入力",
  cacheHit: false,
  activeJob: null,
  isLoading: false,
  bookmarks: readBookmarks(),
};

const $ = (id) => document.getElementById(id);
const tagById = Object.fromEntries(tags.map((tag) => [tag.id, tag]));

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[、。,.!?！？「」『』()（）\[\]【】]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function simpleHash(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `q_${Math.abs(hash).toString(16)}`;
}

function readCache() {
  try {
    return JSON.parse(sessionStorage.getItem("yaritai_query_cache") || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache) {
  sessionStorage.setItem("yaritai_query_cache", JSON.stringify(cache));
}

function readBookmarks() {
  try {
    return JSON.parse(sessionStorage.getItem("yaritai_bookmarks") || "[]");
  } catch {
    return [];
  }
}

function writeBookmarks() {
  sessionStorage.setItem("yaritai_bookmarks", JSON.stringify(state.bookmarks));
}

function matchTags(text) {
  const normalized = normalize(text);
  const cache = readCache();
  const key = simpleHash(normalized);
  if (cache[key]) {
    return { tags: cache[key].tags.map((id) => tagById[id]).filter(Boolean), cacheHit: true, key };
  }

  const matched = tags.filter((tag) => tag.synonyms.some((surface) => normalized.includes(normalize(surface))));
  cache[key] = { tags: matched.map((tag) => tag.id), createdAt: new Date().toISOString(), hitCount: 1 };
  writeCache(cache);
  return { tags: matched, cacheHit: false, key };
}

function tagsByAxis(axis) {
  return state.selectedTags.filter((tag) => tag.axis === axis);
}

function hasAxis(axis) {
  return tagsByAxis(axis).length > 0;
}

function setSelectedTags(nextTags) {
  const unique = [];
  nextTags.forEach((tag) => {
    if (tag && !unique.some((item) => item.id === tag.id)) unique.push(tag);
  });
  state.selectedTags = unique;
}

function scoreJob(job) {
  return state.selectedTags.reduce((sum, tag) => {
    const raw = job.weights[tag.id] || 0;
    return sum + (tag.axis === "style" ? raw * 0.5 : raw);
  }, 0);
}

function rankedJobs() {
  return jobs
    .map((job) => ({ ...job, score: scoreJob(job) }))
    .filter((job) => job.score > 0)
    .sort((a, b) => b.score - a.score);
}

function splitResults() {
  const ranked = rankedJobs();
  const classic = ranked.slice(0, 3);
  const classicIndustry = new Set(classic.flatMap((job) => job.industries));
  const domainTags = tagsByAxis("domain");
  const surprise = ranked
    .filter((job) => !classic.some((classicJob) => classicJob.id === job.id))
    .filter((job) => domainTags.some((tag) => (job.weights[tag.id] || 0) >= 0.7))
    .filter((job) => job.industries.some((industry) => !classicIndustry.has(industry)) || classic.length < 2)
    .slice(0, 3);

  const fallback = ranked.filter((job) => !classic.some((item) => item.id === job.id) && !surprise.some((item) => item.id === job.id));
  return {
    classic,
    surprise: surprise.length ? surprise : fallback.slice(0, 3),
  };
}

function nextQuestion() {
  if (!hasAxis("action") && !hasAxis("domain")) {
    return {
      question: "まず、近い分野はどれですか?",
      choices: ["D001", "D002", "D003", "D004", "D005", "D006", "D007", "D008"].map((id) => [id, tagById[id].label]),
    };
  }
  if (!hasAxis("action") && hasAxis("domain")) {
    return {
      question: "どう関わりたい?",
      choices: [
        ["A002", "作る側"],
        ["A003", "出る・表に立つ"],
        ["A004", "支える"],
        ["A005", "広める"],
      ],
    };
  }
  if (hasAxis("action") && !hasAxis("domain")) {
    return {
      question: "どんな分野で?",
      choices: ["D001", "D002", "D003", "D004", "D005", "D006", "D007", "D008"].map((id) => [id, tagById[id].label]),
    };
  }
  if (!hasAxis("style")) {
    return {
      question: "どっちが近い?",
      choices: [
        ["S003", "大勢に届けたい"],
        ["S004", "少人数に深く"],
      ],
    };
  }
  return null;
}

function renderExamples() {
  $("exampleRow").innerHTML = examples
    .map((example) => `<button type="button" class="example-chip" data-example="${escapeAttr(example)}">${escapeHtml(example)}</button>`)
    .join("");
}

function renderMetrics() {
  $("routeLabel").textContent = state.route;
  $("cacheLabel").textContent = state.cacheHit ? "ヒット" : state.input ? "新規" : "待機中";
  $("tagCountLabel").textContent = `${state.selectedTags.length}件`;
  $("bookmarkCountLabel").textContent = `${state.bookmarks.length}件`;
  $("costStatus").textContent = `保存 ${state.bookmarks.length}件`;
}

function renderChips() {
  const question = nextQuestion();
  const chipsBand = $("chipsBand");
  if (!question || !state.input || state.isLoading) {
    chipsBand.classList.add("hidden");
    return;
  }

  $("chipsTitle").textContent = question.question === "どっちが近い?" ? "どっちが近い?" : "もう少しだけ教えてください";
  $("chipQuestion").textContent = `「${state.input}」について、もう少しだけ`;
  $("chipList").innerHTML = question.choices
    .map(([id, label]) => `<button type="button" class="choice-chip" data-tag-id="${id}">${escapeHtml(label)}</button>`)
    .join("");
  chipsBand.classList.remove("hidden");
}

function renderResults() {
  const shouldShow = state.input && hasAxis("action") && hasAxis("domain") && hasAxis("style") && !state.isLoading;
  $("resultsBand").classList.toggle("hidden", !shouldShow);
  $("emptyState").classList.toggle("hidden", shouldShow);

  if (!shouldShow) return;

  $("resultsEyebrow").textContent = `「${state.input}」の結果`;
  $("tagRow").innerHTML = state.selectedTags
    .map((tag) => `<span class="tag">${escapeHtml(tag.label)}</span>`)
    .join("");

  const { classic, surprise } = splitResults();
  $("classicJobs").innerHTML = classic.map((job) => jobCard(job, "王道")).join("") || emptyCard("タグに合う職種を調整中です");
  $("surpriseJobs").innerHTML = surprise.map((job) => jobCard(job, "意外")).join("") || emptyCard("別業界の候補を調整中です");
}

function jobCard(job, label) {
  return `
    <article class="job-card" data-job-id="${job.id}">
      <div>
        <span class="route-badge">${escapeHtml(job.industries[0] || label)}</span>
      </div>
      <h4>${escapeHtml(job.name)}</h4>
      <p>${escapeHtml(job.description)}</p>
      <div class="card-footer">
        <span class="score">${label} / score ${job.score.toFixed(2)}</span>
        <span class="card-link">詳しく見る →</span>
      </div>
    </article>
  `;
}

function emptyCard(message) {
  return `<div class="job-card"><p>${escapeHtml(message)}</p></div>`;
}

function renderAll() {
  $("inputBand").classList.toggle("hidden", Boolean(state.input));
  $("loadingState").classList.toggle("hidden", !state.isLoading);
  renderMetrics();
  renderChips();
  renderResults();
}

function runQuery(value) {
  const input = value.trim();
  if (!input) {
    showToast("やってみたいことを少しだけ入力してください");
    return;
  }

  state.input = input;
  const result = matchTags(input);
  setSelectedTags(result.tags);
  state.cacheHit = result.cacheHit;

  if (!state.selectedTags.length) {
    state.route = "未マッチ: 深掘り待ち";
  } else if (!hasAxis("action") || !hasAxis("domain")) {
    state.route = "辞書マッチ + 深掘り";
  } else {
    state.route = result.cacheHit ? "キャッシュ" : "辞書マッチ";
  }

  const params = new URLSearchParams();
  params.set("q", state.input);
  params.set("tags", state.selectedTags.map((tag) => tag.id).join(","));
  history.replaceState(null, "", `#${params.toString()}`);
  renderAll();
}

function addTag(id) {
  const tag = tagById[id];
  if (!tag) return;
  setSelectedTags([...state.selectedTags, tag]);
  if (!hasAxis("action") || !hasAxis("domain")) {
    state.route = "辞書マッチ + 深掘り";
  } else {
    state.route = "辞書マッチ";
  }
  const params = new URLSearchParams(location.hash.slice(1));
  params.set("q", state.input);
  params.set("tags", state.selectedTags.map((item) => item.id).join(","));
  history.replaceState(null, "", `#${params.toString()}`);

  if (hasAxis("action") && hasAxis("domain") && hasAxis("style")) {
    state.isLoading = true;
    renderAll();
    window.setTimeout(() => {
      state.isLoading = false;
      renderAll();
    }, 1100);
    return;
  }

  renderAll();
}

function openDetail(jobId) {
  const job = jobs.find((item) => item.id === jobId);
  if (!job) return;
  state.activeJob = job;
  $("detailCategory").textContent = job.industries.join(" / ");
  $("detailTitle").textContent = job.name;
  $("detailDescription").textContent = job.description;
  $("detailSkills").innerHTML = job.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("");
  $("detailActions").innerHTML = job.studentActions.map((action) => `<li>${escapeHtml(action)}</li>`).join("");
  $("bookmarkButton").textContent = state.bookmarks.some((item) => item.id === job.id) ? "保存済み" : "保存する";
  $("detailPanel").classList.add("open");
  $("detailPanel").setAttribute("aria-hidden", "false");
}

function closeDetail() {
  $("detailPanel").classList.remove("open");
  $("detailPanel").setAttribute("aria-hidden", "true");
  state.activeJob = null;
}

function bookmarkActiveJob() {
  if (!state.activeJob) return;
  if (!state.bookmarks.some((item) => item.id === state.activeJob.id)) {
    state.bookmarks.push({ id: state.activeJob.id, name: state.activeJob.name, savedAt: new Date().toISOString() });
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
  state.selectedTags = [];
  state.route = "未入力";
  state.cacheHit = false;
  state.isLoading = false;
  $("queryInput").value = "";
  history.replaceState(null, "", location.pathname);
  renderAll();
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => $("toast").classList.remove("show"), 2400);
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

function hydrateFromHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const query = params.get("q");
  const tagIds = (params.get("tags") || "").split(",").filter(Boolean);
  if (!query) return;
  $("queryInput").value = query;
  state.input = query;
  const result = matchTags(query);
  setSelectedTags([...result.tags, ...tagIds.map((id) => tagById[id]).filter(Boolean)]);
  state.cacheHit = true;
  state.route = "共有URL";
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
  $("bookmarkButton").addEventListener("click", bookmarkActiveJob);

  document.addEventListener("click", (event) => {
    const example = event.target.closest("[data-example]");
    if (example) {
      $("queryInput").value = example.dataset.example;
      runQuery(example.dataset.example);
    }

    const chip = event.target.closest("[data-tag-id]");
    if (chip) addTag(chip.dataset.tagId);

    const detail = event.target.closest("[data-job-id]");
    if (detail) openDetail(detail.dataset.jobId);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetail();
  });
}

renderExamples();
hydrateFromHash();
bindEvents();
renderAll();
