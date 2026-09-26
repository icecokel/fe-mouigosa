import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { compileQuestions } from "./question-data.mjs";
import { createExam } from "../app/exam.mjs";
import schema from "../content/category.schema.json" with { type: "json" };

const root = new URL("../", import.meta.url);
function readJson(path) {
  try {
    return JSON.parse(readFileSync(new URL(path, root), "utf8"));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}

try {
  const entries = readdirSync(new URL("content/questions/", root)).sort()
    .filter((filename) => filename.endsWith(".json"))
    .map((filename) => ({ filename, data: readJson(`content/questions/${filename}`) }));
  const questions = compileQuestions(entries);
  for (const category of schema.properties.category.enum) {
    if (!questions.some((question) => question.category === category)) throw new Error(`${category} 문제은행이 누락됐습니다.`);
  }
  const exam = createExam(questions); // 출제 가능한 100점 조합을 빌드 전에 확인한다.
  console.table(entries.map(({ data }) => ({
    category: data.category,
    count: data.questions.length,
    ...Object.fromEntries([2, 3, 4, 5].map(points => [`${points}점`, data.questions.filter(q => q.points === points).length])),
    sampleExamPoints: exam.filter(q => q.category === data.category).reduce((sum, q) => sum + q.points, 0),
  })));
  writeFileSync(new URL("app/questions.generated.json", root), JSON.stringify(questions, null, 2) + "\n");
  console.log(`카테고리 ${entries.length}개 · 문제은행 ${questions.length}문항 검증 완료 · 20문항 이상·100점 출제 가능`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
