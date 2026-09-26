import assert from "node:assert/strict";
import template from "../content/question.template.json" with { type: "json" };
import { compileQuestions } from "./question-data.mjs";

const entry = (question) => ({ filename: "javascript.json", data: { category: "JavaScript", questions: [question] } });
const compile = (question) => compileQuestions([entry(question)]);
assert.equal(compile(template)[0].id, template.id);

for (const patch of [
  { id: "Invalid ID" }, { category: "Unknown" }, { type: "Unknown" },
  { points: 1 }, { points: 6 }, { points: 2.5 }, { answer: 0 }, { answer: 6 }, { answer: "1" },
  { prompt: "  " }, { prompt: undefined }, { code: undefined }, { code: " " },
  { options: ["1", "2", "3", "4"] }, { options: ["1", "2", "3", "4", " "] },
  { options: ["1", "1", "3", "4", "5"] }, { options: ["1", " 1 ", "3", "4", "5"] },
  { explanation: " " }, { explanation: undefined }, { typo: true },
  { sources: undefined }, { sources: [] },
  ...["javascript:alert(1)", "http://example.com", "https://", "https://bad host", "https://[", "https://user:pass@example.com"].map((url) => ({ sources: [{ title: "근거", url }] })),
  { sources: [{ title: " ", url: "https://example.com" }] },
  { sources: [{ title: "근거" }] },
  { sources: [{ title: "근거", url: "https://example.com", typo: true }] },
  { sources: [{ title: "근거", url: "https://example.com" }, { title: "중복", url: "https://example.com/" }] },
]) {
  assert.throws(() => compile({ ...template, ...patch }), Error, JSON.stringify(patch));
}
const { code, ...withoutCode } = template;
assert.doesNotThrow(() => compile({ ...withoutCode, type: "개념 판단" }));
for (const type of ["결과 예측", "타입 분석", "버그 찾기", "렌더링 횟수 예측"]) {
  assert.throws(() => compile({ ...withoutCode, type }), /code/);
}
assert.throws(() => compileQuestions([{ ...entry(template), filename: "wrong.json" }]), /파일명/);
assert.throws(() => compileQuestions([entry(template), entry(template)]), /중복 ID/);
assert.throws(() => compileQuestions([entry(template), { filename: "css.json", data: { category: "CSS", questions: [template] } }]), /중복 ID/);
for (const data of [null, [], { category: "JavaScript", questions: [] }, { category: "Unknown", questions: [template] }, { category: "JavaScript", questions: [template], typo: true }]) {
  assert.throws(() => compileQuestions([{ filename: "javascript.json", data }]));
}
assert.throws(() => compileQuestions([entry({ ...template, id: "invalid", answer: 9 })]), /javascript.json/);
assert.throws(() => compileQuestions([{
  filename: "javascript.json", data: { category: "JavaScript", questions: [template, { ...template, id: "another-id" }] },
}]), /지문·코드/);
console.log("카테고리 형식·문항 스키마·파일명·전체 ID 중복 검증을 확인했습니다.");
