import { questions } from "./questions.mjs";

export function gradeExam(answers) {
  const graded = questions.map((question) => ({
    ...question,
    selected: answers[question.id] ?? null,
    isCorrect: answers[question.id] === question.answer,
  }));
  const areas = [...new Set(questions.map((question) => question.category))].map((category) => {
    const items = graded.filter((question) => question.category === category);
    return {
      category,
      earned: items.reduce((score, question) => score + (question.isCorrect ? question.points : 0), 0),
      max: items.reduce((score, question) => score + question.points, 0),
      correct: items.filter((question) => question.isCorrect).length,
      attempted: items.filter((question) => question.selected !== null).length,
      count: items.length,
    };
  });
  const attemptedAreas = areas.filter((area) => area.attempted > 0);
  const lowestRate = Math.min(...attemptedAreas.map((area) => area.correct / area.attempted));

  return {
    score: areas.reduce((score, area) => score + area.earned, 0),
    maxScore: areas.reduce((score, area) => score + area.max, 0),
    correctCount: graded.filter((question) => question.isCorrect).length,
    unansweredCount: graded.filter((question) => question.selected === null).length,
    areas,
    weakAreas: attemptedAreas.filter((area) => area.correct < area.attempted && area.correct / area.attempted === lowestRate),
    mistakes: graded.filter((question) => !question.isCorrect),
  };
}
