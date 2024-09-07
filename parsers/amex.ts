import { Page } from "pdf2json";
import xlsx from "json-as-xlsx";
import { AMEX_ACTIVITY_STR } from "@lib/constants";
import pdfParser from "@lib/PDFParser";
import { Transaction } from "@lib/types";
import parseSegmentFromText from "@utils/parseSegmentFromText";

pdfParser.on("pdfParser_dataError", (errData) =>
  console.error(errData.parserError)
);

const convertAmex = (fileName: string) => {
  pdfParser.loadPDF(`./${fileName}.pdf`);

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    console.log("amex parser running...");
    const finder = (page: Page) =>
      page.Texts.some(
        (t) => decodeURIComponent(t.R[0].T) === AMEX_ACTIVITY_STR
      );
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

    const transactions = dateIndexes.map((d, i) => {
      if (i === 0) return billingChunk.slice(0, d);
      if (d === dateIndexes.at(-1)!) return billingChunk.slice(d);
      return billingChunk.slice(d, dateIndexes[i + 1]);
    });

    const content = transactions.reduce((acc: Transaction[], curr) => {
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
};

export default convertAmex;
