import assert from "node:assert/strict";
import { createExam } from "../app/exam.mjs";
import { EXAM_DURATION_MS, restoreExamSession } from "../app/exam-session.mjs";
import { questionBank } from "../app/questions.mjs";

const questions = createExam(questionBank);
const candidate = { name: "응시자", number: "20260926-123456", date: "2026-09-26" };
const deadline = 1_000_000 + EXAM_DURATION_MS;
const choiceNumber = questions.find((question) => question.format === "객관식 단일").id;
const saved = { questions, candidate, answers: { [choiceNumber]: 2 }, deadline, submitted: false };
const active = restoreExamSession(saved, deadline - 60_000);
assert.equal(active.submitted, false);
assert.equal(active.answers[choiceNumber], 2);
assert.deepEqual(active.questions, questions);
assert.equal(restoreExamSession(saved, deadline).submitted, true);
assert.equal(restoreExamSession({ ...saved, submitted: true }, deadline - 60_000).submitted, true);
assert.equal(restoreExamSession({ ...saved, deadline: "tomorrow" }), null);
assert.equal(restoreExamSession({ ...saved, questions: questions.slice(1) }), null);
assert.equal(restoreExamSession({ ...saved, answers: { [choiceNumber]: 99 } }).answers[choiceNumber], undefined);

for (const [points, count] of [[5, 20], [2, 50]]) {
  const issued = questionBank.filter((question) => question.points === points && question.format === "객관식 단일")
    .slice(0, count).map((question, index) => ({ ...question, questionId: question.id, id: index + 1 }));
  assert.equal(issued.length, count);
  const restored = restoreExamSession({ ...saved, questions: issued, answers: { [count]: 5 } }, deadline - 60_000);
  assert.equal(restored.questions.length, count);
  assert.equal(restored.answers[count], 5);
}

const matching = questionBank.find((question) => question.format === "선긋기");
const existingMatchIndex = questions.findIndex((question) => question.questionId === matching.id);
const matchIndex = existingMatchIndex === -1 ? questions.findIndex((question) => question.points === matching.points) : existingMatchIndex;
const withMatching = [...questions];
withMatching[matchIndex] = { ...matching, questionId: matching.id, id: matchIndex + 1 };
const partial = Array(matching.left.length).fill(null);
partial[0] = 1;
assert.deepEqual(restoreExamSession({ ...saved, questions: withMatching, answers: { [matchIndex + 1]: partial } }).answers[matchIndex + 1], partial);

console.log("20~50문항 시험 복원·20분 만료·제출 상태·손상된 저장값·선긋기 부분 답안을 확인했습니다.");
