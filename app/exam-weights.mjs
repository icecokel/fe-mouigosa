/**
 * 카테고리 추첨 시 쓰는 상대 가중치. 배점 할당량이나 최소 출제 문항 수가 아니다.
 * 문제은행에 새 카테고리를 추가할 때 이 표에도 값을 정한다.
 * @type {Readonly<Record<string, number>>}
 */
export const CATEGORY_WEIGHTS = Object.freeze({
  JavaScript: 5,
  TypeScript: 4,
  React: 4,
  CSS: 4,
  Browser: 3,
  "Next.js": 3,
  "Web Fundamentals": 3,
  "Web Performance": 3,
  "Accessibility & SEO": 3,
  "Web Security": 3,
  "AI Concepts": 3,
  "Design Pattern": 2,
  "E2E Testing": 2,
  "Design System": 2,
});
