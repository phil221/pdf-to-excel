import { Text } from "pdf2json";

function parseSegmentFromText(t: Text) {
  return decodeURIComponent(t.R[0].T).trim();
}

export default parseSegmentFromText;
