const domainCatalog = [
  {
    id: "music",
    label: "音楽・音声",
    keywords: ["音楽", "曲", "歌", "楽曲", "アーティスト", "バンド", "ライブ", "フェス", "音声", "ラジオ", "作曲", "作詞"],
    followups: [
      ["compose", "曲や音そのものを作る"],
      ["produce_artist", "アーティストや作品を企画する"],
      ["growth", "SNSや配信で広げる"],
      ["live", "ライブやイベントに関わる"],
      ["media_mix", "映像・SNSと組み合わせる"],
      ["cross_domain", "音楽を別領域で活かす"],
    ],
  },
  {
    id: "video",
    label: "映像・放送",
    keywords: ["番組", "テレビ", "映像", "動画", "映画", "配信", "YouTube", "ショート動画"],
    followups: [
      ["planning", "企画を考える"],
      ["production", "撮影・編集する"],
      ["writing", "台本や構成を作る"],
      ["growth", "多くの人に届ける"],
      ["behind", "制作を支える"],
    ],
  },
  {
    id: "healthcare",
    label: "医療・福祉",
    keywords: ["医療", "福祉", "健康", "病院", "介護", "看護", "リハビリ", "メンタル", "障害", "患者"],
    followups: [
      ["care", "人を直接支える"],
      ["program", "体験やプログラムを作る"],
      ["communication", "わかりやすく伝える"],
      ["technology", "サービスやアプリで支える"],
      ["cross_domain", "別領域と組み合わせる"],
    ],
  },
  {
    id: "education",
    label: "教育・学び",
    keywords: ["教育", "学校", "学び", "先生", "子ども", "高校生", "大学生", "授業", "教材", "塾"],
    followups: [
      ["teach", "教える"],
      ["program", "学びの場を作る"],
      ["content", "教材やコンテンツを作る"],
      ["support", "一人ひとりを支える"],
      ["growth", "広く届ける"],
    ],
  },
  {
    id: "sports",
    label: "スポーツ",
    keywords: ["スポーツ", "試合", "チーム", "選手", "アスリート", "大会", "観戦"],
    followups: [
      ["growth", "ファンを増やす"],
      ["event", "大会やイベントを作る"],
      ["support", "選手やチームを支える"],
      ["content", "魅力を発信する"],
      ["data", "データで強くする"],
    ],
  },
  {
    id: "city",
    label: "都市・まちづくり",
    keywords: ["都市", "まち", "街", "地域", "再開発", "建築", "交通", "公園", "公共空間"],
    followups: [
      ["planning", "計画を作る"],
      ["research", "人の流れを調べる"],
      ["space", "空間を設計する"],
      ["community", "人が集まる場を作る"],
      ["growth", "地域の魅力を広げる"],
    ],
  },
  {
    id: "food",
    label: "食",
    keywords: ["食", "料理", "カフェ", "レストラン", "食品", "お菓子", "飲食", "フード"],
    followups: [
      ["product", "商品を作る"],
      ["brand", "ブランドを作る"],
      ["shop", "店や体験を作る"],
      ["growth", "多くの人に届ける"],
      ["research", "好みを調べる"],
    ],
  },
  {
    id: "technology",
    label: "テクノロジー",
    keywords: ["アプリ", "AI", "IT", "テック", "プログラミング", "サービス", "システム", "データ"],
    followups: [
      ["product", "サービスを作る"],
      ["design", "使いやすく設計する"],
      ["data", "データで改善する"],
      ["support", "人の課題を支える"],
      ["growth", "広く使われるようにする"],
    ],
  },
  {
    id: "fashion",
    label: "ファッション・美容",
    keywords: ["ファッション", "服", "美容", "コスメ", "メイク", "ブランド", "スタイリング"],
    followups: [
      ["product", "商品を作る"],
      ["brand", "世界観を作る"],
      ["content", "発信する"],
      ["research", "流行を読む"],
      ["shop", "販売や体験に関わる"],
    ],
  },
  {
    id: "environment",
    label: "環境・サステナビリティ",
    keywords: ["環境", "自然", "気候", "サステナ", "リサイクル", "脱炭素", "海", "森"],
    followups: [
      ["research", "調べる"],
      ["program", "学びや体験にする"],
      ["communication", "伝える"],
      ["product", "仕組みや商品を作る"],
      ["community", "地域で動かす"],
    ],
  },
];

const actionCatalog = [
  { id: "create", label: "作る・制作する", keywords: ["作り", "つくり", "制作", "開発", "デザイン", "生み出", "作曲", "企画"] },
  { id: "spread", label: "広める・届ける", keywords: ["広め", "届け", "売る", "宣伝", "マーケ", "ヒット", "流行", "バズ"] },
  { id: "support", label: "支える", keywords: ["支え", "サポート", "助け", "裏方", "伴走"] },
  { id: "teach", label: "教える・育てる", keywords: ["教え", "育て", "教育", "学び", "伝え"] },
  { id: "analyze", label: "調べる・分析する", keywords: ["調べ", "分析", "研究", "検証", "データ"] },
  { id: "perform", label: "表現する", keywords: ["出演", "演じ", "歌う", "表現", "舞台", "表に立"] },
  { id: "manage", label: "運営する", keywords: ["運営", "仕切", "まとめ", "マネジメント", "進行"] },
];

const genericDomainChoices = domainCatalog.map((domain) => [domain.id, domain.label]);

const genericActionChoices = [
  ["create", "作る・制作する"],
  ["spread", "広める・届ける"],
  ["support", "支える"],
  ["teach", "教える・育てる"],
  ["analyze", "調べる・分析する"],
  ["perform", "表現する"],
  ["manage", "運営する"],
];

const genericLensChoices = [
  ["growth", "大勢に届けたい"],
  ["deep", "少人数に深く関わりたい"],
  ["planning", "企画や設計をしたい"],
  ["hands_on", "手を動かして作りたい"],
  ["support", "人やチームを支えたい"],
];

const jobs = [
  {
    id: "M001",
    name: "音楽プロデューサー",
    domains: ["music"],
    industries: ["音楽・音声", "エンタメ"],
    lenses: ["produce_artist", "planning", "growth"],
    actions: ["create", "spread", "manage"],
    description: "アーティストや楽曲の方向性を決め、制作チーム、予算、宣伝まで含めて作品を世の中に届ける仕事です。",
    reason: "「ヒットさせたい」という意図と、音楽を作る・届ける両方に関わります。",
    skills: ["コンセプト設計", "音楽理解", "チーム編成", "マーケティング"],
    studentActions: ["好きな曲のヒット理由を分解する", "架空アーティストの企画書を1枚で作る", "SNSで曲紹介の反応を記録する"],
  },
  {
    id: "M002",
    name: "ソングライター / トラックメイカー",
    domains: ["music"],
    industries: ["音楽・音声"],
    lenses: ["compose", "hands_on"],
    actions: ["create", "perform"],
    description: "メロディ、歌詞、ビート、サウンドを作り、アーティストや映像、広告などに使われる楽曲を制作します。",
    reason: "曲や音そのものを作りたい場合の中心にある職種です。",
    skills: ["作曲", "作詞", "DTM", "音楽理論"],
    studentActions: ["短い曲を作って公開する", "好きな曲の構成をメモする", "DAWやスマホアプリで音を重ねてみる"],
  },
  {
    id: "M003",
    name: "A&R / アーティスト企画",
    domains: ["music"],
    industries: ["音楽・音声", "レーベル"],
    lenses: ["produce_artist", "growth", "planning"],
    actions: ["create", "spread", "support"],
    description: "才能あるアーティストを見つけ、作品づくり、活動方針、リリース計画を一緒に考えて育てます。",
    reason: "自分で曲を作るより、アーティストや作品を伸ばす側に近い道です。",
    skills: ["発掘力", "企画力", "伴走力", "市場理解"],
    studentActions: ["新人アーティストを調べて伸び方を観察する", "プレイリストをテーマ別に編集する", "ライブや配信の感想を言語化する"],
  },
  {
    id: "M004",
    name: "音楽マーケター",
    domains: ["music"],
    industries: ["音楽・音声", "広告・PR"],
    lenses: ["growth", "media_mix"],
    actions: ["spread", "analyze", "create"],
    description: "楽曲やアーティストが届く相手を考え、SNS、配信、広告、タイアップなどの広げ方を設計します。",
    reason: "「ヒット」を作るには、制作だけでなく届け方の設計が重要です。",
    skills: ["SNS運用", "データ分析", "企画力", "ファン理解"],
    studentActions: ["TikTokやYouTubeで曲が広がるパターンを見る", "投稿文やサムネを試作する", "再生数やコメントの変化を観察する"],
  },
  {
    id: "M005",
    name: "ライブイベントプランナー",
    domains: ["music"],
    industries: ["音楽・音声", "イベント"],
    lenses: ["live", "community", "growth"],
    actions: ["manage", "create", "spread"],
    description: "ライブ、フェス、リリースイベントなどの体験を企画し、出演者、会場、集客、運営を組み立てます。",
    reason: "音楽を“場”として届けたい場合に近い職種です。",
    skills: ["イベント企画", "進行管理", "交渉力", "集客設計"],
    studentActions: ["小さな音楽イベントを企画する", "ライブ会場の導線や演出を観察する", "告知文とタイムテーブルを作る"],
  },
  {
    id: "M006",
    name: "映像音楽ディレクター",
    domains: ["music", "video"],
    industries: ["音楽・音声", "映像・放送"],
    lenses: ["media_mix", "planning", "compose"],
    actions: ["create", "manage"],
    description: "映像、広告、ゲーム、番組などに合う音楽や音の方向性を決め、作曲家や制作チームと形にします。",
    reason: "音楽を映像や物語と組み合わせたい場合の橋渡しです。",
    skills: ["音楽演出", "映像理解", "ディレクション", "言語化"],
    studentActions: ["好きなMVやCMの音の役割を分析する", "無音映像に合う曲を選ぶ", "映像企画に音楽案を添える"],
  },
  {
    id: "M007",
    name: "音楽療法士 / 音楽プログラム企画",
    domains: ["music", "healthcare"],
    industries: ["音楽・音声", "医療・福祉"],
    lenses: ["cross_domain", "care", "program", "deep"],
    actions: ["support", "teach", "create"],
    description: "医療・福祉・教育の現場で、音楽を使ったケアや表現、リハビリ、交流プログラムを設計します。",
    reason: "音楽と医療・福祉を明確に掛け合わせたい場合にだけ出すべき候補です。",
    skills: ["音楽活用", "対人支援", "プログラム設計", "観察力"],
    studentActions: ["音楽療法の事例を調べる", "高齢者施設や福祉イベントの活動を見る", "音楽で気持ちが変わる場面を記録する"],
  },
  {
    id: "V001",
    name: "テレビ番組ディレクター",
    domains: ["video"],
    industries: ["映像・放送", "エンタメ"],
    lenses: ["planning", "production", "growth"],
    actions: ["create", "manage"],
    description: "番組の企画、取材、撮影、編集、出演者との調整を進め、視聴者に届く形へまとめる仕事です。",
    reason: "映像や番組を作りたい入力のときに出す候補です。音楽単体の入力では主候補にしません。",
    skills: ["企画力", "構成力", "進行管理", "コミュニケーション"],
    studentActions: ["短いインタビュー動画を撮る", "好きな番組の構成を分解する", "編集アプリで1分動画を作る"],
  },
  {
    id: "V002",
    name: "放送作家",
    domains: ["video", "entertainment"],
    industries: ["映像・放送", "笑い・エンタメ"],
    lenses: ["writing", "planning"],
    actions: ["create", "analyze"],
    description: "番組や配信コンテンツの企画、台本、コーナー案を考え、面白さが伝わる流れを設計します。",
    reason: "コンテンツの構成や言葉で面白さを作る道です。",
    skills: ["発想力", "言語化", "リサーチ", "構成力"],
    studentActions: ["企画書を1ページで書く", "番組の面白い構造を分析する", "友人と配信企画を試す"],
  },
  {
    id: "H001",
    name: "医療ソーシャルワーカー",
    domains: ["healthcare"],
    industries: ["医療・福祉"],
    lenses: ["care", "support", "deep"],
    actions: ["support"],
    description: "患者や家族が生活に戻るために、制度、施設、地域資源をつなぎながら支援します。",
    reason: "医療・福祉を選び、人を直接支えたい場合の王道候補です。",
    skills: ["相談援助", "制度理解", "調整力", "記録力"],
    studentActions: ["病院や福祉施設の仕事を調べる", "ボランティアに参加する", "相手の話を要約する練習をする"],
  },
  {
    id: "H002",
    name: "ヘルスケアサービス企画",
    domains: ["healthcare", "technology"],
    industries: ["医療・福祉", "テクノロジー"],
    lenses: ["technology", "program", "growth"],
    actions: ["create", "support"],
    description: "健康、予防、通院、介護などの課題を、アプリやサービス、情報設計で支える仕事です。",
    reason: "医療領域で、直接ケアではなく仕組みやサービスを作りたい場合に合います。",
    skills: ["課題発見", "サービス設計", "UX", "医療制度理解"],
    studentActions: ["健康アプリの使いにくさを記録する", "通院体験の困りごとを聞く", "改善画面を紙に描く"],
  },
  {
    id: "E001",
    name: "教育コンテンツプランナー",
    domains: ["education", "video"],
    industries: ["教育・学び", "映像・放送"],
    lenses: ["content", "program", "growth"],
    actions: ["teach", "create", "spread"],
    description: "学びたい人に届く授業、動画、教材、ワークショップなどを企画し、わかりやすい形にします。",
    reason: "教育とコンテンツ制作をつなぐ候補です。",
    skills: ["教材設計", "編集力", "説明力", "学習者理解"],
    studentActions: ["好きなテーマを5分で教える動画を作る", "教材のわかりやすさを比較する", "友人に説明して反応を見る"],
  },
  {
    id: "S001",
    name: "スポーツマーケター",
    domains: ["sports"],
    industries: ["スポーツ", "広告・PR"],
    lenses: ["growth", "content"],
    actions: ["spread", "analyze", "create"],
    description: "チーム、選手、大会の価値を整理し、ファンやスポンサーに届く企画と発信を行います。",
    reason: "スポーツを広げたい入力に対する王道候補です。",
    skills: ["マーケティング", "企画力", "データ分析", "SNS運用"],
    studentActions: ["試合観戦者の導線を見る", "チームSNSの投稿を分析する", "スポーツイベント運営に参加する"],
  },
  {
    id: "C001",
    name: "都市計画コンサルタント",
    domains: ["city"],
    industries: ["都市・まちづくり", "調査"],
    lenses: ["planning", "research", "space"],
    actions: ["create", "analyze", "support"],
    description: "地域の課題や人の流れを調査し、行政や企業と一緒に土地利用、交通、公共空間の計画を作ります。",
    reason: "街や地域を良くしたい入力に対する王道候補です。",
    skills: ["調査設計", "データ分析", "合意形成", "資料作成"],
    studentActions: ["駅前の課題を観察して地図にする", "都市計画の事例を読む", "まち歩きに参加する"],
  },
  {
    id: "F001",
    name: "商品企画",
    domains: ["food", "fashion"],
    industries: ["食", "ファッション・美容"],
    lenses: ["product", "brand", "research"],
    actions: ["create", "analyze", "spread"],
    description: "生活者の欲しいものを調べ、コンセプト、仕様、価格、売り方まで商品として成立させます。",
    reason: "商品そのものを作りたい入力に合う候補です。",
    skills: ["市場調査", "企画書作成", "仮説検証", "ブランド理解"],
    studentActions: ["好きな商品の不満点を書く", "試作品やアンケートを小さく試す", "店頭観察で売れ方を見る"],
  },
  {
    id: "T001",
    name: "UXデザイナー",
    domains: ["technology"],
    industries: ["テクノロジー", "調査"],
    lenses: ["design", "product", "support"],
    actions: ["create", "analyze", "support"],
    description: "アプリやサービスを使う人の行動を調べ、迷わず使える体験や画面構成を設計します。",
    reason: "サービスやアプリを作りたい入力に対する候補です。",
    skills: ["ユーザー調査", "情報設計", "プロトタイピング", "検証"],
    studentActions: ["身近なアプリの使いにくさを記録する", "画面を作って人に触ってもらう", "改善案を出す"],
  },
  {
    id: "ENV001",
    name: "環境教育プランナー",
    domains: ["environment", "education"],
    industries: ["環境・サステナビリティ", "教育・学び"],
    lenses: ["program", "communication", "community"],
    actions: ["teach", "create", "manage"],
    description: "環境問題を学びや体験に変え、学校、地域、企業向けのプログラムを企画・実施します。",
    reason: "環境をわかりやすく伝えたい入力に合う候補です。",
    skills: ["教材設計", "ファシリテーション", "環境知識", "企画運営"],
    studentActions: ["環境イベントでボランティアをする", "子ども向けワークショップ案を作る", "地域の資源循環を調べる"],
  },
];

const state = {
  input: "",
  interpretation: null,
  selected: {},
  route: "未入力",
  activeJob: null,
  isLoading: false,
  bookmarks: readBookmarks(),
};

const $ = (id) => document.getElementById(id);

function normalize(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[、。,.!?！？「」『』()（）\[\]【】]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function matchByKeywords(text, catalog) {
  const normalized = normalize(text);
  return catalog.filter((item) => item.keywords.some((keyword) => normalized.includes(normalize(keyword))));
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function interpretInput(text) {
  const domains = uniqueById(matchByKeywords(text, domainCatalog));
  const actions = uniqueById(matchByKeywords(text, actionCatalog));
  const normalized = normalize(text);
  const wantsHit = ["ヒット", "売れ", "流行", "バズ", "有名", "多くの人", "大勢", "広め"].some((word) => normalized.includes(normalize(word)));
  const crossDomain = domains.length > 1;

  return {
    input: text,
    domains,
    actions,
    intent: wantsHit ? { id: "hit", label: "ヒット・拡散させたい" } : null,
    confidence: domains.length && actions.length ? "high" : domains.length || actions.length ? "medium" : "low",
    crossDomain,
    notes: buildInterpretationNotes(domains, actions, wantsHit),
  };
}

function buildInterpretationNotes(domains, actions, wantsHit) {
  const notes = [];
  if (domains.length) notes.push(`対象領域は「${domains.map((domain) => domain.label).join(" / ")}」として扱います。`);
  if (actions.length) notes.push(`やりたい関わり方は「${actions.map((action) => action.label).join(" / ")}」に近そうです。`);
  if (wantsHit) notes.push("「ヒット」は、制作だけでなく届け方も含む意図として扱います。");
  if (!domains.length) notes.push("対象領域がまだ曖昧なので、先に入口だけ確認します。");
  return notes;
}

function currentDomains() {
  if (state.selected.domain) return [domainCatalog.find((domain) => domain.id === state.selected.domain)].filter(Boolean);
  return state.interpretation?.domains || [];
}

function currentActions() {
  if (state.selected.action) return [actionCatalog.find((action) => action.id === state.selected.action)].filter(Boolean);
  return state.interpretation?.actions || [];
}

function currentLens() {
  return state.selected.lens || null;
}

function isReadyForResults() {
  return currentDomains().length > 0 && currentActions().length > 0 && Boolean(currentLens());
}

function nextQuestion() {
  const domains = currentDomains();
  const actions = currentActions();

  if (!state.interpretation || !state.input) return null;

  if (!domains.length) {
    return {
      axis: "domain",
      title: "どの領域の話として見ますか?",
      question: `「${state.input}」について`,
      helper: "入力から領域を決めきれなかった時だけ、代表的な入口を聞きます。",
      choices: genericDomainChoices,
    };
  }

  if (!actions.length) {
    return {
      axis: "action",
      title: "どう関わりたいですか?",
      question: `「${domains.map((domain) => domain.label).join(" / ")}」で`,
      helper: "領域はすでに拾えているので、次は関わり方だけ確認します。",
      choices: genericActionChoices,
    };
  }

  if (!currentLens()) {
    const primaryDomain = domains[0];
    return {
      axis: "lens",
      title: "どの形が近いですか?",
      question: `「${state.input}」をもう少し具体化すると`,
      helper: "業界を聞き直すのではなく、入力に出ている領域の中で次の分岐を聞きます。",
      choices: primaryDomain.followups || genericLensChoices,
    };
  }

  return null;
}

function scoreJob(job) {
  const domains = currentDomains();
  const actions = currentActions();
  const lens = currentLens();
  const inferredDomainIds = domains.map((domain) => domain.id);
  const actionIds = actions.map((action) => action.id);

  let score = 0;
  inferredDomainIds.forEach((domainId) => {
    if (job.domains.includes(domainId)) score += 2.2;
  });
  actionIds.forEach((actionId) => {
    if (job.actions.includes(actionId)) score += 1;
  });
  if (lens && job.lenses.includes(lens)) score += 1.4;
  if (state.interpretation?.intent?.id === "hit" && job.lenses.some((item) => ["growth", "produce_artist", "brand"].includes(item))) score += 0.6;

  return score;
}

function splitResults() {
  const domains = currentDomains();
  const domainIds = domains.map((domain) => domain.id);
  const lens = currentLens();
  const ranked = jobs
    .map((job) => ({ ...job, score: scoreJob(job) }))
    .filter((job) => job.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = ranked
    .filter((job) => domainIds.some((domainId) => job.domains.includes(domainId)))
    .slice(0, 3);

  const bridge = ranked
    .filter((job) => !primary.some((item) => item.id === job.id))
    .filter((job) => {
      const sharesCurrentDomain = domainIds.some((domainId) => job.domains.includes(domainId));
      if (state.selected.lens === "cross_domain") return job.domains.length > 1 && sharesCurrentDomain;
      if (state.interpretation?.crossDomain) return domainIds.some((domainId) => job.domains.includes(domainId));
      return sharesCurrentDomain && (job.lenses.includes(lens) || job.lenses.includes("media_mix") || job.lenses.includes("live"));
    })
    .slice(0, 3);

  return { primary, bridge };
}

function renderMetrics() {
  $("routeLabel").textContent = state.route;
  $("cacheLabel").textContent = state.interpretation ? "DB検索" : "待機中";
  $("tagCountLabel").textContent = `${buildSignals().length}件`;
  $("bookmarkCountLabel").textContent = `${state.bookmarks.length}件`;
  $("costStatus").textContent = `保存 ${state.bookmarks.length}件`;
}

function buildSignals() {
  if (!state.interpretation) return [];
  const signals = [];
  currentDomains().forEach((domain) => signals.push(["領域", domain.label]));
  currentActions().forEach((action) => signals.push(["関わり方", action.label]));
  if (state.interpretation.intent) signals.push(["意図", state.interpretation.intent.label]);
  if (currentLens()) signals.push(["分岐", findChoiceLabel(currentLens())]);
  return signals;
}

function findChoiceLabel(id) {
  const domainSpecificChoice = currentDomains()
    .flatMap((domain) => domain.followups)
    .find(([choiceId]) => choiceId === id);
  if (domainSpecificChoice) return domainSpecificChoice[1];

  const allChoices = [
    ...genericDomainChoices,
    ...genericActionChoices,
    ...genericLensChoices,
    ...domainCatalog.flatMap((domain) => domain.followups),
  ];
  return allChoices.find(([choiceId]) => choiceId === id)?.[1] || id;
}

function renderChips() {
  const question = nextQuestion();
  const chipsBand = $("chipsBand");
  if (!question || state.isLoading) {
    chipsBand.classList.add("hidden");
    return;
  }

  $("chipsTitle").textContent = question.title;
  $("chipQuestion").textContent = question.question;
  $("chipHelper").textContent = question.helper || "";
  $("chipHelper").classList.toggle("hidden", !question.helper);
  $("chipList").innerHTML = question.choices
    .map(([id, label]) => `<button type="button" class="choice-chip" data-axis="${question.axis}" data-choice-id="${id}">${escapeHtml(label)}</button>`)
    .join("");
  chipsBand.classList.remove("hidden");
}

function renderResults() {
  const shouldShow = state.input && isReadyForResults() && !state.isLoading;
  $("resultsBand").classList.toggle("hidden", !shouldShow);
  $("emptyState").classList.toggle("hidden", shouldShow || Boolean(state.input));

  if (!shouldShow) return;

  $("resultsEyebrow").textContent = `「${state.input}」のAI解釈`;
  $("resultsTitle").textContent = "この前提で道を出します";
  $("tagRow").innerHTML = buildSignals()
    .map(([kind, label]) => `<span class="tag">${escapeHtml(kind)}: ${escapeHtml(label)}</span>`)
    .join("");

  const { primary, bridge } = splitResults();
  $("classicJobs").innerHTML = primary.map((job) => jobCard(job, "王道")).join("") || emptyCard("この条件に合う王道候補を調整中です");
  $("surpriseJobs").innerHTML = bridge.map((job) => jobCard(job, "接点あり")).join("") || emptyCard("無理に別業界へ広げず、接点がある候補だけ表示します");
}

function jobCard(job, label) {
  const industryTags = job.industries.map((industry) => `<span class="industry-chip">${escapeHtml(industry)}</span>`).join("");
  return `
    <article class="job-card" data-job-id="${job.id}">
      <div>
        <span class="route-badge">${escapeHtml(label)}</span>
      </div>
      <h4>${escapeHtml(job.name)}</h4>
      <p>${escapeHtml(job.description)}</p>
      <p class="job-reason">${escapeHtml(job.reason)}</p>
      <div class="industry-row" aria-label="存在する業界">${industryTags}</div>
      <div class="card-footer">
        <span class="score">match ${job.score.toFixed(1)}</span>
        <span class="card-link">詳しく見る →</span>
      </div>
    </article>
  `;
}

function emptyCard(message) {
  return `<div class="job-card empty-card"><p>${escapeHtml(message)}</p></div>`;
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
  state.interpretation = interpretInput(input);
  state.selected = {};
  state.activeJob = null;
  state.route = state.interpretation.confidence === "high" ? "AI解釈: 追加質問" : "AI解釈: 確認中";
  updateHash();
  renderAll();

  if (isReadyForResults()) {
    showLoadingThenResults();
  }
}

function addChoice(axis, id) {
  state.selected[axis] = id;
  state.route = "AI解釈: 足りない情報だけ確認";
  updateHash();

  if (isReadyForResults()) {
    showLoadingThenResults();
    return;
  }

  renderAll();
}

function showLoadingThenResults() {
  state.isLoading = true;
  state.route = "AI解釈 + DB候補抽出";
  renderAll();
  window.setTimeout(() => {
    state.isLoading = false;
    renderAll();
  }, 900);
}

function updateHash() {
  const params = new URLSearchParams();
  params.set("q", state.input);
  Object.entries(state.selected).forEach(([key, value]) => params.set(key, value));
  history.replaceState(null, "", `#${params.toString()}`);
}

function openDetail(jobId) {
  const job = jobs.find((item) => item.id === jobId);
  if (!job) return;
  state.activeJob = job;
  $("detailCategory").textContent = job.industries.join(" / ");
  $("detailTitle").textContent = job.name;
  $("detailDescription").textContent = `${job.description} ${job.reason}`;
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
  state.interpretation = null;
  state.selected = {};
  state.route = "未入力";
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

function hydrateFromHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const query = params.get("q");
  if (!query) return;
  $("queryInput").value = query;
  state.input = query;
  state.interpretation = interpretInput(query);
  state.selected = {};
  ["domain", "action", "lens"].forEach((key) => {
    const value = params.get(key);
    if (value) state.selected[key] = value;
  });
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
    const choice = event.target.closest("[data-choice-id]");
    if (choice) addChoice(choice.dataset.axis, choice.dataset.choiceId);

    const detail = event.target.closest("[data-job-id]");
    if (detail) openDetail(detail.dataset.jobId);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetail();
  });
}

hydrateFromHash();
bindEvents();
renderAll();
