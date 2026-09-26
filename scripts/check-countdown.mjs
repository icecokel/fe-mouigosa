import assert from "node:assert/strict";
import { formatTime, remainingSeconds } from "../app/countdown.mjs";

assert.equal(remainingSeconds(1_200_000, 0), 1200);
assert.equal(remainingSeconds(1_200_000, 1001), 1199);
assert.equal(remainingSeconds(1_200_000, 1_200_001), 0);
assert.equal(formatTime(1200), "20:00");
assert.equal(formatTime(59), "00:59");
assert.equal(formatTime(0), "00:00");

console.log("20분 카운트다운의 시작·진행·종료 표시를 확인했습니다.");
