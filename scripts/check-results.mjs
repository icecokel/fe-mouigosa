import assert from "node:assert/strict";
import { questions } from "../app/questions.mjs";
import { gradeExam } from "../app/results.mjs";

const perfectAnswers = Object.fromEntries(questions.map((question) => [question.id, question.answer]));
const perfect = gradeExam(perfectAnswers);
assert.equal(perfect.maxScore, 62);
assert.equal(perfect.score, perfect.maxScore);
assert.equal(perfect.correctCount, 20);
assert.equal(perfect.unansweredCount, 0);
assert.equal(perfect.mistakes.length, 0);
assert.equal(perfect.weakAreas.length, 0);

const partial = gradeExam({ 1: 3, 2: 1 });
assert.equal(partial.score, 2);
assert.equal(partial.correctCount, 1);
assert.equal(partial.unansweredCount, 18);
assert.equal(partial.mistakes.length, 19);
assert.deepEqual(partial.weakAreas.map((area) => area.category), ["TypeScript"]);
assert.equal(partial.mistakes.find((question) => question.id === 2).selected, 1);
assert.equal(partial.mistakes.find((question) => question.id === 3).selected, null);

console.log("만점·오답·미응답·영역별 취약 판정을 확인했습니다.");
