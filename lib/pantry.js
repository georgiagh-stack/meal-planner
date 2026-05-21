// Items assumed to be in the stock cupboard — excluded from the Sainsbury's shop run.
// Add to this list as needed.
export const PANTRY_ITEMS = [
  "salt",
  "pepper",
  "black pepper",
  "olive oil",
  "vegetable oil",
  "oil",
  "honey",
  "soy sauce",
];

export function isPantryItem(ingredientText) {
  const lower = ingredientText.toLowerCase();
  return PANTRY_ITEMS.some((item) =>
    new RegExp(`\\b${item.replace(/\s+/g, "\\s+")}\\b`).test(lower)
  );
}
