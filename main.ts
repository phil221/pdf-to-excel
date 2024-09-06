import { Page } from "pdf2json";
import xlsx from "json-as-xlsx";
import pdfParser from "./lib/PDFParser";
import parseSegmentFromText from "./utils/parseSegmentFromText";
import { AMEX_ACTIVITY_STR } from "./lib/constants";

export type Transaction = {
  spender: string;
  date: string;
  desc: string;
  amount: string;
  category: string;
};

const fileName = "";

pdfParser.on("pdfParser_dataError", (errData) =>
  console.error(errData.parserError)
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  const finder = (page: Page) =>
    page.Texts.some((t) => decodeURIComponent(t.R[0].T) === AMEX_ACTIVITY_STR);
  const relevantPage = pdfData.Pages.find(finder);
  if (!relevantPage) return { error: "Could not find relevant page" };

  const segments = relevantPage.Texts.map(parseSegmentFromText);
  const amountIndex = segments.findIndex((seg) => seg.includes("Amount"));
  const feesIndex = segments.findIndex((seg) => seg.includes("Fees"));
  const billingChunk = segments.slice(amountIndex + 1, feesIndex);
  const dateIndexes = billingChunk
    .map((seg, i) => {
      if (/\d{1,2}\/\d{1,2}\/\d{2}/.test(seg)) {
        return i;
      }
    })
    .filter((d) => d);

  const firstTransaction = billingChunk.slice(0, dateIndexes[0]);
  const secondTransaction = billingChunk.slice(dateIndexes[0], dateIndexes[1]);
  const thirdTransaction = billingChunk.slice(dateIndexes[1], dateIndexes[2]);
  const fourthTransaction = billingChunk.slice(dateIndexes[2], dateIndexes[3]);
  const fifthTransaction = billingChunk.slice(dateIndexes[3]);

  const content = [
    firstTransaction,
    secondTransaction,
    thirdTransaction,
    fourthTransaction,
    fifthTransaction,
  ].reduce((acc: Transaction[], curr) => {
    // first, need to wipe the 2nd - 4th to last fields. amount is always last,
    // date is always first, and after we wipe city, phone and state the rest can just
    // count as "description" since that field varies in segment amounts
    const desc = curr.slice(1, -4).join("\n");
    const amount = curr.at(-1) ?? "N/A";
    const date = curr[0];

    const item = {
      spender: "",
      date,
      desc,
      amount,
      category: "AI can help here",
    };

    acc.push(item);
    return acc;
  }, []);

  let data = [
    {
      sheet: "Monthly Spend - Amex",
      columns: [
        { label: "Spender", value: "spender" },
        { label: "Tran Date", value: "date" },
        { label: "Transaction Description", value: "desc" },
        { label: "Amount", value: "amount" },
        { label: "Accounting Classification", value: "category" },
      ],
      content,
    },
  ];

  let settings = {
    fileName: "amex_statement_summary",
    writeMode: "writeFile",
    writeOptions: {},
  };

  xlsx(data, settings);
});

pdfParser.loadPDF(fileName);
