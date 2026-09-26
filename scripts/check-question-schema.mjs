import assert from "node:assert/strict";
import template from "../content/question.template.json" with { type: "json" };
import { compileQuestions, validateQuestionData } from "./question-data.mjs";

const entry = (question) => ({ filename: "javascript.json", data: { category: "JavaScript", questions: [question] } });
const compile = (question) => compileQuestions([entry(question)]);
assert.deepEqual(validateQuestionData(template, "JavaScript"), []);
for (const field of ["category", "type", "format"]) {
  assert.match(validateQuestionData({ ...template, [field]: undefined }).join(" "), new RegExp(field));
}
assert.match(validateQuestionData(template, "CSS").join(" "), /category/);
assert.match(validateQuestionData({ ...template, options: ["1", " 1 ", "3", "4", "5"] }).join(" "), /선택지/);
assert.match(validateQuestionData({
  ...template, sources: [{ title: "근거", url: "https://example.com" }, { title: "중복", url: "https://example.com/" }],
}).join(" "), /근거 URL/);
assert.equal(compile(template)[0].id, template.id);
for (const [category, filename] of [["Next.js", "nextjs.json"], ["Accessibility & SEO", "accessibility-seo.json"]]) {
  assert.doesNotThrow(() => compileQuestions([{
    filename, data: { category, questions: [{ ...template, category }] },
  }]));
}

for (const patch of [
  { id: "Invalid ID" }, { category: "Unknown" }, { category: "CSS" }, { category: undefined },
  { type: "Unknown" }, { type: undefined }, { format: "Unknown" }, { format: undefined },
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
const multiple = { ...template, format: "객관식 중복", answer: [1, 3] };
assert.doesNotThrow(() => compile(multiple));
for (const answer of [[1], [1, 1], [0, 2], 1]) {
  assert.throws(() => compile({ ...multiple, answer }), Error);
}
const { options, ...withoutOptions } = template;
const short = { ...withoutOptions, format: "주관식 단답", answer: "정답" };
assert.doesNotThrow(() => compile(short));
assert.throws(() => compile({ ...short, answer: "  " }), Error);
assert.throws(() => compile({ ...short, answer: "x".repeat(81) }), Error);
const matching = {
  ...withoutOptions, format: "선긋기",
  left: ["왼쪽 하나", "왼쪽 둘", "왼쪽 셋"],
  right: ["오른쪽 하나", "오른쪽 둘", "오른쪽 셋"],
  answer: [2, 3, 1],
};
assert.doesNotThrow(() => compile(matching));
for (const patch of [
  { left: ["왼쪽 하나", "왼쪽 둘"] },
  { right: ["오른쪽 하나", "오른쪽 둘", "오른쪽 하나"] },
  { answer: [1, 2] }, { answer: [1, 1, 2] }, { answer: [1, 2, 4] },
]) {
  assert.throws(() => compile({ ...matching, ...patch }), Error);
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
