import assert from "node:assert/strict";
import { createExam } from "../app/exam.mjs";
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
const extraPointCategories = new Set();
const categories = [...new Set(questionBank.map(q => q.category))];
for (let seed = 1; seed <= 1000; seed++) {
  const exam = createExam(questionBank, seededRandom(seed));
  assert.ok(exam.length >= 20);
  const totals = categories.map(category => exam.filter(q => q.category === category).reduce((sum, q) => sum + q.points, 0));
  assert.deepEqual([...totals].sort((a, b) => a - b), [14, 14, 14, 14, 14, 15, 15]);
  categories.forEach((category, i) => { if (totals[i] === 15) extraPointCategories.add(category); });
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
assert.equal(extraPointCategories.size, categories.length);
assert.ok(orders.size > 1);
assert.equal(JSON.stringify(questionBank), before);
const bank = (count, points) => Array.from({ length: count }, (_, i) => ({ id: `q-${i}`, points }));
assert.equal(createExam(bank(20, 5)).length, 20);
assert.equal(createExam(bank(50, 2)).length, 50);
for (const impossible of [[], bank(19, 5), bank(34, 3)]) assert.throws(() => createExam(impossible), /100점/);
// 앞에서 큰 배점을 고르면 막히는 경우에도 뒤의 조합을 찾는다.
assert.equal(createExam([...bank(1, 3), ...bank(20, 5)], () => 0.999).length, 20);
const groups = (sizes, points = 5) => sizes.flatMap((size, category) =>
  Array.from({ length: size }, (_, i) => ({ id: `${category}-${i}`, category: `area-${category}`, points })));
const areaTotals = (exam) => [...new Set(exam.map(q => q.category))]
  .map(category => exam.filter(q => q.category === category).reduce((sum, q) => sum + q.points, 0)).sort((a, b) => a - b);
assert.deepEqual(areaTotals(createExam(groups([10, 10, 10, 10, 10]))), [20, 20, 20, 20, 20]);
// 한 영역에 15점밖에 없으면 가능한 5점 단위 조합 중 가장 균등한 해를 선택한다.
assert.deepEqual(areaTotals(createExam(groups([3, 10, 10, 10, 10]))), [15, 20, 20, 20, 25]);
// 총점만 맞추려고 작은 영역을 통째로 제외해서는 안 된다.
const uneven = [...groups([20]), { id: "rare", category: "rare", points: 5 }];
assert.deepEqual(areaTotals(createExam(uneven)), [5, 95]);
assert.throws(() => createExam([...groups([20]), { id: "rare", category: "rare", points: 3 }]), /100점/);
console.log("1,000회 추첨: 7개 영역 14~15점·100점·최소 20문항·중복 방지·최적 균형 예외 처리를 확인했습니다.");
