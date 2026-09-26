export const EXAM_SESSION_KEY = "fe-mouigosa:exam:v1";
export const EXAM_DURATION_MS = 20 * 60 * 1000;

export function restoreExamSession(saved, now = Date.now()) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return null;
  const { questions, candidate, answers, deadline, submitted } = saved;
  if (!Array.isArray(questions) || questions.length < 20 ||
    questions.some((question, index) => !question || question.id !== index + 1 ||
      typeof question.questionId !== "string" || typeof question.prompt !== "string" ||
      typeof question.category !== "string" || !Number.isInteger(question.points) ||
      question.points < 2 || question.points > 5 || !Array.isArray(question.sources) ||
      typeof question.explanation !== "string" ||
      ((question.format === "객관식 단일" || question.format === "객관식 중복") && !Array.isArray(question.options)) ||
      (question.format === "선긋기" && (!Array.isArray(question.left) || !Array.isArray(question.right))) ||
      !["객관식 단일", "객관식 중복", "주관식 단답", "선긋기"].includes(question.format)) ||
    questions.reduce((sum, question) => sum + question.points, 0) !== 100 ||
    new Set(questions.map((question) => question.questionId)).size !== questions.length ||
    !candidate || typeof candidate.name !== "string" || !candidate.name.trim() ||
    typeof candidate.number !== "string" || typeof candidate.date !== "string" ||
    !answers || typeof answers !== "object" || Array.isArray(answers) ||
    !Number.isFinite(deadline) || typeof submitted !== "boolean") return null;

  const safeAnswers = {};
  for (const question of questions) {
    const value = answers[question.id];
    if (question.format === "객관식 단일" && Number.isInteger(value) && value >= 1 && value <= question.options.length) safeAnswers[question.id] = value;
    if (question.format === "객관식 중복" && Array.isArray(value) && new Set(value).size === value.length &&
      value.every((number) => Number.isInteger(number) && number >= 1 && number <= question.options.length)) safeAnswers[question.id] = value;
    if (question.format === "주관식 단답" && typeof value === "string" && value.length <= 80) safeAnswers[question.id] = value;
    if (question.format === "선긋기" && Array.isArray(value) && value.length === question.left.length &&
      value.every((number) => number === null || (Number.isInteger(number) && number >= 1 && number <= question.right.length))) safeAnswers[question.id] = value;
  }
  return { questions, candidate, answers: safeAnswers, deadline, submitted: submitted || now >= deadline };
}
