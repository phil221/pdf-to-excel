import convertAmex from "parsers/amex";
import convertElan from "parsers/elan";

async function main() {
  const fileName = process.argv[2].split("=")[1];
  const fileType = process.argv[3].split("=")[1];
  const convert = fileType === "elan" ? convertElan : convertAmex;

  try {
    convert(fileName);
  } catch (error) {
    console.error(error);
  }
}

main();
