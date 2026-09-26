// 화면 시안용 예시 문항과 정답. 실제 출제 문항은 별도로 확정한다.
export const questions = [
  {
    id: 1,
    category: "JavaScript",
    type: "결과 예측",
    points: 2,
    answer: 3,
    prompt: "다음 코드를 실행했을 때 콘솔에 출력되는 값은?",
    code: `console.log(typeof null);`,
    options: ["undefined", "null", "object", "number", "boolean"],
  },
  {
    id: 2,
    category: "TypeScript",
    type: "타입 분석",
    points: 2,
    answer: 2,
    prompt: "다음 함수의 if 블록 안에서 value의 타입으로 옳은 것은?",
    code: `function print(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
}`,
    options: ["unknown", "string", "String 객체", "string | undefined", "never"],
  },
  {
    id: 3,
    category: "React",
    type: "결과 예측",
    points: 3,
    answer: 2,
    prompt: "초기값이 0인 다음 컴포넌트에서 버튼을 한 번 클릭한 직후 표시되는 값은? 일반 클릭 이벤트이며 다른 상태 변경은 없다.",
    code: `function Counter() {
  const [count, setCount] = useState(0);
  function click() {
    setCount(count + 1);
    setCount(count + 1);
  }
  return (
    <button onClick={click}>
      {count}
    </button>
  );
}`,
    options: ["0", "1", "2", "3", "런타임 오류"],
  },
  {
    id: 4,
    category: "Browser",
    type: "브라우저 동작",
    points: 2,
    answer: 2,
    prompt: "서버가 HTTP 404 응답을 정상적으로 보냈다. fetch()의 기본 동작으로 옳은 것은?",
    options: [
      "Promise가 자동으로 거부된다.",
      "Response로 이행되며 ok는 false다.",
      "빈 문자열로 이행된다.",
      "요청이 자동으로 한 번 재시도된다.",
      "브라우저가 항상 네트워크 오류로 취급한다.",
    ],
  },
  {
    id: 5,
    category: "CSS",
    type: "결과 예측",
    points: 2,
    answer: 3,
    prompt: "다음 요소의 CSS 레이아웃상 바깥 너비는? margin은 0이며 다른 스타일은 적용되지 않는다.",
    code: `.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
}`,
    options: ["170px", "190px", "200px", "240px", "250px"],
  },
  {
    id: 6,
    category: "Web Performance",
    type: "개념 판단",
    points: 2,
    answer: 3,
    prompt: "Largest Contentful Paint(LCP)가 주로 나타내는 것은?",
    options: [
      "첫 입력을 처리하는 데 걸린 시간",
      "페이지의 모든 리소스가 내려받아진 시점",
      "뷰포트에서 가장 큰 콘텐츠 요소가 그려진 시점",
      "예상치 못한 화면 이동의 총량",
      "서버가 첫 바이트를 보낸 시점",
    ],
  },
  {
    id: 7,
    category: "JavaScript",
    type: "결과 예측",
    points: 4,
    answer: 3,
    prompt: "다음 코드를 실행했을 때 출력 순서로 옳은 것은?",
    code: `console.log("A");
setTimeout(
  () => console.log("B"), 0
);
Promise.resolve().then(
  () => console.log("C")
);
console.log("D");`,
    options: ["A → B → C → D", "A → D → B → C", "A → D → C → B", "C → A → D → B", "D → A → C → B"],
  },
  {
    id: 8,
    category: "TypeScript",
    type: "타입 분석",
    points: 4,
    answer: 2,
    prompt: "다음 선언 이후 TypeScript 타입 검사에서 허용되는 코드는?",
    code: `type Box = Readonly<{ nested: { count: number } }>;
const box: Box = { nested: { count: 1 } };`,
    options: [
      "box.nested = { count: 2 };",
      "box.nested.count = 2;",
      "box.missing = 2;",
      "delete box.nested;",
      "box.nested.push(2);",
    ],
  },
  {
    id: 9,
    category: "React",
    type: "개념 판단",
    points: 2,
    answer: 4,
    prompt: "목록의 항목이 정렬·삽입·삭제될 수 있다. 항목 컴포넌트의 key로 가장 적절한 것은?",
    options: [
      "배열의 현재 인덱스",
      "렌더링할 때마다 생성한 난수",
      "렌더링할 때마다 읽은 현재 시각",
      "항목 데이터의 변하지 않는 고유 ID",
      "모든 항목에 동일한 문자열",
    ],
  },
  {
    id: 10,
    category: "Browser",
    type: "브라우저 동작",
    points: 4,
    answer: 1,
    prompt: "outer가 inner의 부모 요소일 때 다음 코드의 log 배열에 담기는 순서로 옳은 것은?",
    code: `outer.addEventListener("click",
  () => log.push("A"), true);
inner.addEventListener("click",
  () => log.push("B"));
outer.addEventListener("click",
  () => log.push("C"));
inner.click();`,
    options: ["A → B → C", "B → A → C", "B → C → A", "C → B → A", "A → C → B"],
  },
  {
    id: 11,
    category: "CSS",
    type: "결과 예측",
    points: 4,
    answer: 1,
    prompt: "다음 마크업의 label 글자색은? 두 선언은 같은 출처·레이어에서 적용된다.",
    code: `#app .label { color: red; }
.page .label { color: blue; }

<div id="app" class="page">
  <span class="label">text</span>
</div>`,
    options: ["red", "blue", "검정색", "두 색이 혼합된다.", "선언 순서에 따라 무조건 blue가 된다."],
  },
  {
    id: 12,
    category: "Web Performance",
    type: "개념 판단",
    points: 3,
    answer: 1,
    prompt: "첫 화면의 가장 큰 이미지가 LCP 요소다. 이 이미지에 loading=\"lazy\"를 적용하면 생길 수 있는 문제는?",
    options: [
      "이미지 요청이 늦어져 LCP가 악화될 수 있다.",
      "이미지 파일 크기가 자동으로 줄어든다.",
      "CLS가 항상 0이 된다.",
      "이미지가 브라우저 캐시에 저장되지 않는다.",
      "JavaScript 실행이 모두 차단된다.",
    ],
  },
  {
    id: 13,
    category: "JavaScript",
    type: "결과 예측",
    points: 3,
    answer: 2,
    prompt: "다음 코드에서 a와 b에 저장되는 값을 순서대로 고른 것은?",
    code: `const a = 0 ?? 7;
const b = 0 || 7;`,
    options: ["0, 0", "0, 7", "7, 0", "7, 7", "undefined, 7"],
  },
  {
    id: 14,
    category: "TypeScript",
    type: "타입 분석",
    points: 4,
    answer: 2,
    prompt: "다음 코드에서 if (result.ok) 블록 안의 result.data 타입은?",
    code: `type Result =
  | { ok: true; data: string }
  | { ok: false; error: Error };

function read(result: Result) {
  if (result.ok) return result.data;
  return result.error.message;
}`,
    options: ["unknown", "string", "string | Error", "Error", "never"],
  },
  {
    id: 15,
    category: "React",
    type: "렌더링 횟수 예측",
    points: 5,
    answer: 3,
    prompt: "프로덕션 모드이며 Strict Mode가 없다. 다음 컴포넌트가 처음 마운트된 뒤 상태 업데이트까지 마쳤을 때 렌더링 횟수는?",
    code: `function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(1); }, []);
  return <span>{count}</span>;
}`,
    options: ["0회", "1회", "2회", "3회", "무한 반복"],
  },
  {
    id: 16,
    category: "Browser",
    type: "브라우저 동작",
    points: 2,
    answer: 3,
    prompt: "같은 출처의 두 탭에서 localStorage와 sessionStorage를 사용할 때 옳은 설명은?",
    options: [
      "localStorage는 탭마다 항상 분리된다.",
      "sessionStorage는 모든 출처가 공유한다.",
      "localStorage는 같은 출처의 탭이 공유할 수 있다.",
      "두 저장소는 모두 서버에 자동 전송된다.",
      "두 저장소는 페이지를 새로고침하면 항상 비워진다.",
    ],
  },
  {
    id: 17,
    category: "CSS",
    type: "개념 판단",
    points: 3,
    answer: 2,
    prompt: "position: sticky가 적용된 요소의 일반적인 동작으로 옳은 것은? top 값이 지정되어 있고 스크롤 가능한 컨테이너 안에 있다.",
    options: [
      "항상 뷰포트 왼쪽 위에 고정된다.",
      "임계점 전에는 일반 흐름에 있다가 컨테이너 범위 안에서 붙는다.",
      "부모의 높이에 관계없이 문서 끝까지 따라간다.",
      "레이아웃 흐름에서 완전히 제거된다.",
      "스크롤과 관계없이 화면 가운데에 놓인다.",
    ],
  },
  {
    id: 18,
    category: "Web Performance",
    type: "개념 판단",
    points: 3,
    answer: 2,
    prompt: "Cumulative Layout Shift(CLS)를 낮추는 방법으로 가장 적절한 것은?",
    options: [
      "모든 이미지의 파일 이름을 짧게 한다.",
      "이미지와 광고 영역의 크기를 미리 확보한다.",
      "모든 요청을 HTTP POST로 바꾼다.",
      "화면에 보이는 이미지를 지연 로딩한다.",
      "애니메이션 지속 시간을 늘린다.",
    ],
  },
  {
    id: 19,
    category: "JavaScript",
    type: "결과 예측",
    points: 3,
    answer: 4,
    prompt: "다음 코드를 실행했을 때 출력되는 값은?",
    code: `const original = { nested: { value: 1 } };
const copy = { ...original };
copy.nested.value = 2;
console.log(original.nested.value);`,
    options: ["undefined", "0", "1", "2", "TypeError"],
  },
  {
    id: 20,
    category: "React",
    type: "버그 찾기",
    points: 5,
    answer: 2,
    prompt: "다음 컴포넌트는 1초마다 숫자를 늘리려 한다. 프로덕션 모드에서 발생하는 버그는? 다른 상태 변경은 없다.",
    code: `function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setCount(count + 1), 1000
    );
    return () => clearInterval(id);
  }, []);
  return <span>{count}</span>;
}`,
    options: [
      "숫자가 처음부터 증가하지 않는다.",
      "숫자가 1에 도달한 뒤 더 늘지 않는다.",
      "렌더마다 타이머가 2개씩 추가된다.",
      "숫자가 매번 2씩 증가한다.",
      "언마운트 뒤에도 타이머가 계속 실행된다.",
    ],
  },
];
