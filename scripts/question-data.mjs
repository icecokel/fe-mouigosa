import Ajv from "ajv";
import questionSchema from "../content/question.schema.json" with { type: "json" };
import categorySchema from "../content/category.schema.json" with { type: "json" };

const ajv = new Ajv({ allErrors: true });
ajv.addSchema(questionSchema, "question.schema.json");
const validateQuestionSchema = ajv.getSchema("question.schema.json");
const validateCategory = ajv.compile(categorySchema);

export function validateQuestionData(question, category) {
  if (!validateQuestionSchema(question)) {
    return validateQuestionSchema.errors.map(({ instancePath, message }) => `${instancePath || "/"} ${message}`);
  }

  const errors = [];
  if (category !== undefined && question.category !== category) {
    errors.push("문항 category가 파일 category와 다릅니다.");
  }
  if (question.options && new Set(question.options.map((option) => option.trim())).size !== 5) {
    errors.push("선택지가 중복됩니다.");
  }
  if (question.format === "선긋기" &&
      (new Set(question.left.map((item) => item.trim())).size !== question.left.length ||
       new Set(question.right.map((item) => item.trim())).size !== question.right.length ||
       question.left.length !== question.right.length ||
       question.answer.length !== question.left.length ||
       question.answer.some((value) => value > question.right.length))) {
    errors.push("선긋기 항목과 정답은 길이가 같은 1:1 대응이어야 합니다.");
  }
  const sourceUrls = new Set();
  for (const source of question.sources) {
    let url;
    try { url = new URL(source.url); } catch { /* 아래에서 오류로 보고합니다. */ }
    if (!url || url.protocol !== "https:" || !url.hostname || url.username || url.password || sourceUrls.has(url.href)) {
      errors.push("근거 URL이 유효하지 않거나 중복됩니다.");
      break;
    }
    sourceUrls.add(url.href);
  }
  return errors;
}

export function compileQuestions(entries) {
  const bank = new Map();
  const contents = new Set();
  for (const { filename, data } of entries) {
    if (!validateCategory(data)) {
      throw new Error(`${filename}: ${ajv.errorsText(validateCategory.errors, { separator: "; " })}`);
    }
    const expected = `${data.category.toLowerCase().replaceAll(".", "").replaceAll(/[^a-z0-9]+/g, "-")}.json`;
    if (filename !== expected) throw new Error(`${filename}: 카테고리 파일명은 ${expected}이어야 합니다.`);
    for (const question of data.questions) {
      if (bank.has(question.id)) throw new Error(`${filename}: 중복 ID ${question.id}`);
      const errors = validateQuestionData(question, data.category);
      if (errors.length) throw new Error(`${filename}: ${question.id} ${errors.join("; ")}`);
      const contentKey = JSON.stringify([question.prompt.trim(), (question.code ?? "").trim()]);
      if (contents.has(contentKey)) throw new Error(`${filename}: ${question.id} 지문·코드가 기존 문항과 중복됩니다.`);
      contents.add(contentKey);
      bank.set(question.id, question);
    }
  }
  return [...bank.values()];
}
