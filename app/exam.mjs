import { CATEGORY_WEIGHTS } from "./exam-weights.mjs";

export const EXAM_POINTS = 100;
export const MIN_QUESTIONS = 20;

/**
 * 원본 배열을 바꾸지 않고 Fisher–Yates 방식으로 섞는다.
 * @template T
 * @param {Array<T>} items 섞을 항목.
 * @param {() => number} random 0 이상 1 미만의 난수 함수.
 * @returns {Array<T>} 새 배열.
 */
function shuffle(items, random) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 남아 있는 카테고리 중 가중치로 하나를 뽑고, 그 안에서 문항 하나를 소비한다.
 * @template T
 * @param {Array<{weight: number, questions: Array<T>}>} groups 카테고리별 잔여 문항.
 * @param {() => number} random 0 이상 1 미만의 난수 함수.
 * @returns {T} 중복 없이 꺼낸 문항.
 */
function drawQuestion(groups, random) {
  // 문제은행 크기와 관계없이 카테고리 가중치로 먼저 영역을 고른다.
  const totalWeight = groups.reduce((total, group) => total + group.weight, 0);
  let draw = random() * totalWeight;
  for (let index = 0; index < groups.length; index++) {
    const group = groups[index];
    if (draw < group.weight || index === groups.length - 1) {
      const question = group.questions.pop();
      if (!group.questions.length) groups.splice(index, 1);
      return question;
    }
    draw -= group.weight;
  }
}

/**
 * 카테고리 가중치로 문항을 추첨하고, 먼저 완성되는 정확히 100점 조합을 시험으로 발행한다.
 * 카테고리는 0문항일 수 있으며 문항당 2~5점이므로 20문항 이상을 보장한다.
 * 원본 문제은행은 변경하지 않는다. 설정에 없는 카테고리의 가중치는 1이다.
 * @template {{id: string, category: string, points: number}} T
 * @param {Array<T>} bank 검증된 문제은행.
 * @param {() => number} [random=Math.random] 재현 가능한 추첨에 주입할 난수 함수.
 * @returns {Array<Omit<T, "id"> & {id: number, questionId: string}>} 시험 번호와 원본 ID를 붙인 문항.
 * @throws {Error} 문제은행에서 100점 조합을 만들 수 없을 때.
 */
export function createExam(bank, random = Math.random) {
  const categories = new Map();
  for (const question of bank) {
    if (!categories.has(question.category)) categories.set(question.category, []);
    categories.get(question.category).push(question);
  }
  const groups = [...categories].map(([category, questions]) => ({
    weight: CATEGORY_WEIGHTS[category] ?? 1,
    questions: shuffle(questions, random),
  }));
  const totals = Array(EXAM_POINTS + 1).fill(null);
  totals[0] = [];

  // 가중 추첨 순서에서 처음 완성되는 100점 조합을 사용한다.
  while (groups.length && !totals[EXAM_POINTS]) {
    const question = drawQuestion(groups, random);
    for (let score = EXAM_POINTS; score >= question.points; score--) {
      if (!totals[score] && totals[score - question.points]) {
        totals[score] = [...totals[score - question.points], question];
      }
    }
  }

  const selected = totals[EXAM_POINTS];
  // 문항당 2~5점이므로 100점 시험은 자동으로 20~50문항이다.
  if (!selected || selected.length < MIN_QUESTIONS) {
    throw new Error("20문항 이상·100점 시험을 구성할 수 없습니다. 문제은행의 문항과 배점을 확인해 주세요.");
  }
  return shuffle(selected, random).map((question, index) => ({
    ...question, questionId: question.id, id: index + 1,
  }));
}
