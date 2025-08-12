export function strip(input: string) {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.body.textContent?.trim() || "";
}
