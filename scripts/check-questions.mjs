import assert from "node:assert/strict";
import { questions } from "../app/questions.mjs";

const categories = new Set(["JavaScript", "TypeScript", "React", "Browser", "CSS", "Web Performance"]);
const types = new Set(["개념 판단", "결과 예측", "타입 분석", "버그 찾기", "렌더링 횟수 예측", "브라우저 동작"]);

assert.equal(questions.length, 20);
assert.deepEqual(questions.map(({ id }) => id), Array.from({ length: 20 }, (_, index) => index + 1));
assert.deepEqual(new Set(questions.map(({ category }) => category)), categories);
assert.deepEqual(new Set(questions.map(({ type }) => type)), types);
assert.deepEqual(new Set(questions.map(({ points }) => points)), new Set([2, 3, 4, 5]));

for (const question of questions) {
  assert.ok(question.prompt.trim(), `${question.id}번 지문 누락`);
  assert.ok([2, 3, 4, 5].includes(question.points), `${question.id}번 배점 오류`);
  assert.ok(Number.isInteger(question.answer) && question.answer >= 1 && question.answer <= 5, `${question.id}번 정답 오류`);
  assert.equal(question.options.length, 5, `${question.id}번 선택지 개수 오류`);
  assert.equal(new Set(question.options).size, 5, `${question.id}번 선택지 중복`);
}

console.log("20개 문항의 번호·카테고리·유형·배점·정답·5개 선택지를 확인했습니다.");
