# 기여 가이드

`fe-mouigosa`의 문제 추가·수정, 문서 개선, 화면 및 기능 수정에 참여하는 방법입니다. 문제 기여는 해당 카테고리 JSON의 `questions` 배열에 문항 객체를 추가하고 PR을 올리면 됩니다.

## 개발 환경 준비

Node.js 24와 npm을 사용합니다. 외부 기여자는 [원본 저장소](https://github.com/icecokel/fe-mouigosa)를 자신의 GitHub 계정으로 Fork한 뒤 작업합니다. 아래 `<본인계정>`을 실제 계정명으로 바꿉니다.

```bash
git clone https://github.com/<본인계정>/fe-mouigosa.git
cd fe-mouigosa
git remote add upstream https://github.com/icecokel/fe-mouigosa.git
git switch -c feat/add-javascript-question
npm ci
npm run dev
```

로컬 화면은 `http://localhost:3000`에서 확인합니다. 원본 저장소에 쓰기 권한이 있다면 Fork 없이 원본을 복제하고 작업 브랜치를 만들어도 됩니다. 이미 설정된 `upstream`은 다시 추가하지 않습니다.

## 카테고리 파일

| 파일 | category |
| --- | --- |
| `content/questions/javascript.json` | `JavaScript` |
| `content/questions/typescript.json` | `TypeScript` |
| `content/questions/react.json` | `React` |
| `content/questions/browser.json` | `Browser` |
| `content/questions/css.json` | `CSS` |
| `content/questions/web-performance.json` | `Web Performance` |
| `content/questions/design-pattern.json` | `Design Pattern` |
| `content/questions/nextjs.json` | `Next.js` |
| `content/questions/web-fundamentals.json` | `Web Fundamentals` |
| `content/questions/accessibility-seo.json` | `Accessibility & SEO` |
| `content/questions/ai-concepts.json` | `AI Concepts` |
| `content/questions/web-security.json` | `Web Security` |
| `content/questions/e2e-testing.json` | `E2E Testing` |
| `content/questions/design-system.json` | `Design System` |

각 영역은 최소 100문항이며, JavaScript·Browser·CSS는 답안 형식 예시가 1개씩 추가되어 101문항입니다. 100개를 상한으로 제한하지 않습니다.

각 파일은 `{ "category": "JavaScript", "questions": [...] }` 형태입니다. **문항 객체에도 `category`를 필수로 적고 파일의 값과 일치시킵니다.** `type`은 풀이 방식, `format`은 답안 입력 형태입니다.

## 추가 순서

1. `content/question.template.json`의 문항 객체를 해당 파일의 `questions` 배열 끝에 복사합니다.
2. 전체 문제은행에서 겹치지 않는 `id`와 지문·코드·선택지·정답을 작성합니다.
3. `npm run check`와 `npm run build`를 실행합니다.
4. `npm run dev`로 시작·응시·채점·재응시를 확인하고 PR에 정답 근거를 적습니다.

등록된 모든 문항은 다음 시험을 시작할 때부터 무작위 선별 대상입니다. 별도 출제 목록이나 import를 수정할 필요가 없습니다. 새 문항이 모든 시험에 반드시 포함되지는 않습니다.

### 문항 작성 예시

다음 객체를 `content/questions/javascript.json`의 기존 `questions` 배열에 추가할 수 있습니다. 파일 전체를 이 객체로 덮어쓰지 않습니다. 앞선 문항 객체 뒤에는 쉼표가 필요합니다.

```json
{
  "id": "javascript-array-filter-even",
  "category": "JavaScript",
  "type": "결과 예측",
  "format": "객관식 단일",
  "points": 3,
  "prompt": "다음 코드를 실행했을 때 콘솔에 출력되는 문자열은?",
  "code": "const values = [1, 2, 3, 4];\nconsole.log(values.filter(n => n % 2 === 0).join(\",\"));",
  "options": ["1,3", "2,4", "1,2,3,4", "2", "4"],
  "answer": 2,
  "explanation": "filter는 조건을 만족하는 2와 4를 남기고, join은 두 값을 쉼표로 연결한 문자열을 반환합니다.",
  "sources": [
    {
      "title": "MDN — Array.prototype.filter()",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter"
    }
  ]
}
```

이 예시는 작성 형식을 설명하기 위한 것이며 문제은행에 자동으로 포함되지 않습니다. 추가 전에 같은 ID나 같은 내용을 묻는 문항이 있는지 확인합니다.

## 데이터 규칙

[카테고리 스키마](content/category.schema.json)와 [문항 스키마](content/question.schema.json)가 형식의 기준입니다. VS Code 자동 완성과 PR 검증은 같은 스키마를 사용합니다.
스크립트에서 문항 하나를 검수할 때는 `validateQuestionData(question, category)`를 사용하며, 반환된 오류 문자열 배열이 비어 있으면 유효합니다. 전체 문제은행 검사는 `npm run check:questions`로 실행합니다.

| 문항 필드 | 필수 | 규칙 |
| --- | --- | --- |
| `id` | O | 소문자 영문으로 시작하는 영문·숫자·하이픈 고유 이름. 예: `javascript-array-map`. 카테고리 간에도 중복 금지, 등록 후 유지 |
| `category` | O | 파일 상단의 카테고리와 같은 값. 14개 허용값은 [카테고리 스키마](content/category.schema.json)에 정의 |
| `type` | O | 풀이 방식: `개념 판단`, `결과 예측`, `타입 분석`, `버그 찾기`, `렌더링 횟수 예측`, `브라우저 동작` 중 하나 |
| `format` | O | 답안 형식: `객관식 단일`, `객관식 중복`, `주관식 단답`, `선긋기` 중 하나 |
| `points` | O | 정수 `2`, `3`, `4`, `5` 중 하나 |
| `prompt` | O | 공백뿐인 문자열 금지. 실행 환경과 전제조건도 작성 |
| `code` | 조건부 | 결과 예측·타입 분석·버그 찾기·렌더링 횟수 예측에는 필수 |
| `options` | 객관식만 | 서로 다른 비어 있지 않은 문자열 5개. ①~⑤ 기호 없이 배열 순서로 지정 |
| `left` / `right` | 선긋기만 | 양쪽에 3~4개씩 서로 다른 항목. 양쪽 항목 수가 같아야 함 |
| `answer` | O | 형식별 정답. 아래 표 참조 |
| `explanation` | O | 정답이 되는 이유와 주요 오답의 차이. 시험 종료 후 모든 문항의 해답지에 표시 |
| `sources` | O | `{ "title": "문서 제목", "url": "https://…" }` 객체 배열. 근거 링크 1개 이상, URL 중복 금지 |

| `format` | `answer` 예시 | 채점 |
| --- | --- | --- |
| `객관식 단일` | `2` | 1~5 중 한 번호가 일치해야 득점 |
| `객관식 중복` | `[2, 3]` | 2~5개의 정답 번호 집합이 정확히 일치해야 득점. 선택 순서는 무관 |
| `주관식 단답` | `"[object Null]"` | 양끝 공백을 제거한 뒤 대소문자까지 정확히 일치해야 득점 |
| `선긋기` | `[2, 3, 1]` | 왼쪽 ㄱ·ㄴ·ㄷ의 연결 대상이 오른쪽 B·C·A인 뜻. 1:1 연결을 전부 맞혀야 득점 |

부분 점수는 주지 않습니다. 선긋기는 왼쪽을 누른 뒤 오른쪽을 눌러 연결하며, 아직 연결하지 않은 항목이 있으면 미응답으로 집계합니다. 각 형식의 실제 데이터 예시는 `content/questions/browser.json`, `content/questions/javascript.json`, `content/questions/css.json` 끝의 신규 문항을 참고하세요. 모든 답은 문제지에서 작성합니다.

정의되지 않은 필드, JSON 주석, 끝 쉼표는 허용하지 않습니다. 코드의 줄바꿈은 `\n`, 큰따옴표는 `\"`로 작성합니다. 코드 문자열은 그대로 표시하며 검증 과정에서 실행하지 않습니다. React 버전, Strict Mode, 개발·프로덕션 모드, TypeScript 옵션 등에 따라 답이 달라지면 조건을 지문에 명시합니다. 자동 검사는 구조를 검사하므로 실제 정답과 링크 내용의 일치는 리뷰에서 확인해야 합니다. 링크 검사는 문법·HTTPS·중복을 확인하며 외부 사이트의 가용성을 보장하지 않습니다.

### 출제와 수정 기준

- 객관식 단일은 정답 하나, 객관식 중복은 정답 집합, 단답·선긋기는 모호하지 않은 완전한 정답을 작성합니다. 객관식의 오답도 왜 틀렸는지 설명할 수 있어야 합니다.
- `sources`에 해설을 뒷받침하는 공식 문서·표준·원저자 자료의 HTTPS 링크를 넣습니다. 문서 홈보다 해당 API·절로 직접 연결하고, 여러 동작이 근거라면 링크를 추가합니다. 링크의 실제 내용과 접근 가능 여부를 확인하고 PR에도 근거를 적습니다. 해당되는 경우 React 버전, Strict Mode, TypeScript 컴파일 옵션을 명시합니다.
- 외부 시험 문제를 그대로 복사하지 않고 직접 작성합니다. 참고한 자료가 있다면 출처를 적습니다.
- 문항의 배점은 2~5점 중 선택합니다. 자동 검사에서는 범위만 확인하므로 난이도와 배점의 적절성은 리뷰에서 판단합니다.
- 기존 문항의 오탈자·정답을 수정할 때는 ID를 유지하고 수정 이유를 적습니다. 별개의 문제라면 새로운 ID를 사용합니다.
- 카테고리·유형·형식은 지정된 값만 사용합니다. 새 분류가 필요하면 문항에 임의 값을 넣기 전에 Issue나 PR에서 변경 이유를 설명합니다.

## 무작위 출제 규칙

- 모의고사 시작·다시 응시를 누를 때 브라우저에서 문항을 새로 선별하고 순서를 섞습니다.
- 한 시험 안에서는 고유 ID 중복 없이 **최소 20문항, 합계 정확히 100점**으로 구성합니다.
- 문항의 원래 배점(2~5점)을 유지합니다. 따라서 문항 수는 20~50개 범위에서 달라질 수 있습니다.
- 카테고리 가중치를 추첨에 반영합니다. 가중치가 높을수록 출제 비중이 커질 가능성이 높지만, 영역별 문항 수나 점수를 고정하지 않습니다. 출제되지 않는 카테고리가 있어도 정상입니다.
- 현재 가중치는 JavaScript 5, TypeScript·React·CSS 4, Browser·Next.js·Web Fundamentals·Web Performance·Accessibility & SEO·Web Security·AI Concepts 3, Design Pattern·E2E Testing·Design System 2입니다. 값은 출제 로직의 상수에서 관리합니다.
- 응시 중과 제출 후 문제지·성적표 이동에서는 같은 문항과 순서를 유지합니다.
- 화면 번호는 1부터 부여하고 원본 고유 ID는 `questionId`로 보존합니다.
- 제한 시간은 시작 버튼을 누른 시점부터 20분입니다. 시간이 끝나면 자동 제출하고 성적표로 이동합니다.
- 발행한 시험의 문제·답안·종료 시각은 브라우저에 저장합니다. 종료 전 새로고침이나 브라우저 재방문에서는 같은 시험과 남은 시간을 복원하고, 종료 후에는 성적표를 복원합니다.
- 다시 응시를 누르면 저장한 시험을 지우고 수험자 정보 화면으로 돌아갑니다. 다음 시작에서 새 문항을 발행합니다.

원본 JSON을 검증한 뒤 전체 문제은행을 `app/questions.generated.json`으로 생성합니다. 이 파일은 직접 수정하거나 커밋하지 않습니다. `npm run dev`와 `npm run build` 시작 전에 자동 생성되며, 개발 중 원본 JSON을 수정하면 `npm run check:questions`로 다시 생성하거나 개발 서버를 재시작합니다.

등록된 문항에 오류가 있거나 최소 20문항·100점 조합을 만들 수 없으면 빌드 검증에서 실패합니다. 이미 응시 중인 시험에는 새 데이터가 섞이지 않습니다.

## PR 자동 검사

`Check questions and build` 워크플로가 PR과 `main` 푸시에서 문항 스키마·중복·근거 URL, 1,000회 무작위 출제·100점 구성, 채점·카운트다운과 Pages용 정적 빌드를 검사합니다. GitHub Actions의 `Run workflow`로 수동 실행할 수도 있습니다. Pages 배포에서도 같은 검사를 실행합니다.

```bash
npm ci
npm run check:questions       # 카테고리·문항 검증, 100점 구성 가능 여부 확인 및 데이터 생성
npm run check:exam            # 무작위 선별 규칙 검증
npm run check                # 전체 검사
PAGES_BASE_PATH=/fe-mouigosa npm run build
```

### 자주 발생하는 검증 오류

| 오류 | 확인할 내용 |
| --- | --- |
| JSON 파싱 실패 | 쉼표 누락·끝 쉼표, 따옴표와 줄바꿈 이스케이프 확인 |
| 허용하지 않는 필드 | 수동 문제 번호 등 스키마에 없는 필드 제거. 문항 `category`는 필수 |
| 중복 ID | 다른 카테고리까지 검색하고 새 문항의 ID 변경 |
| 중복 지문·코드 | ID만 바꾼 동일 문항은 추가하지 않고 기존 문항 확인 |
| 선택지 오류 | 객관식은 공백뿐인 항목과 앞뒤 공백을 제외한 중복 제거, 정확히 5개 작성 |
| `code` 필수 오류 | 코드가 필요한 유형인지 확인하고 제시 코드 작성 |
| 100점 시험 구성 불가 | 문제은행에서 원래 배점으로 중복 없이 최소 20문항·100점을 만들 수 있는지 확인 |

검증이 실패하면 생성 파일은 갱신되지 않습니다. 원본 JSON의 오류를 고친 뒤 다시 실행합니다.

## PR 제출

한 PR에는 함께 검토할 수 있는 변경을 묶습니다. 문제 추가와 관계없는 화면·설정 변경은 별도 PR로 나누면 검토하기 쉽습니다.

```bash
git diff --check
git diff
git add content/questions/javascript.json
git commit -m "feat: JavaScript 배열 필터 문항 추가"
git push -u origin feat/add-javascript-question
```

위 파일명과 브랜치 이름은 예시입니다. 실제 변경한 원본 파일만 지정해 커밋합니다. `app/questions.generated.json`, `node_modules/`, `.next/`, `out/`은 커밋하지 않습니다.

GitHub에서 **원본 저장소의 `main` 브랜치**를 대상으로 PR을 열고 [PR 템플릿](.github/pull_request_template.md)을 작성합니다. 문제 추가 PR에는 문항 ID, 카테고리·유형·배점, 정답 근거, 수행한 검증을 적습니다. 리뷰 중 같은 카테고리 파일에 충돌이 생기면 양쪽 문항을 보존해 해결하고 중복 ID와 JSON 형식을 다시 검사합니다.

제출 전 확인합니다.

- [ ] 원래 있던 문항을 의도치 않게 삭제하거나 수정하지 않았습니다.
- [ ] 문항 스키마를 지켰고 정답과 해설을 직접 확인했습니다.
- [ ] `npm run check`와 Pages용 정적 빌드가 통과했습니다.
- [ ] 시작·답안 선택·시험 종료·100점 기준 성적표·재응시 흐름을 확인했습니다.
- [ ] 변경 이유와 정답 근거를 PR에 적었습니다.

PR에서는 검사만 실행하고, `main`에 병합되면 GitHub Pages 배포 워크플로가 실행됩니다.

## 문서·화면·기능 기여

문서만 수정할 때는 내용과 링크를 확인합니다. 코드 변경에는 관련 검증과 정적 빌드를 실행하고 재현·확인 방법을 PR에 적습니다. 화면을 변경했다면 PC와 모바일에서 확인한 화면을 첨부하면 좋습니다.

시험지의 명조 서체·2단 구성·문제지 내 답안 작성·성적표 경험을 유지하고, 시험 중에는 카테고리와 유형 태그를 표시하지 않습니다. 동작과 디자인 기준은 [기획서](docs/기획서.md)와 [디자인 명세](docs/디자인.md)를 참고합니다. API 서버 없이 GitHub Pages에서 동작하는 정적 배포 구조도 유지합니다.
