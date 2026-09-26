import assert from "node:assert/strict";
import { createExam } from "../app/exam.mjs";
import { CATEGORY_WEIGHTS } from "../app/exam-weights.mjs";
import { questionBank } from "../app/questions.mjs";

function seededRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
const before = JSON.stringify(questionBank);
const combinations = new Set();
const orders = new Set();
const categories = [...new Set(questionBank.map(q => q.category))];
const selectedPoints = Object.fromEntries(categories.map(category => [category, 0]));
assert.deepEqual(Object.keys(CATEGORY_WEIGHTS).sort(), [...categories].sort());
assert.ok(Object.values(CATEGORY_WEIGHTS).every(weight => Number.isInteger(weight) && weight > 0));
for (let seed = 1; seed <= 1000; seed++) {
  const exam = createExam(questionBank, seededRandom(seed));
  assert.ok(exam.length >= 20);
  for (const question of exam) selectedPoints[question.category] += question.points;
  assert.equal(exam.reduce((sum, q) => sum + q.points, 0), 100);
  assert.equal(new Set(exam.map(q => q.questionId)).size, exam.length);
  assert.deepEqual(exam.map(q => q.id), Array.from({ length: exam.length }, (_, i) => i + 1));
  for (const { questionId, id, ...question } of exam) {
    assert.deepEqual({ ...question, id: questionId }, questionBank.find(q => q.id === questionId));
  }
  combinations.add(exam.map(q => q.questionId).sort().join(","));
  orders.add(exam.map(q => q.questionId).join(","));
}
assert.ok(combinations.size > 1);
assert.ok(selectedPoints.JavaScript >= selectedPoints["Design System"] * 1.5);
assert.ok(orders.size > 1);
assert.equal(JSON.stringify(questionBank), before);
const bank = (count, points) => Array.from({ length: count }, (_, i) => ({ id: `q-${i}`, category: "JavaScript", points }));
assert.equal(createExam(bank(20, 5)).length, 20);
assert.equal(createExam(bank(50, 2)).length, 50);
for (const impossible of [[], bank(19, 5), bank(34, 3)]) assert.throws(() => createExam(impossible), /100점/);
// 앞에서 큰 배점을 고르면 막히는 경우에도 뒤의 조합을 찾는다.
assert.equal(createExam([...bank(1, 3), ...bank(20, 5)], () => 0.999).length, 20);
// 100점을 만들 수 없는 영역은 제외해도 시험 생성이 가능해야 한다.
const withoutAi = createExam([...bank(20, 5), { id: "rare", category: "AI Concepts", points: 3 }]);
assert.ok(withoutAi.every(question => question.category === "JavaScript"));
console.log(`1,000회 추첨: ${categories.length}개 영역 가중치 반영·100점·최소 20문항·중복 방지·영역 제외 가능 확인`);
