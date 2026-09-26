export const EXAM_SESSION_KEY = "fe-mouigosa:exam:v1";
export const EXAM_DURATION_MS = 20 * 60 * 1000;

/**
 * @typedef {object} ExamQuestion
 * @property {number} id 시험지에서 1부터 시작하는 문항 번호.
 * @property {string} questionId 문제은행의 고유 ID.
 * @property {string} category 출제 카테고리.
 * @property {string} type 문제의 내용 유형.
 * @property {number} points 문항 배점(2~5점).
 * @property {"객관식 단일" | "객관식 중복" | "주관식 단답" | "선긋기"} format 답안 입력 형태.
 * @property {string} prompt 문제 본문.
 * @property {Array<string>} [options] 객관식 선택지.
 * @property {Array<string>} [left] 선긋기 왼쪽 항목.
 * @property {Array<string>} [right] 선긋기 오른쪽 항목.
 * @property {number | string | Array<number>} answer 형식에 따른 정답.
 * @property {string} explanation 해설.
 * @property {Array<{title: string, url: string}>} sources 근거 자료.
 */

/**
 * @typedef {object} ExamSession
 * @property {Array<ExamQuestion>} questions 출제 순서대로 1부터 번호가 매겨진 문제 목록.
 * @property {{name: string, number: string, date: string, affiliation?: string}} candidate 수험자 정보.
 * @property {Record<number, number | string | Array<number | null>>} answers 시험지 문항 번호를 키로 하는 답안.
 * @property {number} deadline 시험 종료 시각(Unix 밀리초).
 * @property {boolean} submitted 수동 제출 또는 시간 만료로 종료됐는지 여부.
 */

/**
 * 새 시험의 응시 상태를 만든다. 문제와 수험자 정보는 호출자가 전달한 값을 그대로 사용한다.
 * @param {Array<ExamQuestion>} questions 출제되어 번호가 매겨진 문제 목록.
 * @param {ExamSession["candidate"]} candidate 수험자 정보.
 * @param {number} [now=Date.now()] 시작 시각(Unix 밀리초).
 * @returns {ExamSession} 빈 답안과 시작 20분 뒤 종료 시각을 가진 새 세션.
 */
export function createExamSession(questions, candidate, now = Date.now()) {
  return { questions, candidate, answers: {}, deadline: now + EXAM_DURATION_MS, submitted: false };
}

/**
 * 답안을 새 세션에 기록한다. 제출됐거나 제한시간이 지난 시험에서는 원래 세션을 반환한다.
 * @param {ExamSession} session 현재 응시 상태.
 * @param {number} questionId 시험지의 문항 번호(question.id). 문제은행 고유 ID가 아니다.
 * @param {number | string | Array<number | null>} value 선택 번호, 단답형 문자열 또는 선긋기 답안.
 * @param {number} [now=Date.now()] 답안을 기록하는 시각(Unix 밀리초).
 * @returns {ExamSession} 새 답안 객체를 포함한 세션. 제출됐거나 만료됐으면 입력 세션.
 */
export function recordExamAnswer(session, questionId, value, now = Date.now()) {
  if (session.submitted || now >= session.deadline) return session;
  return { ...session, answers: { ...session.answers, [questionId]: Array.isArray(value) ? [...value] : value } };
}

/**
 * 객관식 선택지를 고른다. 단일 선택은 교체하고 중복 선택은 토글한 뒤 오름차순으로 정렬한다.
 * 제출됐거나 제한시간이 지난 시험의 선택은 무시한다.
 * @param {ExamSession} session 현재 응시 상태.
 * @param {ExamQuestion} question 출제된 객관식 문제.
 * @param {number} optionNumber 1부터 시작하는 선택지 번호.
 * @param {number} [now=Date.now()] 선택하는 시각(Unix 밀리초).
 * @returns {ExamSession} 갱신된 세션. 제출·만료됐거나 유효하지 않은 선택이면 입력 세션.
 */
export function chooseExamOption(session, question, optionNumber, now = Date.now()) {
  if (session.submitted || now >= session.deadline || !question || !["객관식 단일", "객관식 중복"].includes(question.format) ||
    !Array.isArray(question.options) || !Number.isInteger(optionNumber) ||
    optionNumber < 1 || optionNumber > question.options.length) return session;
  if (question.format === "객관식 단일") return recordExamAnswer(session, question.id, optionNumber, now);
  const selected = Array.isArray(session.answers[question.id]) ? session.answers[question.id] : [];
  const next = selected.includes(optionNumber)
    ? selected.filter((number) => number !== optionNumber)
    : [...selected, optionNumber];
  return recordExamAnswer(session, question.id, next.sort((a, b) => a - b), now);
}

/**
 * 시험을 종료한다. 이미 종료된 세션은 그대로 반환한다.
 * @param {ExamSession} session 현재 응시 상태.
 * @returns {ExamSession} 제출 상태인 세션.
 */
export function submitExamSession(session) {
  return session.submitted ? session : { ...session, submitted: true };
}

/**
 * 저장된 세션의 필수 구조와 100점 구성을 검사하고 답안을 정리해 복원한다.
 * 제한시간이 지났으면 제출 상태로 돌려주며, 잘못된 세션은 복원하지 않는다.
 * @param {unknown} saved 저장소에서 읽어 파싱한 값.
 * @param {number} [now=Date.now()] 복원 시각(Unix 밀리초).
 * @returns {ExamSession | null} 복원된 세션 또는 유효하지 않을 때 null.
 */
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
