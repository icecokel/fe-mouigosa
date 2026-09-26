"use client";

import { useRef, useState } from "react";
import { formatTime } from "./countdown.mjs";
import { gradeExam, isAnswered, shareExamResult } from "./results.mjs";
import { useExamSession } from "./use-exam-session.mjs";
import MatchingInput from "./matching-input";

const choices = ["①", "②", "③", "④", "⑤"];
const leftLabels = ["ㄱ", "ㄴ", "ㄷ", "ㄹ"];
const rightLabels = ["A", "B", "C", "D"];

function CandidateRecord({ candidate }) {
  return (
    <dl className="candidate-record">
      <div><dt>성명</dt><dd>{candidate.name}</dd></div>
      <div><dt>수험번호</dt><dd>{candidate.number}</dd></div>
      <div><dt>시행일</dt><dd><time dateTime={candidate.date}>{candidate.date.replaceAll("-", ".")}</time></dd></div>
      {candidate.affiliation && <div><dt>소속</dt><dd>{candidate.affiliation}</dd></div>}
    </dl>
  );
}

function answerText(question, value) {
  if (question.format === "객관식 단일") {
    return Number.isInteger(value) ? choices[value - 1] + " " + question.options[value - 1] : "미응답";
  }
  if (question.format === "객관식 중복") {
    return Array.isArray(value) && value.length
      ? [...value].sort((a, b) => a - b).map((number) => choices[number - 1] + " " + question.options[number - 1]).join(" / ")
      : "미응답";
  }
  if (question.format === "주관식 단답") return typeof value === "string" && value.trim() ? value.trim() : "미응답";
  if (!Array.isArray(value) || !value.some(Number.isInteger)) return "미응답";
  return question.left.map((_, index) => leftLabels[index] + "→" + (rightLabels[value[index] - 1] ?? "미연결")).join(" / ");
}

function Question({ question, answer, onAnswer, onChoose, locked }) {
  return (
    <section className="question" aria-labelledby={"question-" + question.id}>
      <div className="question-top">
        <span className="question-number">{question.id}.</span>
        <p className="question-prompt" id={"question-" + question.id} tabIndex={-1}>{question.prompt}</p>
        <span className="points">[{question.points}점]</span>
      </div>
      {question.code && (
        <pre className="question-code"><code>{question.code}</code></pre>
      )}
      {question.format === "객관식 중복" && <p className="question-instruction">옳은 답을 모두 고르시오.</p>}
      {question.options && (
        <ol className="choice-list" aria-label={question.id + "번 선택지"}>
          {question.options.map((option, index) => (
            <li key={index}>
              <button
                type="button"
                className="question-choice"
                onClick={() => onChoose(question, index + 1)}
                disabled={locked}
                aria-pressed={question.format === "객관식 중복" ? (answer ?? []).includes(index + 1) : answer === index + 1}
                aria-label={question.id + "번 문항 " + (index + 1) + "번 선택지: " + option}
              >
                <span className="choice-symbol" aria-hidden="true">{index + 1}</span>
                <span>{option}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      {question.format === "주관식 단답" && (
        <label className="short-answer" htmlFor={"short-answer-" + question.id}>
          단답형 답안
          <input
            id={"short-answer-" + question.id}
            type="text"
            value={answer ?? ""}
            onChange={(event) => onAnswer(question.id, event.target.value)}
            disabled={locked}
            autoComplete="off"
            spellCheck={false}
            maxLength={80}
          />
        </label>
      )}
      {question.format === "선긋기" && (
        <MatchingInput key={question.questionId} question={question} answer={answer} onAnswer={onAnswer} locked={locked} />
      )}
    </section>
  );
}

function Exam({ questions, answers, candidate, onAnswer, onChoose, onSubmit, timeLeft, locked }) {
  const pages = Array.from({ length: Math.ceil(questions.length / 4) }, (_, index) => questions.slice(index * 4, index * 4 + 4));
  const answered = questions.filter((question) => isAnswered(question, answers[question.id])).length;
  return (
    <div className="exam-layout">
      <div className="exam-controls" aria-label="시험 진행 상태">
        <span>남은 시간 <strong role="timer">{timeLeft}</strong></span>
        <span>기입 {answered} / {questions.length}</span>
        {locked ? <span>제출 완료</span> : <button type="button" onClick={onSubmit}>시험 종료 · 성적표 확인</button>}
      </div>
      <main className="exam-pages" aria-label="프론트엔드 영역 문제지">
        {pages.map((page, index) => (
          <article className="paper exam-paper" key={index} aria-label={`${index + 1}쪽`}>
            {index === 0 ? (
              <header className="exam-header">
                <p className="exam-year">2026학년도 프론트엔드 개발자 모의평가</p>
                <div className="exam-title-row">
                  <span className="period">제 1교시</span>
                  <h1>프론트엔드 영역</h1>
                </div>
                <CandidateRecord candidate={candidate} />
              </header>
            ) : (
              <header className="continuation-header">
                <span>{index + 1}</span>
                <span>프론트엔드 영역</span>
                <span>2026학년도 프론트엔드 개발자 모의평가</span>
              </header>
            )}
            <div className="exam-columns">
              <div className="question-column">
                {page.slice(0, 2).map((question) => <Question key={question.id} question={question} answer={answers[question.id]} onAnswer={onAnswer} onChoose={onChoose} locked={locked} />)}
              </div>
              <div className="question-column">
                {page.slice(2).map((question) => <Question key={question.id} question={question} answer={answers[question.id]} onAnswer={onAnswer} onChoose={onChoose} locked={locked} />)}
              </div>
            </div>
            <footer className="paper-footer">
              <span>fe-mouigosa</span>
              <span>{index + 1} / {pages.length}</span>
            </footer>
          </article>
        ))}
      </main>

    </div>
  );
}

function Result({ questions, answers, candidate, onRetry }) {
  const report = gradeExam(answers, questions);
  const [shareStatus, setShareStatus] = useState({});
  const [sharing, setSharing] = useState(false);

  async function shareResult() {
    if (sharing) return;
    setSharing(true);
    setShareStatus({});
    try {
      setShareStatus(await shareExamResult(report));
    } finally {
      setSharing(false);
    }
  }

  return (
    <main className="paper result-paper" aria-label="성적통지표">
      <header className="result-header">
        <p>2026학년도 프론트엔드 개발자 모의평가</p>
        <h1>성적통지표</h1>
        <span>프론트엔드 영역 · 제 1교시</span>
      </header>
      <CandidateRecord candidate={candidate} />
      <div className="result-body">
        <p className="result-overview">
          <span className="total-score">총점 <strong>{report.score}</strong> / {report.maxScore}점</span>
          <span>정답 <strong>{report.correctCount} / {questions.length}문항</strong></span>
          <span>미응답 <strong>{report.unansweredCount}문항</strong></span>
        </p>
        <div className="result-actions">
          <button type="button" className="retry-button" onClick={shareResult} disabled={sharing}>{sharing ? "공유 중…" : "결과 공유하기"}</button>
          <a className="retry-button" href="https://github.com/icecokel/fe-mouigosa" target="_blank" rel="noopener noreferrer">☆ GitHub Star <span className="sr-only">(새 탭)</span></a>
        </div>
        <p className="result-note">점수 요약과 응시 링크를 공유합니다. 프로젝트가 마음에 들면 GitHub에서 Star를 눌러 주세요.</p>
        <p className="result-note" role="status">{shareStatus.message}</p>
        {shareStatus.text && <textarea className="share-copy" aria-label="공유할 점수 요약과 응시 링크" readOnly value={shareStatus.text} onFocus={(event) => event.target.select()} rows={4} />}

        <div className="section-rule">
          <span>Ⅰ</span>
          <h2>영역별 성적</h2>
        </div>
        <p className="result-note table-scroll-hint" id="score-scroll-hint">좌우로 이동해 영역별 성적을 확인하세요.</p>
        <div className="score-scroll" role="region" aria-label="영역별 성적표" aria-describedby="score-scroll-hint" tabIndex={0}>
          <table className="score-table">
            <thead>
              <tr>
                <th scope="col">구분</th>
                {report.areas.map((area) => <th scope="col" key={area.category}>{area.category}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">점수</th>
                {report.areas.map((area) => <td key={area.category}>{area.earned} / {area.max}</td>)}
              </tr>
              <tr>
                <th scope="row">정답</th>
                {report.areas.map((area) => <td key={area.category}>{area.correct} / {area.count}</td>)}
              </tr>
              {["백분위", "등급"].map((metric) => (
                <tr key={metric}>
                  <th scope="row">{metric}</th>
                  {report.areas.map((area) => <td key={area.category}>—</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="result-note">백분위는 제출된 응시 기록을 비교 단위로 삼으며, 재응시도 별도 기록으로 셉니다. 현재는 비교 기록과 산정 기준이 없어 백분위·등급을 표시하지 않습니다. 점수는 예시 문항의 정답과 배점으로 계산했습니다.</p>

        <div className="section-rule">
          <span>Ⅱ</span>
          <h2>취약 영역</h2>
        </div>
        {report.weakAreas.length ? (
          <ul className="weak-list">
            {report.weakAreas.map((area) => (
              <li key={area.category}><strong>{area.category}</strong><span>정답률 {Math.round(area.correct / area.attempted * 100)}% · 오답 {area.attempted - area.correct}문항</span></li>
            ))}
          </ul>
        ) : (
          <p className="empty-result">{report.unansweredCount === questions.length ? "응시한 문항이 없어 취약 영역을 산정할 수 없습니다." : "응시한 영역에서 확인된 오답이 없습니다."}</p>
        )}
        <p className="result-note">응답한 문항의 정답률이 가장 낮은 영역을 표시합니다. 미응답 문항은 이 판정에서 제외합니다.</p>

        <div className="section-rule">
          <span>Ⅲ</span>
          <h2>정답 및 해설</h2>
          <span className="section-count">전체 {report.answerSheet.length}문항</span>
        </div>
        <ol className="mistake-list">
          {report.answerSheet.map((question) => (
            <li key={question.id}>
              <details>
                <summary>
                  <strong>{question.id}번</strong>
                  <span>{question.prompt}</span>
                  <em className={question.isCorrect ? "answer-correct" : ""}>{question.isCorrect ? "정답" : question.isAnswered ? "오답" : "미응답"}</em>
                </summary>
                <div className="mistake-detail">
                  <p className="mistake-category">{question.category} · {question.type} · {question.format} · {question.points}점</p>
                  {question.code && <pre className="question-code result-code"><code>{question.code}</code></pre>}
                  {question.options && <ol className="answer-options">
                    {question.options.map((option, index) => <li key={index}>{choices[index]} {option}</li>)}
                  </ol>}
                  {question.format === "선긋기" && (
                    <div className="answer-matching">
                      <div><p>왼쪽 항목</p><ol>{question.left.map((item, index) => <li key={index}>{leftLabels[index]} {item}</li>)}</ol></div>
                      <div><p>오른쪽 항목</p><ol>{question.right.map((item, index) => <li key={index}>{rightLabels[index]} {item}</li>)}</ol></div>
                    </div>
                  )}
                  <dl className="answer-compare">
                    <dt>제출 답안</dt>
                    <dd>{answerText(question, question.selected)}</dd>
                    <dt>정답</dt>
                    <dd>{answerText(question, question.answer)}</dd>
                  </dl>
                  <h3 className="answer-heading">해설</h3>
                  <p className="answer-explanation">{question.explanation}</p>
                  <h3 className="answer-heading">정답 근거</h3>
                  <ul className="answer-sources">
                    {question.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span className="sr-only"> (새 탭)</span></a></li>)}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>
      <footer className="result-footer">
        <span>fe-mouigosa · 목업 성적통지표</span>
        <button type="button" className="retry-button" onClick={onRetry}>다시 응시</button>
      </footer>
    </main>
  );
}

export default function Home() {
  const {
    session, candidate, identity, examError, view, secondsLeft,
    showView, startExam, finishExam, retryExam, recordAnswer, chooseAnswer, clearExamError,
  } = useExamSession();
  const questions = session?.questions ?? [];
  const answers = session?.answers ?? {};
  const nameInputRef = useRef(null);

  const handleStartExam = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("candidateName") ?? "").trim();
    startExam({ name, affiliation: String(data.get("affiliation") ?? "") });
    if (!name) nameInputRef.current?.focus();
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <span className="site-name">fe-mouigosa</span>
          <nav aria-label="화면 시안">
            <button type="button" aria-current={view === "exam" ? "page" : undefined} onClick={() => showView("exam")} disabled={!questions.length}>문제지</button>
            <button type="button" aria-current={view === "result" ? "page" : undefined} onClick={() => showView("result")} disabled={!session?.submitted}>성적표</button>
          </nav>
        </div>
      </header>
      <div className="preview-caption">
        <span>화면 시안</span>
        <span>{session?.submitted ? "제출 완료 · 문제지와 성적표를 확인할 수 있습니다." : questions.length ? `${questions.length}문항 · 100점 만점 · 제한 시간 20분` : "매 응시 무작위 출제 · 20문항 이상 · 100점 만점"}</span>
      </div>
      {examError && <p role="alert" className="exam-error">{examError}</p>}
      {!questions.length ? (
        <main className="paper exam-start" aria-label="응시 안내">
          <header className="exam-header">
            <p className="exam-year">2026학년도 프론트엔드 개발자 모의평가</p>
            <div className="exam-title-row"><span className="period">제 1교시</span><h1>프론트엔드 영역</h1></div>
          </header>
          <form onSubmit={handleStartExam}>
            <section className="candidate-entry" aria-labelledby="candidate-title">
              <h2 id="candidate-title">수험자 정보 기재</h2>
              <div className="candidate-grid">
                <label className="candidate-cell">
                  <span>성명</span>
                  <input ref={nameInputRef} name="candidateName" type="text" required maxLength={30} autoComplete="name" defaultValue={candidate?.name ?? ""} placeholder="성명 또는 닉네임" onChange={clearExamError} />
                </label>
                <div className="candidate-cell"><span>수험번호</span><output>{identity?.number ?? "자동 발급 중"}</output></div>
                <label className="candidate-cell">
                  <span>소속 <small>(선택)</small></span>
                  <input name="affiliation" type="text" maxLength={50} autoComplete="organization" defaultValue={candidate?.affiliation ?? ""} placeholder="학교·회사·스터디" />
                </label>
                <div className="candidate-cell"><span>시행일</span><time dateTime={identity?.date}>{identity?.date?.replaceAll("-", ".") ?? "확인 중"}</time></div>
              </div>
              <p className="candidate-note">수험번호는 한국 시간 시행일을 기준으로 임의 발급됩니다. 진행 중인 시험과 답안은 이 브라우저에 저장되며 서버에는 저장하지 않습니다.</p>
            </section>
            <h2>수험생 유의사항</h2>
            <ol>
              <li>시험 시간은 20분이며, 시간이 끝나면 자동으로 제출됩니다.</li>
              <li>종료 전 새로고침하거나 브라우저를 다시 열어도 같은 시험을 이어 풀 수 있습니다.</li>
              <li>문항은 매번 무작위로 출제되며 20문항 이상, 총 100점입니다.</li>
              <li>문항별 배점은 2~5점입니다. 각 문항의 배점을 확인하십시오.</li>
              <li>단일·중복 선택, 단답, 선긋기 문항은 문제지의 안내에 따라 답하십시오.</li>
              <li>시험 종료 후 성적표를 확인할 수 있습니다.</li>
            </ol>
            <button type="submit" className="exam-submit">모의고사 시작</button>
          </form>
        </main>
      ) : view === "exam" ? (
        <Exam questions={questions} answers={answers} candidate={candidate} onAnswer={recordAnswer} onChoose={chooseAnswer} onSubmit={finishExam} timeLeft={formatTime(secondsLeft)} locked={session.submitted} />
      ) : <Result questions={questions} answers={answers} candidate={candidate} onRetry={retryExam} />}
    </>
  );
}
