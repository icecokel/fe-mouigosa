import assert from "node:assert/strict";
import { questionBank } from "../app/questions.mjs";
import { createExam } from "../app/exam.mjs";
const questions = createExam(questionBank);
import { connectMatch, gradeExam, resultShareData, shareExamResult } from "../app/results.mjs";

const perfectAnswers = Object.fromEntries(questions.map((question) => [question.id, question.answer]));
const perfect = gradeExam(perfectAnswers, questions);
assert.equal(perfect.maxScore, 100);
assert.equal(perfect.score, perfect.maxScore);
assert.equal(perfect.correctCount, questions.length);
assert.equal(perfect.unansweredCount, 0);
assert.equal(perfect.mistakes.length, 0);
assert.equal(perfect.weakAreas.length, 0);
assert.equal(perfect.answerSheet.length, questions.length);
assert.ok(perfect.answerSheet.every((q) => q.isCorrect && q.explanation && q.sources.length));
assert.deepEqual(perfect.answerSheet.map((q) => q.questionId), questions.map((q) => q.questionId));
assert.match(resultShareData(perfect).text, /100\/100점/);
assert.equal(resultShareData(perfect).url, "https://icecokel.github.io/fe-mouigosa/");

const first = questions.find((question) => question.format === "객관식 단일");
const partial = gradeExam({ [first.id]: first.answer }, questions);
assert.equal(partial.score, first.points);
assert.equal(partial.correctCount, 1);
assert.equal(partial.unansweredCount, questions.length - 1);
assert.equal(partial.mistakes.length, questions.length - 1);
assert.ok(partial.mistakes.every((question) => question.selected === null));
assert.equal(partial.weakAreas.length, 0);
assert.equal(partial.answerSheet.filter((q) => q.isCorrect).length, 1);
assert.match(resultShareData(partial).text, new RegExp(`${first.points}/100점`));

const wrongAnswer = first.answer % 5 + 1;
const wrong = gradeExam({ [first.id]: wrongAnswer }, questions);
assert.equal(wrong.score, 0);
assert.equal(wrong.correctCount, 0);
assert.equal(wrong.mistakes.length, questions.length);
assert.deepEqual(wrong.weakAreas.map((area) => area.category), [first.category]);
assert.equal(wrong.mistakes.find((question) => question.id === first.id).selected, wrongAnswer);

const formats = [
  questionBank.find((question) => question.format === "객관식 중복"),
  questionBank.find((question) => question.format === "주관식 단답"),
  questionBank.find((question) => question.format === "선긋기"),
];
assert.ok(formats.every(Boolean));
const [multiple, short, matching] = formats;
assert.deepEqual(connectMatch([2, null, null], 1, 2, 3), [null, 2, null]);
assert.deepEqual(connectMatch([2, 3, null], 2, 1, 3), [2, 3, 1]);
const formattedPerfect = gradeExam(Object.fromEntries(formats.map((question) => [question.id, question.answer])), formats);
assert.equal(formattedPerfect.score, formats.reduce((score, question) => score + question.points, 0));
assert.equal(formattedPerfect.correctCount, 3);
assert.equal(gradeExam({ [multiple.id]: [...multiple.answer].reverse() }, [multiple]).score, multiple.points);
assert.equal(gradeExam({ [multiple.id]: [multiple.answer[0]] }, [multiple]).score, 0);
assert.equal(gradeExam({ [multiple.id]: [multiple.answer[0], multiple.answer[0]] }, [multiple]).score, 0);
assert.equal(gradeExam({ [short.id]: "  " + short.answer + "  " }, [short]).score, short.points);
assert.equal(gradeExam({ [short.id]: short.answer.toLowerCase() }, [short]).score, 0);
assert.equal(gradeExam({ [matching.id]: [matching.answer[0], null, matching.answer[2]] }, [matching]).unansweredCount, 1);
assert.equal(gradeExam({ [matching.id]: [...matching.answer].reverse() }, [matching]).score, 0);

const empty = gradeExam({}, questions);
assert.equal(empty.unansweredCount, questions.length);
assert.equal(empty.weakAreas.length, 0);
assert.ok(empty.answerSheet.every((q) => q.selected === null));
console.log("만점·오답·미응답·영역별 취약 판정을 확인했습니다.");

const otherExam = createExam(questionBank).reverse().map((q, i) => ({ ...q, id: i + 1 }));
const otherAnswers = Object.fromEntries(otherExam.map(q => [q.id, q.answer]));
assert.equal(gradeExam(otherAnswers, otherExam).score, 100);

let shared, copied;
const clipboard = { writeText: async (text) => { copied = text; } };
assert.ok((await shareExamResult(perfect, { share: async (data) => { shared = data; }, clipboard })).message);
assert.deepEqual(shared, resultShareData(perfect));
assert.equal(copied, undefined);
assert.deepEqual(await shareExamResult(perfect, { share: async () => { throw { name: "AbortError" }; }, clipboard }), {});
assert.equal(copied, undefined, "공유 취소 후 자동 복사하지 않습니다.");
for (const browser of [{ clipboard }, { clipboard, share: async () => { throw new Error("blocked"); } }]) {
  assert.match((await shareExamResult(partial, browser)).message, /복사했습니다/);
  assert.equal(copied, `${resultShareData(partial).text}\n${resultShareData(partial).url}`);
}
for (const browser of [{}, { clipboard: { writeText: async () => { throw new Error("denied"); } } }]) {
  const fallback = await shareExamResult(empty, browser);
  assert.match(fallback.message, /직접 복사/);
  assert.match(fallback.text, /0\/100점/);
}
console.log("전체 해답지 보존·공유 성공·취소·클립보드 복사·수동 복사를 확인했습니다.");
