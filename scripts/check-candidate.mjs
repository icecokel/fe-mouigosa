import assert from "node:assert/strict";
import { createExamIdentity } from "../app/candidate.mjs";

assert.deepEqual(createExamIdentity(new Date("2026-09-25T14:59:59Z"), () => 0), {
  date: "2026-09-25", number: "20260925-000000",
});
assert.deepEqual(createExamIdentity(new Date("2026-09-25T15:00:00Z"), () => 0.999999), {
  date: "2026-09-26", number: "20260926-999999",
});
console.log("한국 시간 시행일 경계와 수험번호 생성을 확인했습니다.");
