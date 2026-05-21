// ─────────────────────────────────────────────
//  WEEKLY UPDATE GUIDE
//  Each week, edit this file and push to GitHub.
//  Vercel will auto-deploy within ~30 seconds.
//
//  1. Update weekOf (shown in the header)
//  2. Replace the meals array with 5 new meals
//  3. Keep the same structure — id, day, name,
//     time, emoji, ingredients, method, tip
// ─────────────────────────────────────────────

export const weekOf = "18–22 May 2026";

export const meals = [
  {
    id: 1,
    day: "Monday",
    name: "Teriyaki Salmon with Edamame Rice",
    time: "25 min",
    emoji: "🐟",
    ingredients: [
      "4 salmon fillets (approx 130g each)",
      "200g jasmine rice",
      "200g frozen edamame beans",
      "4 tbsp soy sauce",
      "2 tbsp mirin",
      "1 tbsp honey",
      "2 tsp sesame seeds",
      "3 spring onions, sliced",
      "1 tsp sesame oil",
    ],
    method: [
      "Cook jasmine rice per packet instructions, add edamame for the last 3 minutes.",
      "Mix soy sauce, mirin and honey to make the teriyaki glaze.",
      "Heat a non-stick pan over medium-high heat, cook salmon skin-side down for 4 minutes.",
      "Flip salmon, pour over glaze, cook 3–4 more minutes basting as you go.",
      "Drain rice and edamame, stir through sesame oil.",
      "Serve salmon over rice topped with spring onions and sesame seeds.",
    ],
    tip: "Make extra glaze and store in the fridge — it keeps for a week and works great as a stir-fry sauce.",
  },
  {
    id: 2,
    day: "Tuesday",
    name: "Chicken & Chickpea Harissa Traybake",
    time: "35 min",
    emoji: "🍗",
    ingredients: [
      "8 chicken thighs, bone-in skin-on",
      "1 × 400g tin chickpeas, drained",
      "2 tbsp harissa paste",
      "300g cherry tomatoes",
      "1 large red onion, cut into wedges",
      "100g baby spinach",
      "1 lemon, halved",
      "2 tbsp olive oil",
      "Salt and pepper",
    ],
    method: [
      "Preheat oven to 220°C/200°C fan.",
      "Toss chicken, chickpeas and red onion with harissa and olive oil, season well.",
      "Spread in a roasting tin skin-side up, tuck in cherry tomatoes and lemon halves.",
      "Roast 25–30 minutes until skin is crispy and juices run clear.",
      "Squeeze roasted lemon over the tray and stir through baby spinach to wilt.",
      "Serve straight from the tray.",
    ],
    tip: "Leftovers are even better the next day — the chickpeas soak up all the harissa juices overnight.",
  },
  {
    id: 3,
    day: "Wednesday",
    name: "Lemon & Herb Baked Cod with Roasted Peppers & Quinoa",
    time: "25 min",
    emoji: "🐠",
    ingredients: [
      "4 cod fillets (approx 150g each)",
      "200g quinoa",
      "1 jar roasted red peppers, sliced",
      "200g cherry tomatoes, halved",
      "50g kalamata olives, pitted",
      "2 tbsp capers",
      "2 lemons (1 zested and juiced, 1 sliced)",
      "Small bunch flat-leaf parsley, chopped",
      "3 garlic cloves, minced",
      "3 tbsp olive oil",
      "Salt and pepper",
    ],
    method: [
      "Preheat oven to 200°C/180°C fan. Cook quinoa per packet instructions.",
      "Place cod in a baking dish, drizzle with 2 tbsp olive oil, lemon zest and juice, garlic. Season well.",
      "Lay lemon slices over cod, bake 15–18 minutes until it flakes easily.",
      "Toss roasted peppers, cherry tomatoes, olives and capers with remaining olive oil.",
      "Stir parsley through warm quinoa.",
      "Serve cod over quinoa with the pepper salad alongside, spoon over pan juices.",
    ],
    tip: "Use the leftover caper and olive brine as a quick salad dressing — add a splash of olive oil and it's done.",
  },
  {
    id: 4,
    day: "Thursday",
    name: "Greek Turkey Meatballs with Tzatziki & Flatbread",
    time: "25 min",
    emoji: "🥙",
    ingredients: [
      "500g turkey mince",
      "2 tsp dried oregano",
      "3 garlic cloves (2 minced for meatballs, 1 grated for tzatziki)",
      "1 egg",
      "30g breadcrumbs",
      "4 flatbreads",
      "300g cherry tomatoes, halved",
      "Half red onion, finely sliced",
      "200g Greek yogurt",
      "Half cucumber, grated and squeezed dry",
      "1 tbsp olive oil",
      "Small bunch mint",
      "Salt and pepper",
    ],
    method: [
      "Mix turkey mince with oregano, 2 minced garlic cloves, egg, breadcrumbs and seasoning. Roll into 20 small balls.",
      "Make tzatziki: combine yogurt, squeezed cucumber, grated garlic, olive oil and chopped mint. Season and chill.",
      "Heat 2 tbsp olive oil in a large frying pan over medium-high heat, cook meatballs 10–12 minutes turning until browned and cooked through.",
      "Warm flatbreads in a dry pan or oven for 1–2 minutes.",
      "Serve meatballs on flatbreads with tzatziki, cherry tomatoes and red onion.",
    ],
    tip: "Make double the tzatziki — it keeps for 3 days and works as a dip, dressing or sandwich spread.",
  },
  {
    id: 5,
    day: "Friday",
    name: "Prawn & Coconut Thai Green Curry",
    time: "20 min",
    emoji: "🍤",
    ingredients: [
      "400g raw king prawns, peeled",
      "200g jasmine rice",
      "2 tbsp Thai green curry paste",
      "1 × 400ml tin coconut milk",
      "150g mangetout",
      "150g baby corn, halved",
      "2 limes (1 juiced, 1 cut into wedges)",
      "Small bunch coriander",
      "1 tbsp vegetable oil",
      "1 tbsp fish sauce",
    ],
    method: [
      "Cook jasmine rice per packet instructions.",
      "Heat oil in a wok over high heat, add curry paste and fry 1 minute until fragrant.",
      "Pour in coconut milk, bring to a simmer, add mangetout and baby corn, cook 3 minutes.",
      "Add prawns and fish sauce, cook 3–4 minutes until prawns are pink.",
      "Squeeze in lime juice and taste for seasoning.",
      "Serve over rice with coriander and lime wedges.",
    ],
    tip: "Don't overcook the prawns — they only need 3–4 minutes and will toughen if left too long.",
  },
];

export const staples = [
  "Milk (2L)",
  "Bread (800g loaf)",
  "Greek yogurt (500g)",
  "Free range eggs (12)",
];
