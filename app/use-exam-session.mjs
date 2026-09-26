import { useCallback, useEffect, useRef, useState } from "react";
import { remainingSeconds } from "./countdown.mjs";
import { questionBank } from "./questions.mjs";
import { createExam } from "./exam.mjs";
import {
  EXAM_DURATION_MS, EXAM_SESSION_KEY, chooseExamOption, createExamSession,
  recordExamAnswer, restoreExamSession, submitExamSession,
} from "./exam-session.mjs";
import { createExamIdentity } from "./candidate.mjs";

/** @typedef {import("./exam-session.mjs").ExamSession} ExamSession */
/** @typedef {import("./exam-session.mjs").ExamQuestion} ExamQuestion */

/**
 * 저장소가 막혀 있어도 응시를 계속할 수 있도록 저장 실패만 무시한다.
 * @param {ExamSession} session 저장할 시험과 답안
 * @returns {void}
 */
function saveExamSession(session) {
  try { localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session)); } catch { /* 저장소를 사용할 수 없어도 시험은 진행한다. */ }
}

/**
 * 저장된 값을 검증하고, 만료된 시험은 제출 상태로 복원한다.
 * @returns {ExamSession | null} 복원 가능한 시험 또는 null
 */
function loadExamSession() {
  try { return restoreExamSession(JSON.parse(localStorage.getItem(EXAM_SESSION_KEY) ?? "null")); }
  catch { return null; }
}

/**
 * 화면에서 사용하는 시험 세션의 발행·답안·제출·복원을 관리한다.
 * 출제와 답안 변경 규칙은 순수 함수에 맡기고, 여기서는 React 상태와 브라우저 저장소를 연결한다.
 * @returns {{
 *   session: ExamSession | null,
 *   candidate: ExamSession["candidate"] | null,
 *   identity: {date: string, number: string} | null,
 *   examError: string,
 *   view: "exam" | "result",
 *   secondsLeft: number,
 *   showView: (view: "exam" | "result") => void,
 *   startExam: (input: {name: string, affiliation: string}) => boolean,
 *   finishExam: () => void,
 *   retryExam: () => void,
 *   recordAnswer: (questionId: number, value: number | string | Array<number | null>) => void,
 *   chooseAnswer: (question: ExamQuestion, optionNumber: number) => void,
 *   clearExamError: () => void,
 * }} 시험 화면에 필요한 상태와 동작
 */
export function useExamSession() {
  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);
  const [lastCandidate, setLastCandidate] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [examError, setExamError] = useState("");
  const [view, setView] = useState("exam");
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_MS / 1000);

  const saveSession = useCallback((next) => {
    sessionRef.current = next;
    setSession(next);
    saveExamSession(next);
  }, []);

  const showView = useCallback((nextView) => {
    setView(nextView);
    window.scrollTo(0, 0);
  }, []);

  const finishExam = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.submitted) return;
    saveSession(submitExamSession(current));
    showView("result");
  }, [saveSession, showView]);

  useEffect(() => {
    setIdentity(createExamIdentity());
    const restored = loadExamSession();
    if (!restored) return;
    saveSession(restored);
    setLastCandidate(restored.candidate);
    setSecondsLeft(remainingSeconds(restored.deadline, Date.now()));
    if (restored.submitted) setView("result");
  }, [saveSession]);

  useEffect(() => {
    if (!session || session.submitted) return;
    const tick = () => {
      const current = sessionRef.current;
      if (!current || current.submitted) return;
      const seconds = remainingSeconds(current.deadline, Date.now());
      setSecondsLeft(seconds);
      if (seconds === 0) finishExam();
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session?.deadline, session?.submitted, finishExam]);

  const startExam = useCallback((input) => {
    const name = String(input.name ?? "").trim();
    if (!name) {
      setExamError("성명을 입력해 주세요.");
      return false;
    }
    let questions;
    try { questions = createExam(questionBank); }
    catch (error) {
      setExamError(error instanceof Error ? error.message : "시험을 생성할 수 없습니다.");
      return false;
    }
    const issued = createExamIdentity();
    const candidate = {
      name,
      affiliation: String(input.affiliation ?? "").trim(),
      ...(identity?.date === issued.date ? identity : issued),
    };
    const next = createExamSession(questions, candidate);
    saveSession(next);
    setLastCandidate(candidate);
    setSecondsLeft(EXAM_DURATION_MS / 1000);
    setExamError("");
    showView("exam");
    return true;
  }, [identity, saveSession, showView]);

  const retryExam = useCallback(() => {
    try { localStorage.removeItem(EXAM_SESSION_KEY); } catch { /* 저장소를 사용할 수 없어도 새 시험을 시작할 수 있다. */ }
    sessionRef.current = null;
    setSession(null);
    setSecondsLeft(EXAM_DURATION_MS / 1000);
    setIdentity(createExamIdentity());
    setExamError("");
    showView("exam");
  }, [showView]);

  const recordAnswer = useCallback((questionId, value) => {
    const current = sessionRef.current;
    if (current) {
      const now = Date.now();
      if (now >= current.deadline) return finishExam();
      const next = recordExamAnswer(current, questionId, value, now);
      if (next !== current) saveSession(next);
    }
  }, [finishExam, saveSession]);

  const chooseAnswer = useCallback((question, optionNumber) => {
    const current = sessionRef.current;
    if (current) {
      const now = Date.now();
      if (now >= current.deadline) return finishExam();
      const next = chooseExamOption(current, question, optionNumber, now);
      if (next !== current) saveSession(next);
    }
  }, [finishExam, saveSession]);

  const clearExamError = useCallback(() => setExamError(""), []);
  return {
    session, candidate: session?.candidate ?? lastCandidate, identity, examError, view, secondsLeft,
    showView, startExam, finishExam, retryExam, recordAnswer, chooseAnswer, clearExamError,
  };
}
