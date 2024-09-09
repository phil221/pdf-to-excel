function handleError(e: unknown) {
  if (typeof e === "string") {
    throw Error(e);
  }
  if (e instanceof Error) {
    throw Error(e.message);
  } else {
    console.error(e);
    throw Error("Something went wrong...");
  }
}

export default handleError;
