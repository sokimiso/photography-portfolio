export async function fetchMenuTexts() {
  const res = await fetch("/api/texts/menu");
  return res.json();
}
