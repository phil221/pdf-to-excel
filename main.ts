import convertAmex from "parsers/amex";
import convertElan from "parsers/elan";

async function main() {
  try {
    convertElan("statements-2024-07-14");
    convertAmex("amex-statement");
  } catch (error) {
    console.error(error);
  }
}

main();
