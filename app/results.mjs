export function connectMatch(answer, leftIndex, rightNumber, count) {
  const next = Array.from({ length: count }, (_, index) => answer?.[index] ?? null);
  const previousLeft = next.indexOf(rightNumber);
  if (previousLeft !== -1) next[previousLeft] = null;
  next[leftIndex] = rightNumber;
  return next;
}

export function isAnswered(question, selected) {
  if (question.format === "객관식 단일") return Number.isInteger(selected) && selected >= 1 && selected <= question.options.length;
  if (question.format === "객관식 중복") {
    return Array.isArray(selected) && selected.length > 0 && new Set(selected).size === selected.length &&
      selected.every((value) => Number.isInteger(value) && value >= 1 && value <= question.options.length);
  }
  if (question.format === "주관식 단답") return typeof selected === "string" && selected.trim().length > 0;
  if (question.format === "선긋기") {
    return Array.isArray(selected) && selected.length === question.left.length &&
      new Set(selected).size === selected.length &&
      selected.every((value) => Number.isInteger(value) && value >= 1 && value <= question.right.length);
  }
  return false;
}

function isCorrectAnswer(question, selected) {
  if (!isAnswered(question, selected)) return false;
  if (question.format === "객관식 단일") return selected === question.answer;
  if (question.format === "객관식 중복") {
    return selected.length === question.answer.length && selected.every((value) => question.answer.includes(value));
  }
  if (question.format === "주관식 단답") return selected.trim() === question.answer.trim();
  return selected.every((value, index) => value === question.answer[index]);
}

export function gradeExam(answers, questions) {
  const graded = questions.map((question) => {
    const selected = answers[question.id] ?? null;
    return { ...question, selected, isAnswered: isAnswered(question, selected), isCorrect: isCorrectAnswer(question, selected) };
  });
  const areas = [...new Set(questions.map((question) => question.category))].map((category) => {
    const items = graded.filter((question) => question.category === category);
    return {
      category,
      earned: items.reduce((score, question) => score + (question.isCorrect ? question.points : 0), 0),
      max: items.reduce((score, question) => score + question.points, 0),
      correct: items.filter((question) => question.isCorrect).length,
      attempted: items.filter((question) => question.isAnswered).length,
      count: items.length,
    };
  });
  const attemptedAreas = areas.filter((area) => area.attempted > 0);
  const lowestRate = Math.min(...attemptedAreas.map((area) => area.correct / area.attempted));

  return {
    score: areas.reduce((score, area) => score + area.earned, 0),
    maxScore: areas.reduce((score, area) => score + area.max, 0),
    correctCount: graded.filter((question) => question.isCorrect).length,
    unansweredCount: graded.filter((question) => !question.isAnswered).length,
    answerSheet: graded,
    areas,
    weakAreas: attemptedAreas.filter((area) => area.correct < area.attempted && area.correct / area.attempted === lowestRate),
    mistakes: graded.filter((question) => !question.isCorrect),
  };
}

export function resultShareData(report) {
  return {
    title: "프론트엔드 개발자 모의평가 성적표",
    text: `프론트엔드 모의평가 ${report.score}/${report.maxScore}점 · 정답 ${report.correctCount}/${report.answerSheet.length}문항\n나도 응시하기`,
    url: "https://icecokel.github.io/fe-mouigosa/",
  };
}

export async function shareExamResult(report, browser = navigator) {
  const data = resultShareData(report);
  if (browser.share) {
    try {
      await browser.share(data);
      return { message: "공유 창에 결과를 전달했습니다." };
    } catch (error) {
      if (error?.name === "AbortError") return {};
    }
  }
  const text = `${data.text}\n${data.url}`;
  try {
    await browser.clipboard.writeText(text);
    return { message: "점수 요약과 응시 링크를 복사했습니다." };
  } catch {
    return { message: "자동 복사를 사용할 수 없습니다. 아래 내용을 직접 복사해 주세요.", text };
  }
}
