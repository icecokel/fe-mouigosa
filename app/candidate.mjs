export function createExamIdentity(now = new Date(), random = Math.random) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const serial = String(Math.floor(random() * 1_000_000)).padStart(6, "0");
  return { date, number: `${date.replaceAll("-", "")}-${serial}` };
}
