"use client";

import { useEffect, useRef, useState } from "react";
import { connectMatch } from "./results.mjs";

const leftLabels = ["ㄱ", "ㄴ", "ㄷ", "ㄹ"];
const rightLabels = ["A", "B", "C", "D"];

export default function MatchingInput({ question, answer, onAnswer, locked }) {
  const [activeLeft, setActiveLeft] = useState(null);
  const [lines, setLines] = useState([]);
  const boardRef = useRef(null);
  const leftRefs = useRef([]);
  const rightRefs = useRef([]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const updateLines = () => {
      const bounds = board.getBoundingClientRect();
      setLines((answer ?? []).flatMap((rightNumber, leftIndex) => {
        const left = leftRefs.current[leftIndex];
        const right = rightRefs.current[rightNumber - 1];
        if (!left || !right) return [];
        const from = left.getBoundingClientRect();
        const to = right.getBoundingClientRect();
        return [{
          key: leftIndex,
          x1: from.right - bounds.left,
          y1: from.top + from.height / 2 - bounds.top,
          x2: to.left - bounds.left,
          y2: to.top + to.height / 2 - bounds.top,
        }];
      }));
    };
    updateLines();
    const observer = new ResizeObserver(updateLines);
    observer.observe(board);
    [...leftRefs.current, ...rightRefs.current].filter(Boolean).forEach((element) => observer.observe(element));
    window.addEventListener("resize", updateLines);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLines);
    };
  }, [answer, question.id]);

  function connect(rightNumber) {
    if (activeLeft === null) return;
    onAnswer(question.id, connectMatch(answer, activeLeft, rightNumber, question.left.length));
    setActiveLeft(null);
  }

  const connected = (answer ?? []).filter(Number.isInteger).length;
  return (
    <div className="matching">
      <p className="matching-note">왼쪽 항목을 누른 뒤 연결할 오른쪽 항목을 누르시오.</p>
      <div className="matching-board" ref={boardRef}>
        <div className="matching-side">
          {question.left.map((item, index) => (
            <button
              key={index}
              ref={(element) => { leftRefs.current[index] = element; }}
              type="button"
              className="matching-item"
              aria-label={"왼쪽 " + leftLabels[index] + " " + item}
              aria-pressed={activeLeft === index}
              disabled={locked}
              onClick={() => setActiveLeft(activeLeft === index ? null : index)}
            >
              <strong>{leftLabels[index]}</strong><span>{item}</span>
            </button>
          ))}
        </div>
        <svg className="matching-lines" aria-hidden="true">
          {lines.map((line) => <line key={line.key} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />)}
        </svg>
        <div className="matching-side">
          {question.right.map((item, index) => (
            <button
              key={index}
              ref={(element) => { rightRefs.current[index] = element; }}
              type="button"
              className="matching-item"
              aria-label={"오른쪽 " + rightLabels[index] + " " + item}
              disabled={locked || activeLeft === null}
              onClick={() => connect(index + 1)}
            >
              <strong>{rightLabels[index]}</strong><span>{item}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="matching-note" role="status">{connected} / {question.left.length}개 연결</p>
    </div>
  );
}
