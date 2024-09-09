import convert from "./convert";

async function main(fileName: string) {
  try {
    convert(fileName);
  } catch (error) {
    console.error(error);
  }
}

export default main;
