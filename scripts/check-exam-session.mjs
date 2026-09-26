import assert from "node:assert/strict";
import { createExam } from "../app/exam.mjs";
import {
  EXAM_DURATION_MS, chooseExamOption, createExamSession, recordExamAnswer,
  restoreExamSession, submitExamSession,
} from "../app/exam-session.mjs";
import { questionBank } from "../app/questions.mjs";

const questions = createExam(questionBank);
const candidate = { name: "응시자", number: "20260926-123456", date: "2026-09-26" };
const deadline = 1_000_000 + EXAM_DURATION_MS;
const activeNow = deadline - 60_000;
const newSession = createExamSession(questions, candidate, 1_000_000);
assert.deepEqual(newSession, { questions, candidate, answers: {}, deadline, submitted: false });
const input = [1, null];
const answered = recordExamAnswer(newSession, 1, input, activeNow);
input[0] = 2;
assert.deepEqual(answered.answers[1], [1, null]);
assert.deepEqual(newSession.answers, {});
assert.notStrictEqual(answered.answers, newSession.answers);
const single = { id: 1, format: "객관식 단일", options: ["A", "B", "C"] };
assert.equal(chooseExamOption(newSession, single, 2, activeNow).answers[1], 2);
assert.strictEqual(chooseExamOption(newSession, single, 4, activeNow), newSession);
const multiple = { id: 2, format: "객관식 중복", options: ["A", "B", "C"] };
const first = chooseExamOption(newSession, multiple, 3, activeNow);
const second = chooseExamOption(first, multiple, 1, activeNow);
const third = chooseExamOption(second, multiple, 3, activeNow);
assert.deepEqual(first.answers[2], [3]);
assert.deepEqual(second.answers[2], [1, 3]);
assert.deepEqual(third.answers[2], [1]);
assert.deepEqual(newSession.answers, {});
const submittedSession = submitExamSession(second);
assert.equal(submittedSession.submitted, true);
assert.equal(second.submitted, false);
assert.strictEqual(submitExamSession(submittedSession), submittedSession);
assert.strictEqual(recordExamAnswer(submittedSession, 2, 1, activeNow), submittedSession);
assert.strictEqual(chooseExamOption(submittedSession, multiple, 2, activeNow), submittedSession);
assert.strictEqual(recordExamAnswer(newSession, 1, 2, deadline), newSession);
assert.strictEqual(chooseExamOption(newSession, single, 2, deadline), newSession);
assert.strictEqual(chooseExamOption(newSession, multiple, 2, deadline + 1), newSession);
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

console.log("시험 생성·답안 변경·선택지 토글·제출/만료 후 답안 차단·20~50문항 복원·손상된 저장값을 확인했습니다.");
