import Ajv from "ajv";
import questionSchema from "../content/question.schema.json" with { type: "json" };
import categorySchema from "../content/category.schema.json" with { type: "json" };

const ajv = new Ajv({ allErrors: true });
ajv.addSchema(questionSchema, "question.schema.json");
const validate = ajv.compile(categorySchema);

export function compileQuestions(entries) {
  const bank = new Map();
  const contents = new Set();
  for (const { filename, data } of entries) {
    if (!validate(data)) {
      throw new Error(`${filename}: ${ajv.errorsText(validate.errors, { separator: "; " })}`);
    }
    const expected = `${data.category.toLowerCase().replaceAll(" ", "-")}.json`;
    if (filename !== expected) throw new Error(`${filename}: 카테고리 파일명은 ${expected}이어야 합니다.`);
    for (const question of data.questions) {
      if (bank.has(question.id)) throw new Error(`${filename}: 중복 ID ${question.id}`);
      if (new Set(question.options.map((option) => option.trim())).size !== 5) {
        throw new Error(`${filename}: ${question.id} 선택지가 중복됩니다.`);
      }
      const sourceUrls = new Set();
      for (const source of question.sources) {
        let url;
        try { url = new URL(source.url); } catch { /* 아래에서 문항 ID와 함께 보고합니다. */ }
        if (!url || url.protocol !== "https:" || !url.hostname || url.username || url.password || sourceUrls.has(url.href)) {
          throw new Error(`${filename}: ${question.id} 근거 URL이 유효하지 않거나 중복됩니다.`);
        }
        sourceUrls.add(url.href);
      }
      const contentKey = JSON.stringify([question.prompt.trim(), (question.code ?? "").trim()]);
      if (contents.has(contentKey)) throw new Error(`${filename}: ${question.id} 지문·코드가 기존 문항과 중복됩니다.`);
      contents.add(contentKey);
      bank.set(question.id, { ...question, category: data.category });
    }
  }
  return [...bank.values()];
}
