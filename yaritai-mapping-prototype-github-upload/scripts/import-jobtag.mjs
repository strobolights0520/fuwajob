import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const RAW_DIR = "data/raw/jobtag";
const OUT_DIR = "data/processed/jobtag";
const DESCRIPTION_FILE = join(RAW_DIR, "IPD_DL_description_7_01.csv");
const NUMERIC_FILE = join(RAW_DIR, "IPD_DL_numeric_7_00.csv");

const SOURCE = {
  page_url: "https://shigoto.mhlw.go.jp/User/download",
  description_file: "IPD_DL_description_7_01.csv",
  description_version: "7.01",
  description_published_on: "2026-06-04",
  numeric_file: "IPD_DL_numeric_7_00.csv",
  numeric_version: "7.00",
  numeric_published_on: "2026-03-17",
  downloaded_on: "2026-07-15",
  attribution:
    "独立行政法人労働政策研究・研修機構（JILPT）作成「職業情報データベース」を、職業情報提供サイト（job tag）よりダウンロードし加工して作成",
};

const SKILL_START = "読解力";
const SKILL_END = "人材管理";
const KNOWLEDGE_START = "ビジネスと経営";
const KNOWLEDGE_END = "コミュニケーションとメディア";

mkdirSync(OUT_DIR, { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function readCp932Csv(path) {
  const text = new TextDecoder("shift_jis").decode(readFileSync(path));
  return parseCsv(text);
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function numberOrNull(value) {
  const text = clean(value);
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function buildObjects(rows, headerRowIndex, dataStartIndex) {
  const headers = rows[headerRowIndex].map(clean);
  return rows
    .slice(dataStartIndex)
    .filter((row) => /^\d+$/.test(clean(row[2])) && clean(row[3]))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        if (header) record[header] = clean(row[index]);
      });
      return record;
    });
}

function sourceJobId(record) {
  return clean(record["収録番号"]);
}

function jobId(sourceId) {
  return `JT${String(sourceId).padStart(4, "0")}`;
}

function valuesByPrefix(record, prefix) {
  return Object.entries(record)
    .filter(([key, value]) => key.startsWith(prefix) && clean(value))
    .map(([key, value]) => ({ key, value: clean(value) }));
}

function suffixNo(key, prefix) {
  return key.replace(prefix, "").normalize("NFKC");
}

function valuesInRange(record, headers, startName, endName) {
  const start = headers.indexOf(startName);
  const end = headers.indexOf(endName);
  if (start < 0 || end < start) return [];
  return headers.slice(start, end + 1).flatMap((name) => {
    const score = numberOrNull(record[name]);
    const irrelevant = clean(record[`${name}_無関係フラグ`]) === "1";
    return score == null ? [] : [{ name, score, irrelevant }];
  });
}

function taskValues(record) {
  const items = [];
  for (let i = 1; i <= 37; i += 1) {
    const task = clean(record[`タスク${i}`]);
    if (!task) continue;
    items.push({
      task_no: i,
      task_text: task,
      execution_rate: numberOrNull(record[`タスク${i}_実施率`]),
      importance: numberOrNull(record[`タスク${i}_重要度`]),
    });
  }
  return items;
}

function toCsv(rows, columns) {
  const escape = (value) => {
    const text = value == null ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escape(row[column])).join(",")),
  ].join("\n") + "\n";
}

function writeJson(name, data) {
  writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, 2), "utf8");
}

function writeCsv(name, rows, columns) {
  writeFileSync(join(OUT_DIR, name), toCsv(rows, columns), "utf8");
}

const descriptionRows = readCp932Csv(DESCRIPTION_FILE);
const numericRows = readCp932Csv(NUMERIC_FILE);
const descriptionRecords = buildObjects(descriptionRows, 12, 14);
const numericRecords = buildObjects(numericRows, 16, 18);
const numericHeaders = numericRows[16].map(clean);
const numericBySourceId = new Map(numericRecords.map((record) => [sourceJobId(record), record]));

const jobs = [];
const aliases = [];
const classifications = [];
const qualifications = [];
const skills = [];
const knowledge = [];
const tasks = [];

for (const record of descriptionRecords) {
  const sourceId = sourceJobId(record);
  const id = jobId(sourceId);
  const numeric = numericBySourceId.get(sourceId) || {};

  jobs.push({
    job_id: id,
    source_job_id: sourceId,
    name: record["職業名"],
    description_short: record["簡易説明文"],
    description: record["どんな職業か"],
    how_to_get: record["就くには"],
    working_conditions: record["労働条件の特徴"],
    source_url: SOURCE.page_url,
    source_file: SOURCE.description_file,
    source_version: SOURCE.description_version,
    source_published_on: SOURCE.description_published_on,
  });

  valuesByPrefix(record, "別名").forEach(({ key, value }) => {
    aliases.push({ job_id: id, source_job_id: sourceId, alias_no: suffixNo(key, "別名"), alias_name: value });
  });

  ["主な厚労省編職業分類", "厚労省編職業分類１", "厚労省編職業分類２", "厚労省編職業分類３", "厚労省編職業分類４", "厚労省編職業分類５", "厚労省編職業分類６", "主な日本標準職業分類", "日本標準職業分類１", "日本標準職業分類２", "日本標準職業分類３", "日本標準職業分類４", "日本標準職業分類５"]
    .forEach((key) => {
      if (record[key]) {
        classifications.push({ job_id: id, source_job_id: sourceId, classification_type: key, classification_code: record[key] });
      }
    });

  valuesByPrefix(record, "関連資格").forEach(({ key, value }) => {
    qualifications.push({ job_id: id, source_job_id: sourceId, qualification_no: suffixNo(key, "関連資格"), qualification_name: value });
  });

  valuesInRange(numeric, numericHeaders, SKILL_START, SKILL_END).forEach((item) => {
    skills.push({ job_id: id, source_job_id: sourceId, skill_name: item.name, score: item.score, irrelevant: item.irrelevant ? 1 : 0 });
  });

  valuesInRange(numeric, numericHeaders, KNOWLEDGE_START, KNOWLEDGE_END).forEach((item) => {
    knowledge.push({ job_id: id, source_job_id: sourceId, knowledge_name: item.name, score: item.score, irrelevant: item.irrelevant ? 1 : 0 });
  });

  taskValues(numeric).forEach((item) => {
    tasks.push({ job_id: id, source_job_id: sourceId, ...item });
  });
}

const prototypeJobs = jobs.slice(0, 100).map((job) => ({
  job_id: job.job_id,
  name: job.name,
  description: job.description_short || job.description,
  skills: skills
    .filter((skill) => skill.job_id === job.job_id && !skill.irrelevant)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((skill) => skill.skill_name),
  tasks: tasks
    .filter((task) => task.job_id === job.job_id)
    .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
    .slice(0, 5)
    .map((task) => task.task_text),
}));

writeJson("jobs.json", jobs);
writeJson("prototype_jobs_sample.json", prototypeJobs);
writeCsv("jobs.csv", jobs, ["job_id", "source_job_id", "name", "description_short", "description", "how_to_get", "working_conditions", "source_url", "source_file", "source_version", "source_published_on"]);
writeCsv("job_aliases.csv", aliases, ["job_id", "source_job_id", "alias_no", "alias_name"]);
writeCsv("job_classifications.csv", classifications, ["job_id", "source_job_id", "classification_type", "classification_code"]);
writeCsv("job_qualifications.csv", qualifications, ["job_id", "source_job_id", "qualification_no", "qualification_name"]);
writeCsv("job_skills.csv", skills, ["job_id", "source_job_id", "skill_name", "score", "irrelevant"]);
writeCsv("job_knowledge.csv", knowledge, ["job_id", "source_job_id", "knowledge_name", "score", "irrelevant"]);
writeCsv("job_tasks.csv", tasks, ["job_id", "source_job_id", "task_no", "task_text", "execution_rate", "importance"]);
writeJson("source_manifest.json", SOURCE);
writeJson("import_summary.json", {
  source: SOURCE,
  raw_files: [basename(DESCRIPTION_FILE), basename(NUMERIC_FILE)],
  counts: {
    jobs: jobs.length,
    numeric_records: numericRecords.length,
    aliases: aliases.length,
    classifications: classifications.length,
    qualifications: qualifications.length,
    skills: skills.length,
    knowledge: knowledge.length,
    tasks: tasks.length,
    prototype_jobs_sample: prototypeJobs.length,
  },
});

console.log(`Imported ${jobs.length} jobs into ${OUT_DIR}`);
