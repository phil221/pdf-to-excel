import { ELAN_ACTIVITY_STR } from "./lib/constants";
import { readPdfText } from "pdf-text-reader";

import { Transaction } from "./main";

const fileName = "statements-2024-07-14";

async function main() {
  const pdfText: string = await readPdfText({
    url: `./${fileName}.pdf`,
  });

  const segments = pdfText.split("\n").filter((s) => s && !/^[01]*$/i.test(s));

  const indexes: number[] = [];
  segments.forEach((seg, i) =>
    seg === ELAN_ACTIVITY_STR ? indexes.push(i) : null
  );

  const fullActivityString = indexes
    .map((index, i) => {
      if (i === 0) {
        return segments.slice(index, indexes[i + 1]);
      }
      if (i === indexes.length - 1) {
        return segments.slice(index);
      }
      return segments.slice(index, indexes[i + 1]);
    })
    .flat();

  const dateRegex = /[0-9]{2}-[0-9]{2}$/;
  const isSpenderSegment = (seg: string) =>
    seg.includes(" CREDITS PURCHASES CASH ADV TOTAL ACTIVITY");
  const isTransactionSegment = (seg: string) =>
    dateRegex.test(seg.split(" ")[0]);

  type SpenderTransactionGroup = {
    spender: string;
    transactions: string[];
    spenderCounter: number;
  };

  const spenderTransactionGroups = [] as SpenderTransactionGroup[];
  let spenderCounter = 0;

  fullActivityString.forEach((seg) => {
    if (isSpenderSegment(seg)) {
      const spender = seg.split(" ").slice(0, -6).join(" ").trim();
      spenderCounter++;

      spenderTransactionGroups.push({
        spender,
        transactions: [],
        spenderCounter,
      });
    }

    if (isTransactionSegment(seg)) {
      const currentGroup = spenderTransactionGroups.find(
        (group) => group.spenderCounter === spenderCounter
      );
      if (currentGroup) {
        currentGroup?.transactions.push(seg);
      }
    }
  });
}

main();
