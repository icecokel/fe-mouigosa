export const EXAM_POINTS = 100;
export const MIN_QUESTIONS = 20;

function shuffle(items, random) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createExam(bank, random = Math.random) {
  const categories = new Map();
  for (const question of bank) {
    if (!categories.has(question.category)) categories.set(question.category, []);
    categories.get(question.category).push(question);
  }
  const groups = shuffle([...categories.values()], random);
  let totals = Array(EXAM_POINTS + 1).fill(null);
  totals[0] = { cost: 0, questions: [] };

  for (const group of groups) {
    // 카테고리 안에서 만들 수 있는 각 배점 합계의 무작위 문항 조합.
    const subsets = Array(EXAM_POINTS + 1).fill(null);
    subsets[0] = [];
    for (const question of shuffle(group, random)) {
      for (let score = EXAM_POINTS; score >= question.points; score--) {
        if (!subsets[score] && subsets[score - question.points]) {
          subsets[score] = [...subsets[score - question.points], question];
        }
      }
    }

    // 총점 100점 아래에서 카테고리별 균등 목표와의 제곱 오차 합을 최소화한다.
    // 5개 카테고리면 각 20점, 6개면 각 16~17점이 최적이다.
    const next = Array(EXAM_POINTS + 1).fill(null);
    for (let total = 0; total <= EXAM_POINTS; total++) {
      if (!totals[total]) continue;
      for (let score = 1; score + total <= EXAM_POINTS; score++) {
        if (!subsets[score]) continue;
        const cost = totals[total].cost + (score * groups.length - EXAM_POINTS) ** 2;
        const previous = next[total + score];
        if (!previous || cost < previous.cost || (cost === previous.cost && random() < 0.5)) {
          next[total + score] = { cost, questions: [...totals[total].questions, ...subsets[score]] };
        }
      }
    }
    totals = next;
  }

  const selected = totals[EXAM_POINTS]?.questions;
  // 문항당 2~5점이므로 100점 시험은 자동으로 20~50문항이다.
  if (!selected || selected.length < MIN_QUESTIONS) {
    throw new Error("모든 카테고리를 포함한 20문항 이상·100점 시험을 구성할 수 없습니다. 문제은행의 문항과 배점을 확인해 주세요.");
  }
  return shuffle(selected, random).map((question, index) => ({
    ...question, questionId: question.id, id: index + 1,
  }));
}
