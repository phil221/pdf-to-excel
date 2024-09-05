import { ELAN_ACTIVITY_STR } from "./lib/constants";
import { readPdfText } from "pdf-text-reader";
import fs from "fs";

const fileName = "";

async function main() {
  const pdfText: string = await readPdfText({
    url: `./${fileName}.pdf`,
  });

  const segments = pdfText.split("\n").filter((s) => s && !/^[01]*$/i.test(s));

  const indexes: number[] = [];
  segments.forEach((seg, i) =>
    seg === ELAN_ACTIVITY_STR ? indexes.push(i) : null
  );

  const activityBlocks = indexes.map((index, i) => {
    const getAllSegmentsInBlock = () => {
      if (i === 0) {
        return segments.slice(index, indexes[i + 1]);
      }
      if (i === indexes.length - 1) {
        return segments.slice(index);
      }
      return segments.slice(index, indexes[i + 1]);
    };

    return {
      block: `New Activity block #${i + 1}`,
      segmentsInBlock: getAllSegmentsInBlock(),
    };
  });

  const spenders: string[] = [];
  const transactions: string[] = [];

  const dateRegex = /[0-9]{2}-[0-9]{2}$/;
  activityBlocks.forEach(({ segmentsInBlock }) => {
    // run through each list of segments and pull out two lists: spenders & transactions
    // dont worry about cross block syncing, just get the lists for each block
    segmentsInBlock.forEach((seg, i) => {
      const isTransactionSegment = dateRegex.test(seg.split(" ")[0]);
      const previousSegmentArray = segmentsInBlock[i - 1]
        ? segmentsInBlock[i - 1].split(" ")
        : [];
      const nextSegmentArray = segmentsInBlock[i + 1]
        ? segmentsInBlock[i + 1].split(" ")
        : [];

      if (seg.includes("CREDITS PURCHASES CASH ADV TOTAL ACTIVITY")) {
        const spender = seg.split(" ").slice(0, -6).join(" ").trim();
        spenders.push(spender);
      }
      if (isTransactionSegment && !dateRegex.test(previousSegmentArray[0])) {
        transactions.push(seg + " - START OF TRANSACTIONS BLOCK");
      }
      if (isTransactionSegment && !dateRegex.test(nextSegmentArray[0])) {
        transactions.push(seg + " - END OF TRANSACTIONS BLOCK");
      }
      if (
        isTransactionSegment &&
        dateRegex.test(nextSegmentArray[0]) &&
        dateRegex.test(previousSegmentArray[0])
      ) {
        transactions.push(seg);
      }
    });
  });

  // console.log(spenders.length);
  console.log(transactions);

  // fs.writeFile(
  //   `./${fileName}.js`,
  //   JSON.stringify(activityBlocks, null, 2),
  //   (err) => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }
  //   }
  // );
}

main();
