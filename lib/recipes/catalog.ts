import type { Ingredient, Recipe, Step } from "../recipe";
import { RECIPE_PHOTOS } from "./image-sources";

// Helpers only reduce authoring repetition. Every exported record is plain JSON.
const ingredient = (name: string, amount: number, unit: string, note?: string): Ingredient =>
  ({ name, amount, unit, ...(note ? { note } : {}) });
const step = (id: string, title: string, instruction: string, ingredients: string[], durationSeconds?: number, safety?: string, tip?: string): Step =>
  ({ id, title, instruction, ingredients, ...(durationSeconds ? { durationSeconds } : {}), ...(safety ? { safety } : {}), ...(tip ? { tip } : {}) });
const poultry = "Keep raw poultry separate from ready-to-eat food, wash hands and utensils, and check the thickest pieces reach 165°F (74°C) with a thermometer.";
const groundMeat = "Check ground beef reaches 160°F (71°C) with a food thermometer; color alone does not show it is safe.";
const riceSafety = "Use freshly cooked rice or rice promptly refrigerated within two hours. Reheat refrigerated rice to 165°F (74°C).";
const leftovers = "Refrigerate leftovers in shallow containers within two hours, use within three to four days, and reheat to 165°F (74°C).";

type Entry = Pick<Recipe, "id" | "title" | "description" | "cuisine" | "tags" | "prepMinutes" | "cookMinutes" | "servings" | "ingredients" | "steps"> & { image?: string };
function recipe(entry: Entry): Recipe {
  const image = entry.image ?? RECIPE_PHOTOS[entry.id]?.image;
  return {
    ...entry,
    image: image ?? "/recipes/placeholder.svg",
    imageKind: image ? "photo" : "placeholder",
    totalMinutes: entry.prepMinutes + entry.cookMinutes,
    emoji: "🍽️",
    calories: null,
    nutrition: { status: "unavailable", reason: "No verified nutrition calculation is available for this recipe." },
  };
}

export const ADDITIONAL_RECIPES: Recipe[] = [
  recipe({
    id: "tomato-beef-stew", title: "Tomato Beef Stew", description: "A Chinese-inspired tomato and ginger beef stew with tender potatoes and a rich broth.", cuisine: "Chinese-inspired", tags: ["beef", "stew", "make-ahead"], image: "/recipes/tomato-beef-stew.jpg", prepMinutes: 20, cookMinutes: 110, servings: 4,
    ingredients: [ingredient("beef chuck", 1.5, "pound", "cut into one-inch cubes"), ingredient("neutral oil", 2, "tablespoon"), ingredient("onion", 1, "", "diced"), ingredient("garlic", 3, "clove", "minced"), ingredient("fresh ginger", 1, "tablespoon", "minced"), ingredient("tomatoes", 4, "", "chopped"), ingredient("tomato paste", 2, "tablespoon"), ingredient("low-sodium beef broth", 3, "cup"), ingredient("soy sauce", 2, "tablespoon"), ingredient("potatoes", 1, "pound", "peeled and cubed"), ingredient("carrots", 2, "", "sliced"), ingredient("black pepper", 0.25, "teaspoon")],
    steps: [
      step("prep", "Prepare the ingredients", "Chop the vegetables and pat the beef dry. Keep the potatoes in cold water until needed, then drain.", ["beef chuck", "onion", "garlic", "fresh ginger", "tomatoes", "potatoes", "carrots"], undefined, "Use separate boards for raw beef and vegetables; wash hands and utensils after handling beef."),
      step("brown", "Brown the beef", "Heat the oil in a heavy pot over medium-high heat. Brown the beef in two batches for about eight minutes total, then transfer to a clean plate.", ["neutral oil", "beef chuck"], 480),
      step("base", "Build the tomato base", "Lower to medium heat and cook the onion for five minutes. Stir in garlic, ginger and tomato paste for one minute, then add tomatoes and cook for five minutes.", ["onion", "garlic", "fresh ginger", "tomato paste", "tomatoes"], 660),
      step("simmer", "Simmer the beef", "Return the beef and its juices to the pot with broth, soy sauce and pepper. Bring to a simmer, cover and cook gently for seventy minutes, stirring occasionally.", ["beef chuck", "low-sodium beef broth", "soy sauce", "black pepper"], 4200, undefined, "Add a little water if the stew begins sticking."),
      step("vegetables", "Add the vegetables", "Add drained potatoes and carrots and simmer covered for twenty-five minutes. Continue cooking if needed until the beef is fork-tender and the vegetables are soft; serve hot.", ["potatoes", "carrots"], 1500, leftovers),
    ],
  }),
  recipe({
    id: "chicken-curry", title: "Chicken Curry", description: "An approachable Indian-inspired chicken curry with tomatoes, warming spices and coconut milk.", cuisine: "Indian-inspired", tags: ["chicken", "curry", "one-pot"], image: "/recipes/chicken-curry.jpg", prepMinutes: 15, cookMinutes: 30, servings: 4,
    ingredients: [ingredient("boneless chicken thighs", 1.5, "pound", "cut into bite-size pieces"), ingredient("neutral oil", 2, "tablespoon"), ingredient("onion", 1, "", "diced"), ingredient("garlic", 4, "clove", "minced"), ingredient("fresh ginger", 1, "tablespoon", "grated"), ingredient("curry powder", 2, "tablespoon"), ingredient("ground cumin", 1, "teaspoon"), ingredient("salt", 0.75, "teaspoon"), ingredient("canned diced tomatoes", 14, "ounce"), ingredient("coconut milk", 13.5, "ounce"), ingredient("water", 0.5, "cup"), ingredient("cilantro", 0.25, "cup", "chopped")],
    steps: [
      step("prep", "Prepare the curry ingredients", "Dice the onion, mince the garlic and grate the ginger. Cut the chicken on a separate board into evenly sized pieces.", ["onion", "garlic", "fresh ginger", "boneless chicken thighs"], undefined, poultry),
      step("aromatics", "Soften the onion", "Heat oil in a deep skillet over medium heat. Cook the onion for seven minutes, stirring, then add garlic and ginger and cook for one minute.", ["neutral oil", "onion", "garlic", "fresh ginger"], 480),
      step("spices", "Add spices and chicken", "Stir in curry powder, cumin and salt for thirty seconds. Add chicken and stir for three minutes to coat it with the spices.", ["curry powder", "ground cumin", "salt", "boneless chicken thighs"], 180),
      step("simmer", "Simmer the curry", "Add tomatoes, coconut milk and water. Bring to a gentle simmer and cook uncovered for eighteen minutes, stirring occasionally, until the chicken reaches 165°F (74°C).", ["canned diced tomatoes", "coconut milk", "water"], 1080, poultry),
      step("serve", "Finish the curry", "If the sauce is thin, simmer a few minutes longer; if too thick, add a splash of water. Scatter cilantro over the curry and divide among four bowls.", ["cilantro"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "bibimbap", title: "Bibimbap", description: "Korean rice bowls with seasoned beef, sauteed vegetables, fully cooked eggs and a gochujang sauce.", cuisine: "Korean", tags: ["rice", "beef", "bowl"], image: "/recipes/bibimbap.jpg", prepMinutes: 20, cookMinutes: 25, servings: 2,
    ingredients: [ingredient("short-grain rice", 1, "cup", "uncooked"), ingredient("water", 1.25, "cup"), ingredient("ground beef", 0.5, "pound"), ingredient("soy sauce", 1, "tablespoon"), ingredient("sesame oil", 2, "teaspoon"), ingredient("garlic", 2, "clove", "minced"), ingredient("neutral oil", 2, "tablespoon", "divided"), ingredient("carrot", 1, "", "cut into matchsticks"), ingredient("zucchini", 1, "", "thinly sliced"), ingredient("spinach", 4, "cup"), ingredient("eggs", 2, ""), ingredient("gochujang", 2, "tablespoon"), ingredient("rice vinegar", 1, "tablespoon"), ingredient("sugar", 1, "teaspoon"), ingredient("sesame seeds", 1, "teaspoon")],
    steps: [
      step("rice", "Cook the rice", "Rinse the rice and put in a saucepan with water. Bring to a boil, cover and cook on low for fifteen minutes, then rest off the heat for ten minutes; follow the rice package if its water ratio differs.", ["short-grain rice", "water"], 900, riceSafety),
      step("sauce", "Mix the sauce", "Mix gochujang, rice vinegar and sugar in a small bowl. Prepare the vegetables while the rice cooks.", ["gochujang", "rice vinegar", "sugar", "carrot", "zucchini", "spinach"]),
      step("vegetables", "Cook the vegetables", "Heat one tablespoon neutral oil in a skillet over medium-high heat. Cook carrot for three minutes, zucchini for three minutes and spinach for one minute in separate batches; set each aside.", ["neutral oil", "carrot", "zucchini", "spinach"], 420),
      step("beef", "Cook the beef", "In the same skillet, cook beef with garlic and soy sauce for six to eight minutes, breaking it up until it reaches 160°F (71°C). Stir in sesame oil and transfer to a clean bowl.", ["ground beef", "garlic", "soy sauce", "sesame oil"], 480, groundMeat),
      step("eggs", "Cook the eggs", "Heat the remaining tablespoon neutral oil over medium heat. Fry the eggs until both whites and yolks are firm, covering the pan briefly if needed.", ["neutral oil", "eggs"], 240, "Wash hands after handling eggs and cook both yolks and whites until firm."),
      step("assemble", "Assemble the bowls", "Divide rice between two bowls. Arrange vegetables and beef on top, add an egg to each, then sprinkle sesame seeds and serve with the sauce to mix through.", ["short-grain rice", "sesame seeds"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "garlic-butter-shrimp", title: "Garlic Butter Shrimp", description: "Quick skillet shrimp with garlic butter, lemon and fresh parsley.", cuisine: "American", tags: ["seafood", "quick", "one-pan"], image: "/recipes/garlic-butter-shrimp.jpg", prepMinutes: 10, cookMinutes: 10, servings: 2,
    ingredients: [ingredient("raw shrimp", 1, "pound", "peeled and deveined; thawed"), ingredient("butter", 3, "tablespoon", "divided"), ingredient("olive oil", 1, "tablespoon"), ingredient("garlic", 4, "clove", "minced"), ingredient("salt", 0.5, "teaspoon"), ingredient("black pepper", 0.25, "teaspoon"), ingredient("lemon juice", 2, "tablespoon"), ingredient("parsley", 2, "tablespoon", "chopped")],
    steps: [
      step("prep", "Prepare the shrimp", "Pat thawed shrimp dry and season with salt and pepper. Mince the garlic and chop the parsley.", ["raw shrimp", "salt", "black pepper", "garlic", "parsley"], undefined, "Thaw shrimp in the refrigerator, keep chilled until cooking, and wash hands after handling raw seafood."),
      step("sear", "Sear the shrimp", "Heat olive oil and one tablespoon butter over medium-high heat. Add shrimp in one layer and cook for two minutes, then flip.", ["olive oil", "butter", "raw shrimp"], 120),
      step("garlic", "Add garlic butter", "Lower to medium heat and add remaining butter and garlic. Stir for two to three minutes until shrimp are firm, pearly and opaque throughout; remove promptly when cooked.", ["butter", "garlic", "raw shrimp"], 180, "Shrimp must be opaque throughout; do not rely only on exterior pink color."),
      step("finish", "Finish and serve", "Turn off the heat. Stir in lemon juice and parsley and divide the shrimp and sauce between two plates.", ["lemon juice", "parsley"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "spaghetti-pomodoro", title: "Spaghetti Pomodoro", description: "Spaghetti tossed with a simple garlic, tomato and basil sauce.", cuisine: "Italian", tags: ["pasta", "vegetarian", "weeknight"], prepMinutes: 10, cookMinutes: 25, servings: 4,
    ingredients: [ingredient("spaghetti", 12, "ounce"), ingredient("olive oil", 2, "tablespoon"), ingredient("garlic", 4, "clove", "thinly sliced"), ingredient("canned crushed tomatoes", 28, "ounce"), ingredient("salt", 2, "teaspoon", "divided; one and a half for pasta water"), ingredient("black pepper", 0.25, "teaspoon"), ingredient("fresh basil", 0.5, "cup", "torn"), ingredient("parmesan", 0.25, "cup", "grated"), ingredient("water", 12, "cup", "for boiling pasta")],
    steps: [
      step("sauce", "Start the sauce", "Heat oil over medium-low heat in a wide pan. Cook garlic for one minute without browning, then add tomatoes, half a teaspoon salt and pepper.", ["olive oil", "garlic", "canned crushed tomatoes", "salt", "black pepper"], 60),
      step("simmer", "Simmer the tomatoes", "Simmer the sauce gently for twenty minutes, stirring occasionally. Meanwhile bring the water and remaining salt to a boil in a large pot.", ["water", "salt"], 1200),
      step("pasta", "Cook the spaghetti", "Cook spaghetti in the boiling water for the package's al dente time, usually eight to eleven minutes. Reserve half a cup of pasta water, then drain carefully.", ["spaghetti"], undefined, "Keep your face and hands away from rising steam when draining."),
      step("finish", "Toss and serve", "Toss spaghetti with sauce and basil over low heat for one minute. Add reserved pasta water a little at a time if needed, then serve with parmesan.", ["spaghetti", "fresh basil", "parmesan"], 60, leftovers),
    ],
  }),
  recipe({
    id: "chickpea-spinach-curry", title: "Chickpea Spinach Curry", description: "A filling meat-free tomato curry with chickpeas and spinach.", cuisine: "Indian-inspired", tags: ["vegan", "legumes", "one-pot"], prepMinutes: 10, cookMinutes: 25, servings: 4,
    ingredients: [ingredient("canned chickpeas", 30, "ounce", "drained and rinsed"), ingredient("onion", 1, "", "diced"), ingredient("neutral oil", 2, "tablespoon"), ingredient("garlic", 3, "clove", "minced"), ingredient("fresh ginger", 1, "tablespoon", "grated"), ingredient("curry powder", 1, "tablespoon"), ingredient("canned crushed tomatoes", 14, "ounce"), ingredient("coconut milk", 13.5, "ounce"), ingredient("spinach", 5, "cup"), ingredient("salt", 0.5, "teaspoon"), ingredient("lemon juice", 1, "tablespoon")],
    steps: [
      step("prep", "Prepare the ingredients", "Drain and rinse chickpeas. Dice onion, mince garlic, grate ginger and wash the spinach.", ["canned chickpeas", "onion", "garlic", "fresh ginger", "spinach"]),
      step("aromatics", "Cook the aromatics", "Heat oil in a saucepan over medium heat. Cook onion for six minutes, then stir in garlic, ginger and curry powder for one minute.", ["neutral oil", "onion", "garlic", "fresh ginger", "curry powder"], 420),
      step("simmer", "Simmer the chickpeas", "Add chickpeas, tomatoes, coconut milk and salt. Simmer uncovered for fifteen minutes, stirring occasionally.", ["canned chickpeas", "canned crushed tomatoes", "coconut milk", "salt"], 900),
      step("finish", "Wilt the spinach", "Add spinach in handfuls and stir for two minutes until wilted. Turn off the heat, stir in lemon juice and serve hot.", ["spinach", "lemon juice"], 120, leftovers),
    ],
  }),
  recipe({
    id: "miso-soup", title: "Miso Soup", description: "A light Japanese soup with tofu, wakame and miso stirred in gently at the end.", cuisine: "Japanese", tags: ["soup", "quick", "tofu"], prepMinutes: 5, cookMinutes: 10, servings: 2,
    ingredients: [ingredient("prepared dashi", 3, "cup", "unsalted"), ingredient("silken tofu", 6, "ounce", "cubed"), ingredient("dried wakame", 1, "teaspoon"), ingredient("white miso", 2, "tablespoon"), ingredient("scallions", 2, "", "thinly sliced")],
    steps: [
      step("prep", "Prepare tofu and scallions", "Drain the tofu and cut into small cubes. Wash and thinly slice the scallions.", ["silken tofu", "scallions"]),
      step("broth", "Heat the broth", "Bring dashi to a gentle simmer in a saucepan. Add wakame and simmer for three minutes to rehydrate it.", ["prepared dashi", "dried wakame"], 180),
      step("tofu", "Warm the tofu", "Add tofu carefully and simmer gently for two minutes until hot. Turn off the heat.", ["silken tofu"], 120),
      step("miso", "Stir in miso", "Whisk miso with a ladle of warm broth in a small bowl until smooth, then stir it back into the pot. Add scallions and serve immediately; avoid boiling after adding miso.", ["white miso", "scallions"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "teriyaki-salmon", title: "Teriyaki Salmon", description: "Oven-baked salmon brushed with a homemade soy and ginger glaze.", cuisine: "Japanese-inspired", tags: ["fish", "oven", "weeknight"], prepMinutes: 10, cookMinutes: 20, servings: 2,
    ingredients: [ingredient("salmon fillets", 12, "ounce", "two equal fillets"), ingredient("soy sauce", 2, "tablespoon"), ingredient("water", 2, "tablespoon"), ingredient("honey", 1, "tablespoon"), ingredient("rice vinegar", 1, "tablespoon"), ingredient("fresh ginger", 1, "teaspoon", "grated"), ingredient("garlic", 1, "clove", "minced"), ingredient("neutral oil", 1, "teaspoon"), ingredient("sesame seeds", 1, "teaspoon")],
    steps: [
      step("prep", "Prepare the oven", "Heat the oven to 400°F (200°C). Oil a baking dish and place salmon skin-side down in it.", ["neutral oil", "salmon fillets"], undefined, "Keep raw fish and its utensils separate from cooked food; wash hands after handling."),
      step("glaze", "Make the glaze", "Simmer soy sauce, water, honey, vinegar, ginger and garlic in a small saucepan for four minutes until slightly thickened. Set aside half in a clean bowl for serving.", ["soy sauce", "water", "honey", "rice vinegar", "fresh ginger", "garlic"], 240),
      step("bake", "Bake the salmon", "Brush salmon with the remaining glaze. Bake for twelve to sixteen minutes, until a thermometer in the thickest part reads 145°F (63°C).", ["salmon fillets"], 720, "Cooking time depends on thickness; use a thermometer and do not reuse a brush that touched raw fish on cooked salmon."),
      step("serve", "Finish and serve", "Spoon the reserved clean glaze over the cooked salmon and sprinkle with sesame seeds. Divide between two plates.", ["sesame seeds"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "vegetable-fried-rice", title: "Vegetable Fried Rice", description: "A quick Chinese-inspired skillet rice with peas, carrots and scrambled eggs.", cuisine: "Chinese-inspired", tags: ["rice", "vegetarian", "quick"], prepMinutes: 10, cookMinutes: 15, servings: 2,
    ingredients: [ingredient("cooked rice", 3, "cup", "properly chilled"), ingredient("eggs", 2, "", "beaten"), ingredient("neutral oil", 2, "tablespoon", "divided"), ingredient("carrot", 1, "", "finely diced"), ingredient("frozen peas", 0.5, "cup"), ingredient("garlic", 2, "clove", "minced"), ingredient("scallions", 2, "", "sliced"), ingredient("soy sauce", 2, "tablespoon"), ingredient("sesame oil", 1, "teaspoon")],
    steps: [
      step("prep", "Prepare the ingredients", "Break up chilled rice clumps with a fork. Dice carrot, mince garlic and slice scallions; beat eggs in a bowl.", ["cooked rice", "carrot", "garlic", "scallions", "eggs"], undefined, riceSafety),
      step("eggs", "Scramble the eggs", "Heat one tablespoon neutral oil in a large skillet over medium-high heat. Scramble eggs for two minutes until set, then transfer to a clean plate.", ["neutral oil", "eggs"], 120),
      step("vegetables", "Cook the vegetables", "Add remaining neutral oil and carrot to the pan and cook for four minutes. Add peas, garlic and scallions and stir for two minutes.", ["neutral oil", "carrot", "frozen peas", "garlic", "scallions"], 360),
      step("rice", "Fry the rice", "Add rice and soy sauce and stir-fry for five minutes, breaking up any clumps. Return eggs and stir in sesame oil; heat everything to 165°F (74°C), then serve.", ["cooked rice", "soy sauce", "eggs", "sesame oil"], 300, riceSafety),
    ],
  }),
  recipe({
    id: "homemade-tacos", title: "Homemade Tacos", description: "Weeknight ground beef tacos with crisp lettuce, tomatoes and a simple spice blend.", cuisine: "Mexican-inspired", tags: ["beef", "quick", "family"], prepMinutes: 15, cookMinutes: 15, servings: 4,
    ingredients: [ingredient("ground beef", 1, "pound"), ingredient("onion", 1, "", "diced"), ingredient("neutral oil", 1, "tablespoon"), ingredient("ground cumin", 2, "teaspoon"), ingredient("chili powder", 2, "teaspoon", "mild blend"), ingredient("salt", 0.5, "teaspoon"), ingredient("tomato paste", 1, "tablespoon"), ingredient("water", 0.5, "cup"), ingredient("small corn tortillas", 8, ""), ingredient("lettuce", 2, "cup", "shredded"), ingredient("tomatoes", 2, "", "diced"), ingredient("cheddar", 0.5, "cup", "grated"), ingredient("lime", 1, "", "cut into wedges")],
    steps: [
      step("prep", "Prepare the toppings", "Wash and shred lettuce, dice tomatoes and onion, grate cheese and cut lime into wedges. Keep the toppings away from raw beef.", ["lettuce", "tomatoes", "onion", "cheddar", "lime"]),
      step("beef", "Cook the beef", "Heat oil over medium-high heat and cook onion for three minutes. Add beef and cook for seven minutes, breaking it into crumbles, until it reaches 160°F (71°C); carefully drain excess fat.", ["neutral oil", "onion", "ground beef"], 600, groundMeat),
      step("season", "Season the filling", "Stir in cumin, chili powder, salt, tomato paste and water. Simmer for four minutes until the filling is moist but not watery.", ["ground cumin", "chili powder", "salt", "tomato paste", "water"], 240),
      step("serve", "Warm and fill tortillas", "Warm tortillas in a dry skillet for about thirty seconds per side. Divide beef among tortillas and top with lettuce, tomatoes and cheese; serve with lime wedges.", ["small corn tortillas", "lettuce", "tomatoes", "cheddar", "lime"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "black-bean-quesadillas", title: "Black Bean Quesadillas", description: "Crisp folded tortillas filled with seasoned black beans, corn and melted cheese.", cuisine: "Mexican-inspired", tags: ["vegetarian", "beans", "quick"], prepMinutes: 10, cookMinutes: 15, servings: 2,
    ingredients: [ingredient("canned black beans", 15, "ounce", "drained and rinsed"), ingredient("frozen corn", 0.5, "cup", "thawed"), ingredient("ground cumin", 1, "teaspoon"), ingredient("salt", 0.25, "teaspoon"), ingredient("lime juice", 1, "tablespoon"), ingredient("flour tortillas", 4, "", "eight-inch"), ingredient("cheddar", 1, "cup", "grated"), ingredient("neutral oil", 2, "teaspoon", "divided")],
    steps: [
      step("filling", "Mix the filling", "Drain and rinse beans and thaw corn. Mash half the beans, then mix with remaining beans, corn, cumin, salt and lime juice.", ["canned black beans", "frozen corn", "ground cumin", "salt", "lime juice"]),
      step("assemble", "Fill the tortillas", "Divide the filling and cheese over one half of each tortilla. Fold the empty halves over and gently press flat.", ["flour tortillas", "cheddar"]),
      step("cook", "Cook in batches", "Heat one teaspoon oil in a skillet over medium heat. Cook two quesadillas for three minutes per side until crisp and hot throughout; repeat with remaining oil and quesadillas.", ["neutral oil", "flour tortillas"], 180, "Turn down the heat if tortillas brown before the cheese melts."),
      step("serve", "Slice and serve", "Rest for one minute so the filling settles. Cut each quesadilla into wedges and serve two per person.", [], 60, leftovers),
    ],
  }),
  recipe({
    id: "greek-chickpea-salad", title: "Greek Chickpea Salad", description: "A fresh chickpea salad with cucumber, tomatoes, olives and feta in a lemon dressing.", cuisine: "Greek-inspired", tags: ["vegetarian", "no-cook", "salad"], prepMinutes: 20, cookMinutes: 0, servings: 4,
    ingredients: [ingredient("canned chickpeas", 30, "ounce", "drained and rinsed"), ingredient("cucumber", 1, "", "diced"), ingredient("cherry tomatoes", 2, "cup", "halved"), ingredient("red onion", 0.5, "", "finely diced"), ingredient("pitted olives", 0.5, "cup", "sliced"), ingredient("feta", 4, "ounce", "crumbled; pasteurized"), ingredient("olive oil", 3, "tablespoon"), ingredient("lemon juice", 2, "tablespoon"), ingredient("dried oregano", 1, "teaspoon"), ingredient("black pepper", 0.25, "teaspoon")],
    steps: [
      step("prep", "Wash and chop", "Wash cucumber and tomatoes, then dice cucumber and halve tomatoes. Dice onion, slice olives and drain and rinse chickpeas.", ["cucumber", "cherry tomatoes", "red onion", "pitted olives", "canned chickpeas"]),
      step("dressing", "Mix the dressing", "Whisk olive oil, lemon juice, oregano and pepper in a large bowl.", ["olive oil", "lemon juice", "dried oregano", "black pepper"]),
      step("toss", "Toss the salad", "Add chickpeas, vegetables and olives and toss well. Fold in feta gently so it stays in small pieces.", ["canned chickpeas", "cucumber", "cherry tomatoes", "red onion", "pitted olives", "feta"]),
      step("serve", "Serve or chill", "Divide among four bowls, or cover and refrigerate until serving. Stir once more before serving to redistribute the dressing.", [], undefined, "Keep the salad refrigerated at 40°F (4°C) or below and refrigerate within two hours of preparation."),
    ],
  }),
  recipe({
    id: "lentil-vegetable-soup", title: "Lentil Vegetable Soup", description: "A hearty Mediterranean-inspired soup with brown lentils, tomatoes and vegetables.", cuisine: "Mediterranean-inspired", tags: ["vegan", "soup", "make-ahead"], prepMinutes: 15, cookMinutes: 40, servings: 4,
    ingredients: [ingredient("brown lentils", 1, "cup", "dry; rinsed and picked over"), ingredient("olive oil", 2, "tablespoon"), ingredient("onion", 1, "", "diced"), ingredient("carrots", 2, "", "diced"), ingredient("celery stalks", 2, "", "diced"), ingredient("garlic", 3, "clove", "minced"), ingredient("canned diced tomatoes", 14, "ounce"), ingredient("vegetable broth", 5, "cup"), ingredient("dried thyme", 1, "teaspoon"), ingredient("salt", 0.5, "teaspoon"), ingredient("lemon juice", 2, "tablespoon")],
    steps: [
      step("prep", "Prepare the vegetables", "Rinse lentils and remove any debris. Dice onion, carrots and celery and mince garlic.", ["brown lentils", "onion", "carrots", "celery stalks", "garlic"]),
      step("saute", "Soften the vegetables", "Heat oil in a large pot over medium heat. Cook onion, carrots and celery for seven minutes; stir in garlic for one minute.", ["olive oil", "onion", "carrots", "celery stalks", "garlic"], 480),
      step("simmer", "Cook the lentils", "Add lentils, tomatoes, broth, thyme and salt. Bring to a boil, then simmer partially covered for thirty minutes, until lentils are tender; add water if needed.", ["brown lentils", "canned diced tomatoes", "vegetable broth", "dried thyme", "salt"], 1800),
      step("finish", "Finish the soup", "Stir in lemon juice. For a thicker soup, mash a few lentils against the side of the pot; divide among four bowls.", ["lemon juice"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "shakshuka", title: "Shakshuka", description: "Eggs gently cooked in a spiced tomato and pepper sauce, served with bread.", cuisine: "North African-inspired", tags: ["vegetarian", "eggs", "one-pan"], prepMinutes: 15, cookMinutes: 30, servings: 2,
    ingredients: [ingredient("olive oil", 2, "tablespoon"), ingredient("onion", 1, "", "diced"), ingredient("red bell pepper", 1, "", "diced"), ingredient("garlic", 3, "clove", "minced"), ingredient("ground cumin", 1, "teaspoon"), ingredient("paprika", 1, "teaspoon"), ingredient("salt", 0.5, "teaspoon"), ingredient("canned crushed tomatoes", 28, "ounce"), ingredient("eggs", 4, ""), ingredient("parsley", 2, "tablespoon", "chopped"), ingredient("bread", 4, "", "slices")],
    steps: [
      step("vegetables", "Cook the vegetables", "Heat oil in a deep skillet over medium heat. Cook diced onion and pepper for eight minutes until soft, stirring regularly.", ["olive oil", "onion", "red bell pepper"], 480),
      step("sauce", "Simmer the sauce", "Add garlic, cumin, paprika and salt and cook for one minute. Stir in tomatoes and simmer uncovered for twelve minutes until thickened.", ["garlic", "ground cumin", "paprika", "salt", "canned crushed tomatoes"], 720),
      step("eggs", "Cook the eggs", "Make four wells in the sauce and crack one egg into each. Cover and cook on low for eight to ten minutes until both whites and yolks are firm.", ["eggs"], 480, "Cook eggs until whites and yolks are firm; wash hands after handling shells."),
      step("serve", "Finish and serve", "Scatter parsley over the eggs and sauce. Divide between two plates and serve with bread for scooping.", ["parsley", "bread"], undefined, leftovers),
    ],
  }),
  recipe({
    id: "thai-basil-chicken", title: "Thai Basil Chicken", description: "A Thai-inspired chicken stir-fry with basil and a savory garlic sauce.", cuisine: "Thai-inspired", tags: ["chicken", "stir-fry", "quick"], prepMinutes: 15, cookMinutes: 15, servings: 2,
    ingredients: [ingredient("boneless chicken thighs", 1, "pound", "finely chopped"), ingredient("neutral oil", 1, "tablespoon"), ingredient("garlic", 4, "clove", "minced"), ingredient("red chili", 1, "", "sliced; remove seeds for less heat"), ingredient("green beans", 1, "cup", "cut into one-inch pieces"), ingredient("soy sauce", 1, "tablespoon"), ingredient("oyster sauce", 1, "tablespoon"), ingredient("sugar", 1, "teaspoon"), ingredient("water", 2, "tablespoon"), ingredient("Thai basil leaves", 1, "cup"), ingredient("cooked rice", 2, "cup", "freshly cooked")],
    steps: [
      step("prep", "Prepare sauce and ingredients", "Mix soy sauce, oyster sauce, sugar and water in a bowl. Prepare garlic, chili and beans, then chop chicken on a separate board.", ["soy sauce", "oyster sauce", "sugar", "water", "garlic", "red chili", "green beans", "boneless chicken thighs"], undefined, poultry),
      step("aromatics", "Start the stir-fry", "Heat oil in a large skillet over medium-high heat. Stir-fry garlic and chili for thirty seconds, then add chicken and cook for five minutes, stirring often.", ["neutral oil", "garlic", "red chili", "boneless chicken thighs"], 300),
      step("beans", "Cook with the sauce", "Add beans and prepared sauce. Cook for five to seven minutes until beans are tender-crisp and chicken reaches 165°F (74°C); add a splash of water if the pan dries out.", ["green beans"], 420, poultry),
      step("basil", "Add basil and serve", "Turn off the heat and fold in basil until wilted. Serve over the freshly cooked rice.", ["Thai basil leaves", "cooked rice"], undefined, riceSafety),
    ],
  }),
  recipe({
    id: "lemon-herb-chicken", title: "Lemon Herb Chicken", description: "Roasted chicken thighs and potatoes with lemon, garlic and oregano.", cuisine: "Mediterranean-inspired", tags: ["chicken", "oven", "sheet-pan"], prepMinutes: 15, cookMinutes: 40, servings: 4,
    ingredients: [ingredient("boneless chicken thighs", 1.5, "pound"), ingredient("potatoes", 1.5, "pound", "cut into three-quarter-inch pieces"), ingredient("olive oil", 3, "tablespoon", "divided"), ingredient("lemon juice", 3, "tablespoon"), ingredient("garlic", 4, "clove", "minced"), ingredient("dried oregano", 2, "teaspoon"), ingredient("salt", 1, "teaspoon", "divided"), ingredient("black pepper", 0.5, "teaspoon", "divided")],
    steps: [
      step("potatoes", "Start the potatoes", "Heat the oven to 425°F (220°C). Toss potatoes with one tablespoon oil, half the salt and half the pepper on a rimmed baking sheet; roast for fifteen minutes.", ["potatoes", "olive oil", "salt", "black pepper"], 900),
      step("season", "Season the chicken", "Mix remaining oil, salt and pepper with lemon juice, garlic and oregano in a bowl. Add chicken and turn to coat.", ["olive oil", "salt", "black pepper", "lemon juice", "garlic", "dried oregano", "boneless chicken thighs"], undefined, poultry),
      step("roast", "Roast together", "Turn potatoes and add chicken to the sheet in one layer. Roast for twenty to twenty-five minutes until potatoes are tender and chicken reaches 165°F (74°C).", ["boneless chicken thighs", "potatoes"], 1500, poultry),
      step("serve", "Rest and serve", "Rest the chicken for five minutes, then divide chicken and potatoes among four plates. Discard any uncooked marinade left in the bowl.", [], 300, leftovers),
    ],
  }),
  recipe({
    id: "avocado-pasta", title: "Avocado Pasta", description: "Pasta with a fresh avocado, lemon and basil sauce, best eaten immediately.", cuisine: "Italian-inspired", tags: ["vegan", "pasta", "quick"], prepMinutes: 10, cookMinutes: 10, servings: 2,
    ingredients: [ingredient("pasta", 6, "ounce"), ingredient("ripe avocado", 1, ""), ingredient("lemon juice", 2, "tablespoon"), ingredient("olive oil", 1, "tablespoon"), ingredient("fresh basil", 0.5, "cup"), ingredient("garlic", 1, "clove", "small; minced"), ingredient("salt", 1.5, "teaspoon", "one teaspoon for pasta water"), ingredient("black pepper", 0.25, "teaspoon"), ingredient("cherry tomatoes", 1, "cup", "halved"), ingredient("water", 8, "cup", "for boiling pasta")],
    steps: [
      step("pasta", "Cook the pasta", "Bring water and one teaspoon salt to a boil. Cook pasta for the package's al dente time, usually eight to ten minutes; reserve half a cup cooking water before draining.", ["water", "salt", "pasta"], undefined, "Drain carefully to avoid steam burns."),
      step("prep", "Prepare the produce", "Wash the avocado skin before cutting, then remove the pit and scoop out the flesh. Wash basil and tomatoes and halve tomatoes.", ["ripe avocado", "fresh basil", "cherry tomatoes"]),
      step("sauce", "Blend the sauce", "Blend avocado, lemon juice, olive oil, basil, garlic, remaining salt and pepper with two tablespoons reserved pasta water until smooth. Add more reserved water a spoonful at a time if needed.", ["ripe avocado", "lemon juice", "olive oil", "fresh basil", "garlic", "salt", "black pepper"]),
      step("serve", "Toss and serve", "Toss drained pasta with avocado sauce off the heat. Fold in tomatoes and serve immediately; refrigerate leftovers promptly and use within one day for best quality.", ["pasta", "cherry tomatoes"], undefined, "Refrigerate within two hours; the sauce will darken during storage."),
    ],
  }),
  recipe({
    id: "mushroom-risotto", title: "Mushroom Risotto", description: "Creamy arborio rice with browned mushrooms and parmesan, made without wine.", cuisine: "Italian", tags: ["vegetarian", "rice", "comfort-food"], prepMinutes: 15, cookMinutes: 35, servings: 4,
    ingredients: [ingredient("arborio rice", 1.5, "cup"), ingredient("vegetable broth", 6, "cup"), ingredient("mushrooms", 12, "ounce", "sliced"), ingredient("onion", 1, "", "finely diced"), ingredient("garlic", 2, "clove", "minced"), ingredient("olive oil", 2, "tablespoon"), ingredient("butter", 2, "tablespoon", "divided"), ingredient("parmesan", 0.5, "cup", "grated; vegetarian rennet if needed"), ingredient("black pepper", 0.25, "teaspoon"), ingredient("lemon juice", 1, "tablespoon")],
    steps: [
      step("prep", "Prepare and warm the broth", "Slice mushrooms, dice onion and mince garlic. Heat broth in a saucepan and keep it at a gentle simmer.", ["mushrooms", "onion", "garlic", "vegetable broth"]),
      step("mushrooms", "Brown the mushrooms", "Heat oil in a wide pan over medium-high heat. Cook mushrooms for seven minutes until browned; transfer to a bowl.", ["olive oil", "mushrooms"], 420),
      step("rice", "Toast the rice", "Lower the heat to medium and melt one tablespoon butter in the pan. Cook onion for four minutes, garlic for thirty seconds, then stir in rice for two minutes.", ["butter", "onion", "garlic", "arborio rice"], 360),
      step("simmer", "Add broth gradually", "Add warm broth one ladle at a time, stirring frequently and adding more when nearly absorbed. Continue for twenty to twenty-five minutes until rice is tender with a slight bite; you may not need all the broth.", ["vegetable broth", "arborio rice"], 1200, undefined, "Keep a gentle simmer rather than a hard boil."),
      step("finish", "Finish the risotto", "Turn off the heat and stir in mushrooms, remaining butter, parmesan, pepper and lemon juice. Add a little warm broth if needed so the risotto flows gently, then serve immediately.", ["mushrooms", "butter", "parmesan", "black pepper", "lemon juice"], undefined, riceSafety),
    ],
  }),
  recipe({
    id: "beef-broccoli-stir-fry", title: "Beef and Broccoli Stir-Fry", description: "Thin slices of beef and crisp broccoli in a quick soy and ginger sauce.", cuisine: "Chinese-inspired", tags: ["beef", "stir-fry", "quick"], prepMinutes: 20, cookMinutes: 15, servings: 2,
    ingredients: [ingredient("sirloin steak", 0.75, "pound", "thinly sliced against the grain"), ingredient("broccoli florets", 3, "cup"), ingredient("neutral oil", 2, "tablespoon", "divided"), ingredient("garlic", 3, "clove", "minced"), ingredient("fresh ginger", 1, "tablespoon", "grated"), ingredient("soy sauce", 2, "tablespoon"), ingredient("oyster sauce", 1, "tablespoon"), ingredient("cornstarch", 1, "tablespoon"), ingredient("water", 0.5, "cup", "divided"), ingredient("brown sugar", 1, "teaspoon")],
    steps: [
      step("prep", "Prepare the sauce", "Mix soy sauce, oyster sauce, cornstarch, sugar and a quarter cup water. Prepare broccoli, garlic and ginger, then thinly slice beef on a separate board.", ["soy sauce", "oyster sauce", "cornstarch", "brown sugar", "water", "broccoli florets", "garlic", "fresh ginger", "sirloin steak"], undefined, "Wash hands and utensils after handling raw beef."),
      step("broccoli", "Steam the broccoli", "Heat one tablespoon oil in a large skillet over medium-high heat. Add broccoli and remaining quarter cup water, cover for three minutes, then uncover and transfer broccoli to a bowl.", ["neutral oil", "broccoli florets", "water"], 180),
      step("beef", "Sear the beef", "Add remaining oil and sear beef in a single layer, in batches if needed, for about four minutes, turning once. Check representative thick slices reach 145°F (63°C), then transfer to a clean plate and rest three minutes.", ["neutral oil", "sirloin steak"], 240, "Use a food thermometer; whole-cut beef needs 145°F (63°C) and a three-minute rest."),
      step("sauce", "Thicken the sauce", "Lower heat to medium, add garlic and ginger and stir for thirty seconds. Stir the sauce mixture again, pour into the pan and simmer for two minutes until glossy.", ["garlic", "fresh ginger"], 120),
      step("finish", "Bring together", "Return rested beef and broccoli to the pan and toss for one minute until coated and hot. Divide between two plates and serve immediately.", ["sirloin steak", "broccoli florets"], 60, leftovers),
    ],
  }),
  recipe({
  "id": "roasted-tomato-soup",
  "title": "Roasted Tomato Soup",
  "description": "Roasted tomatoes and onion blended into a smooth basil soup.",
  "cuisine": "Mediterranean",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 45,
  "servings": 4,
  "ingredients": [
    {
      "name": "tomatoes",
      "amount": 2,
      "unit": "pound",
      "note": "halved"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "quartered"
    },
    {
      "name": "garlic",
      "amount": 4,
      "unit": "clove",
      "note": "peeled"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "vegetable broth",
      "amount": 2,
      "unit": "cup"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "basil",
      "amount": 0.25,
      "unit": "cup"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Roast vegetables",
      "instruction": "Heat oven to 425 F (220 C). Wash tomatoes and arrange with onion and garlic on a rimmed tray. Toss with oil, salt and pepper and roast 35 minutes until soft and browned at the edges.",
      "ingredients": [
        "tomatoes",
        "onion",
        "garlic",
        "olive oil",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-2",
      "title": "Simmer",
      "instruction": "Transfer vegetables and tray juices to a saucepan. Add broth, bring to a boil, then simmer gently for ten minutes.",
      "ingredients": [
        "vegetable broth"
      ]
    },
    {
      "id": "step-3",
      "title": "Blend",
      "instruction": "Remove from heat, add basil and blend with an immersion blender until smooth.",
      "safety": "Keep the blender head submerged to avoid hot splashes; refrigerate leftovers within two hours.",
      "ingredients": [
        "basil"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide the hot soup into four bowls and serve.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "baked-sweet-potato-beans",
  "title": "Baked Sweet Potatoes with Beans",
  "description": "Tender baked sweet potatoes filled with cumin black beans and yogurt.",
  "cuisine": "American-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 10,
  "cookMinutes": 60,
  "servings": 4,
  "ingredients": [
    {
      "name": "sweet potatoes",
      "amount": 4,
      "unit": "",
      "note": "medium"
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "canned black beans",
      "amount": 15,
      "unit": "ounce",
      "note": "drained and rinsed"
    },
    {
      "name": "canned diced tomatoes",
      "amount": 14,
      "unit": "ounce"
    },
    {
      "name": "ground cumin",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "plain yogurt",
      "amount": 0.5,
      "unit": "cup"
    },
    {
      "name": "scallions",
      "amount": 2,
      "unit": "",
      "note": "sliced"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Bake potatoes",
      "instruction": "Heat oven to 425 F (220 C). Scrub potatoes, prick several times with a fork and rub with oil. Bake on a tray for 45 to 60 minutes until a knife slides easily into the center.",
      "ingredients": [
        "sweet potatoes",
        "olive oil"
      ]
    },
    {
      "id": "step-2",
      "title": "Heat filling",
      "instruction": "During the last fifteen minutes, combine beans, tomatoes, cumin and salt in a saucepan. Simmer gently for twelve minutes, stirring occasionally.",
      "ingredients": [
        "canned black beans",
        "canned diced tomatoes",
        "ground cumin",
        "salt"
      ]
    },
    {
      "id": "step-3",
      "title": "Fill potatoes",
      "instruction": "Split potatoes carefully and fluff the flesh with a fork. Spoon beans into each potato.",
      "safety": "Escaping steam can burn; refrigerate leftovers within two hours.",
      "ingredients": []
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Top each filled potato with yogurt and scallions and serve.",
      "ingredients": [
        "plain yogurt",
        "scallions"
      ]
    }
  ]
}),
  recipe({
  "id": "broccoli-cheddar-frittata",
  "title": "Broccoli Cheddar Frittata",
  "description": "An oven-finished broccoli and cheddar egg skillet for four.",
  "cuisine": "Italian-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 10,
  "cookMinutes": 25,
  "servings": 4,
  "ingredients": [
    {
      "name": "eggs",
      "amount": 8,
      "unit": ""
    },
    {
      "name": "milk",
      "amount": 0.25,
      "unit": "cup"
    },
    {
      "name": "broccoli florets",
      "amount": 2,
      "unit": "cup",
      "note": "small pieces"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "cheddar",
      "amount": 0.75,
      "unit": "cup",
      "note": "grated"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "water",
      "amount": 2,
      "unit": "tablespoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Cook vegetables",
      "instruction": "Heat oven to 375 F (190 C). Heat oil in a ten-inch oven-safe skillet over medium heat. Cook onion five minutes. Add broccoli and water, cover and steam four minutes, then uncover to evaporate excess water.",
      "ingredients": [
        "broccoli florets",
        "onion",
        "olive oil",
        "water"
      ]
    },
    {
      "id": "step-2",
      "title": "Add eggs",
      "instruction": "Whisk eggs, milk, salt and pepper. Stir cheese into the eggs, pour over vegetables and cook on medium-low for three minutes without stirring.",
      "ingredients": [
        "eggs",
        "milk",
        "cheddar",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Bake",
      "instruction": "Transfer to oven for twelve to fifteen minutes until the center is set and reaches 160 F (71 C).",
      "safety": "Wash hands after handling egg shells; use mitts on the hot skillet handle.",
      "ingredients": []
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Rest the frittata for five minutes before slicing and serving.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "lemon-couscous-chickpeas",
  "title": "Lemon Couscous with Chickpeas",
  "description": "Fluffy lemon couscous tossed with chickpeas, cucumber and herbs.",
  "cuisine": "North African-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 15,
  "cookMinutes": 10,
  "servings": 4,
  "ingredients": [
    {
      "name": "couscous",
      "amount": 1,
      "unit": "cup",
      "note": "instant, dry"
    },
    {
      "name": "vegetable broth",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "canned chickpeas",
      "amount": 15,
      "unit": "ounce",
      "note": "drained and rinsed"
    },
    {
      "name": "cucumber",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "cherry tomatoes",
      "amount": 1,
      "unit": "cup",
      "note": "halved"
    },
    {
      "name": "parsley",
      "amount": 0.5,
      "unit": "cup",
      "note": "chopped"
    },
    {
      "name": "lemon juice",
      "amount": 3,
      "unit": "tablespoon"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare produce",
      "instruction": "Wash cucumber, tomatoes and parsley before cutting. Drain and rinse chickpeas and place in a large bowl with the prepared vegetables.",
      "ingredients": [
        "canned chickpeas",
        "cucumber",
        "cherry tomatoes",
        "parsley"
      ]
    },
    {
      "id": "step-2",
      "title": "Steam couscous",
      "instruction": "Bring broth to a boil in a saucepan. Remove from heat, stir in couscous, cover and leave five minutes, or follow its package directions. Fluff with a fork and let stand uncovered five minutes.",
      "ingredients": [
        "couscous",
        "vegetable broth"
      ]
    },
    {
      "id": "step-3",
      "title": "Dress couscous",
      "instruction": "Whisk lemon juice, oil and salt. Fold couscous and parsley into the vegetables with the dressing.",
      "safety": "Refrigerate within two hours in shallow containers; use within three to four days.",
      "ingredients": [
        "parsley",
        "lemon juice",
        "olive oil",
        "salt"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide the dressed couscous salad among four bowls and serve.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "creamy-polenta-mushrooms",
  "title": "Creamy Polenta with Mushrooms",
  "description": "Soft polenta topped with browned garlic mushrooms and parsley.",
  "cuisine": "Italian",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 40,
  "servings": 4,
  "ingredients": [
    {
      "name": "coarse cornmeal",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "water",
      "amount": 4,
      "unit": "cup"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    },
    {
      "name": "mushrooms",
      "amount": 1,
      "unit": "pound",
      "note": "sliced"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 3,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "butter",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "parmesan",
      "amount": 0.5,
      "unit": "cup",
      "note": "grated"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "parsley",
      "amount": 2,
      "unit": "tablespoon",
      "note": "chopped"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Start polenta",
      "instruction": "Bring water and salt to a boil. Slowly whisk in cornmeal, lower heat and cook gently for 35 to 40 minutes, stirring frequently, until creamy and no longer gritty. Add a splash of water if too stiff.",
      "ingredients": [
        "coarse cornmeal",
        "water",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Brown mushrooms",
      "instruction": "While polenta cooks, heat oil in a skillet over medium-high heat. Brown mushrooms in two batches for eight minutes each. Return all mushrooms to the pan, add garlic and pepper and stir one minute.",
      "ingredients": [
        "mushrooms",
        "olive oil",
        "garlic",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Finish polenta",
      "instruction": "Stir butter and parmesan into polenta off heat until combined.",
      "safety": "Polenta can spit hot bubbles; use a long spoon and low heat. Chill leftovers within two hours.",
      "ingredients": [
        "butter",
        "parmesan"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Spoon polenta into bowls and top with mushrooms and parsley.",
      "ingredients": [
        "mushrooms",
        "parsley"
      ]
    }
  ]
}),
  recipe({
  "id": "sesame-tofu-noodles",
  "title": "Sesame Tofu Noodles",
  "description": "Pan-crisped tofu and soba noodles with a creamy sesame dressing.",
  "cuisine": "East Asian-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 15,
  "cookMinutes": 20,
  "servings": 3,
  "ingredients": [
    {
      "name": "firm tofu",
      "amount": 14,
      "unit": "ounce",
      "note": "drained and cubed"
    },
    {
      "name": "soba noodles",
      "amount": 8,
      "unit": "ounce"
    },
    {
      "name": "carrots",
      "amount": 2,
      "unit": "",
      "note": "shredded"
    },
    {
      "name": "neutral oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "soy sauce",
      "amount": 3,
      "unit": "tablespoon"
    },
    {
      "name": "tahini",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "rice vinegar",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "water",
      "amount": 3,
      "unit": "tablespoon",
      "note": "for sauce"
    },
    {
      "name": "scallions",
      "amount": 2,
      "unit": "",
      "note": "sliced"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Mix sauce",
      "instruction": "Whisk tahini with soy sauce, vinegar and three tablespoons water until smooth. Pat tofu dry with a clean towel.",
      "ingredients": [
        "firm tofu",
        "soy sauce",
        "tahini",
        "rice vinegar",
        "water"
      ]
    },
    {
      "id": "step-2",
      "title": "Brown tofu",
      "instruction": "Heat oil in a large nonstick skillet over medium-high heat. Cook tofu for twelve to fifteen minutes, turning every few minutes, until golden on several sides.",
      "ingredients": [
        "firm tofu",
        "neutral oil"
      ]
    },
    {
      "id": "step-3",
      "title": "Boil noodles",
      "instruction": "Bring a large pot of water to a boil. Cook soba according to its package, usually four to six minutes. Drain and rinse briefly under warm water.",
      "safety": "Drain away from your body to avoid steam burns.",
      "ingredients": [
        "soba noodles"
      ]
    },
    {
      "id": "step-4",
      "title": "Combine",
      "instruction": "Toss noodles, tofu, carrots and sauce in the warm skillet off heat. Add scallions and divide among three bowls.",
      "safety": "Contains sesame and soy; check noodle labels for wheat. Refrigerate leftovers within two hours.",
      "ingredients": [
        "firm tofu",
        "soba noodles",
        "carrots",
        "scallions"
      ]
    }
  ]
}),
  recipe({
  "id": "red-lentil-dal",
  "title": "Red Lentil Dal",
  "description": "Soft red lentils simmered with tomatoes, ginger and warming spices.",
  "cuisine": "Indian-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 10,
  "cookMinutes": 30,
  "servings": 4,
  "ingredients": [
    {
      "name": "red lentils",
      "amount": 1,
      "unit": "cup",
      "note": "rinsed"
    },
    {
      "name": "water",
      "amount": 3,
      "unit": "cup"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "neutral oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 3,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "fresh ginger",
      "amount": 1,
      "unit": "tablespoon",
      "note": "grated"
    },
    {
      "name": "ground turmeric",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "ground cumin",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "canned diced tomatoes",
      "amount": 14,
      "unit": "ounce"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    },
    {
      "name": "lemon juice",
      "amount": 2,
      "unit": "tablespoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Cook aromatics",
      "instruction": "Heat oil over medium heat in a saucepan. Cook onion for six minutes, then add garlic, ginger, turmeric and cumin and stir for one minute.",
      "ingredients": [
        "onion",
        "neutral oil",
        "garlic",
        "fresh ginger",
        "ground turmeric",
        "ground cumin"
      ]
    },
    {
      "id": "step-2",
      "title": "Simmer lentils",
      "instruction": "Add rinsed lentils, water and tomatoes. Bring to a boil, then simmer partially covered for twenty to twenty-five minutes, stirring often, until lentils break down. Add water a little at a time if sticking.",
      "ingredients": [
        "red lentils",
        "water",
        "canned diced tomatoes"
      ]
    },
    {
      "id": "step-3",
      "title": "Season dal",
      "instruction": "Stir in salt and lemon juice. Simmer gently for two minutes.",
      "safety": "Sort lentils for stones before rinsing. Refrigerate leftovers within two hours and reheat thoroughly.",
      "ingredients": [
        "salt",
        "lemon juice"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide the hot dal among four bowls and serve.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "spinach-ricotta-shells",
  "title": "Spinach Ricotta Stuffed Shells",
  "description": "Baked pasta shells filled with spinach and ricotta under tomato sauce.",
  "cuisine": "Italian-American",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 25,
  "cookMinutes": 40,
  "servings": 4,
  "ingredients": [
    {
      "name": "jumbo pasta shells",
      "amount": 20,
      "unit": ""
    },
    {
      "name": "ricotta",
      "amount": 15,
      "unit": "ounce"
    },
    {
      "name": "frozen chopped spinach",
      "amount": 10,
      "unit": "ounce",
      "note": "thawed and squeezed dry"
    },
    {
      "name": "egg",
      "amount": 1,
      "unit": ""
    },
    {
      "name": "mozzarella",
      "amount": 1,
      "unit": "cup",
      "note": "shredded"
    },
    {
      "name": "parmesan",
      "amount": 0.25,
      "unit": "cup",
      "note": "grated"
    },
    {
      "name": "marinara sauce",
      "amount": 3,
      "unit": "cup"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare shells",
      "instruction": "Heat oven to 375 F (190 C). Boil shells in a large pot of water for two minutes less than package directions. Drain gently and spread on a tray to cool enough to handle.",
      "ingredients": [
        "jumbo pasta shells"
      ]
    },
    {
      "id": "step-2",
      "title": "Mix filling",
      "instruction": "Mix ricotta, squeezed spinach, egg, parmesan, salt and pepper. Spread one cup marinara in a nine-by-thirteen-inch baking dish.",
      "ingredients": [
        "ricotta",
        "frozen chopped spinach",
        "egg",
        "parmesan",
        "marinara sauce",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Fill and bake",
      "instruction": "Fill each shell with about two tablespoons filling and place in the dish. Cover with remaining marinara and mozzarella. Cover with foil and bake 25 minutes, then uncover and bake ten minutes until the filling reaches 160 F (71 C).",
      "safety": "Wash hands after handling raw egg; check the center of the filling with a thermometer.",
      "ingredients": [
        "mozzarella",
        "marinara sauce"
      ]
    },
    {
      "id": "step-4",
      "title": "Rest and serve",
      "instruction": "Let stand five minutes before dividing among four plates.",
      "safety": "Refrigerate leftovers within two hours in shallow containers.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "white-bean-kale-skillet",
  "title": "White Bean and Kale Skillet",
  "description": "White beans simmered with tomatoes and tender kale, served with bread.",
  "cuisine": "Mediterranean-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 10,
  "cookMinutes": 20,
  "servings": 4,
  "ingredients": [
    {
      "name": "canned cannellini beans",
      "amount": 30,
      "unit": "ounce",
      "note": "drained and rinsed"
    },
    {
      "name": "kale",
      "amount": 6,
      "unit": "cup",
      "note": "stems removed, chopped"
    },
    {
      "name": "cherry tomatoes",
      "amount": 2,
      "unit": "cup",
      "note": "halved"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 4,
      "unit": "clove",
      "note": "sliced"
    },
    {
      "name": "vegetable broth",
      "amount": 0.75,
      "unit": "cup"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "lemon juice",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "bread",
      "amount": 4,
      "unit": "",
      "note": "slices"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare ingredients",
      "instruction": "Wash kale and tomatoes, remove tough stems and chop kale. Drain beans and slice garlic.",
      "ingredients": [
        "canned cannellini beans",
        "kale",
        "cherry tomatoes",
        "garlic"
      ]
    },
    {
      "id": "step-2",
      "title": "Soften tomatoes",
      "instruction": "Heat oil in a wide skillet over medium heat. Cook garlic for one minute, then add tomatoes, salt and pepper. Cook five minutes, stirring, until tomatoes soften.",
      "ingredients": [
        "cherry tomatoes",
        "olive oil",
        "garlic",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Simmer beans",
      "instruction": "Add beans, kale and broth. Cover and simmer ten minutes until kale is tender, then uncover for three minutes to reduce broth slightly.",
      "ingredients": [
        "canned cannellini beans",
        "kale",
        "vegetable broth"
      ]
    },
    {
      "id": "step-4",
      "title": "Finish",
      "instruction": "Stir in lemon juice and serve with bread.",
      "safety": "Refrigerate leftovers within two hours; use within three to four days.",
      "ingredients": [
        "lemon juice",
        "bread"
      ]
    }
  ]
}),
  recipe({
  "id": "cauliflower-chickpea-traybake",
  "title": "Cauliflower Chickpea Traybake",
  "description": "Roasted cauliflower and chickpeas with lemon tahini sauce.",
  "cuisine": "Middle Eastern-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 35,
  "servings": 4,
  "ingredients": [
    {
      "name": "cauliflower florets",
      "amount": 6,
      "unit": "cup"
    },
    {
      "name": "canned chickpeas",
      "amount": 15,
      "unit": "ounce",
      "note": "drained and dried"
    },
    {
      "name": "olive oil",
      "amount": 3,
      "unit": "tablespoon"
    },
    {
      "name": "ground cumin",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "paprika",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    },
    {
      "name": "tahini",
      "amount": 3,
      "unit": "tablespoon"
    },
    {
      "name": "lemon juice",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "water",
      "amount": 3,
      "unit": "tablespoon"
    },
    {
      "name": "parsley",
      "amount": 0.25,
      "unit": "cup",
      "note": "chopped"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Heat oven",
      "instruction": "Heat oven to 425 F (220 C). Wash cauliflower and cut into bite-size florets. Pat chickpeas dry so they roast instead of steam.",
      "ingredients": [
        "cauliflower florets",
        "canned chickpeas"
      ]
    },
    {
      "id": "step-2",
      "title": "Roast",
      "instruction": "Toss cauliflower and chickpeas with oil, cumin, paprika and salt on a large rimmed tray. Spread in one layer and roast 30 to 35 minutes, stirring halfway, until cauliflower is tender and browned.",
      "ingredients": [
        "cauliflower florets",
        "canned chickpeas",
        "olive oil",
        "ground cumin",
        "paprika",
        "salt"
      ]
    },
    {
      "id": "step-3",
      "title": "Make sauce",
      "instruction": "Whisk tahini, lemon juice and water until pourable, adding another spoonful of water if necessary.",
      "ingredients": [
        "tahini",
        "lemon juice",
        "water"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide the hot vegetables and chickpeas among four plates. Drizzle with sauce and scatter parsley over them.",
      "safety": "Tahini contains sesame. Use mitts for the hot tray and refrigerate leftovers within two hours.",
      "ingredients": [
        "parsley"
      ]
    }
  ]
}),
  recipe({
  "id": "butternut-squash-soup",
  "title": "Butternut Squash Soup",
  "description": "A smooth squash soup with ginger and a spoonful of yogurt.",
  "cuisine": "American",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 35,
  "servings": 4,
  "ingredients": [
    {
      "name": "butternut squash",
      "amount": 2,
      "unit": "pound",
      "note": "peeled, seeded and cubed"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 2,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "vegetable broth",
      "amount": 4,
      "unit": "cup"
    },
    {
      "name": "ground ginger",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "plain yogurt",
      "amount": 0.25,
      "unit": "cup"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare squash",
      "instruction": "Place squash on a stable board and carefully peel, halve, remove seeds and cut into one-inch cubes.",
      "safety": "Use a sharp knife on a non-slip board; keep fingers away from the blade.",
      "ingredients": [
        "butternut squash"
      ]
    },
    {
      "id": "step-2",
      "title": "Soften onion",
      "instruction": "Heat oil in a large saucepan over medium heat. Cook onion six minutes, then stir in garlic and ginger for one minute.",
      "ingredients": [
        "onion",
        "olive oil",
        "garlic",
        "ground ginger"
      ]
    },
    {
      "id": "step-3",
      "title": "Simmer",
      "instruction": "Add squash, broth, salt and pepper. Bring to a boil, lower heat and simmer covered for 25 minutes until squash is easily crushed with a spoon.",
      "ingredients": [
        "butternut squash",
        "vegetable broth",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-4",
      "title": "Blend and serve",
      "instruction": "Remove from heat and puree with an immersion blender until smooth. Divide into bowls and top with yogurt.",
      "safety": "Keep blender submerged to avoid hot splashes. Refrigerate leftovers within two hours.",
      "ingredients": [
        "plain yogurt"
      ]
    }
  ]
}),
  recipe({
  "id": "quinoa-roasted-vegetable-bowls",
  "title": "Quinoa Roasted Vegetable Bowls",
  "description": "Quinoa bowls with roasted summer vegetables, lemon dressing and feta.",
  "cuisine": "Mediterranean-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 30,
  "servings": 4,
  "ingredients": [
    {
      "name": "quinoa",
      "amount": 1,
      "unit": "cup",
      "note": "rinsed"
    },
    {
      "name": "water",
      "amount": 2,
      "unit": "cup"
    },
    {
      "name": "zucchini",
      "amount": 2,
      "unit": "",
      "note": "cut into half-inch pieces"
    },
    {
      "name": "red bell pepper",
      "amount": 1,
      "unit": "",
      "note": "cut into chunks"
    },
    {
      "name": "red onion",
      "amount": 1,
      "unit": "",
      "note": "cut into wedges"
    },
    {
      "name": "olive oil",
      "amount": 3,
      "unit": "tablespoon",
      "note": "divided"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon",
      "note": "divided"
    },
    {
      "name": "lemon juice",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "feta",
      "amount": 0.5,
      "unit": "cup",
      "note": "crumbled"
    },
    {
      "name": "pumpkin seeds",
      "amount": 0.25,
      "unit": "cup"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Roast vegetables",
      "instruction": "Heat oven to 425 F (220 C). Toss washed and cut zucchini, pepper and onion with two tablespoons oil and half a teaspoon salt. Spread on a tray and roast 25 to 30 minutes, turning halfway.",
      "ingredients": [
        "zucchini",
        "red bell pepper",
        "red onion",
        "olive oil",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Cook quinoa",
      "instruction": "While vegetables roast, bring quinoa and water to a boil in a saucepan. Cover, simmer on low fifteen minutes, then rest off heat for five minutes and fluff.",
      "ingredients": [
        "quinoa",
        "water"
      ]
    },
    {
      "id": "step-3",
      "title": "Dress bowls",
      "instruction": "Whisk remaining oil, remaining salt and lemon juice. Divide quinoa and vegetables among four bowls and add dressing.",
      "safety": "Cool cooked quinoa promptly in shallow containers and refrigerate within two hours.",
      "ingredients": [
        "olive oil",
        "salt",
        "lemon juice"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Top each bowl with feta and pumpkin seeds and serve.",
      "ingredients": [
        "feta",
        "pumpkin seeds"
      ]
    }
  ]
}),
  recipe({
  "id": "peanut-sweet-potato-stew",
  "title": "Peanut Sweet Potato Stew",
  "description": "A hearty tomato and peanut stew with sweet potatoes and spinach.",
  "cuisine": "West African-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 35,
  "servings": 4,
  "ingredients": [
    {
      "name": "sweet potatoes",
      "amount": 1.5,
      "unit": "pound",
      "note": "peeled and cubed"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "neutral oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 3,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "fresh ginger",
      "amount": 1,
      "unit": "tablespoon",
      "note": "grated"
    },
    {
      "name": "canned crushed tomatoes",
      "amount": 14,
      "unit": "ounce"
    },
    {
      "name": "vegetable broth",
      "amount": 3,
      "unit": "cup"
    },
    {
      "name": "smooth peanut butter",
      "amount": 0.5,
      "unit": "cup"
    },
    {
      "name": "spinach",
      "amount": 4,
      "unit": "cup"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Cook aromatics",
      "instruction": "Heat oil in a pot over medium heat. Cook onion six minutes, then add garlic and ginger and stir for one minute.",
      "ingredients": [
        "onion",
        "neutral oil",
        "garlic",
        "fresh ginger"
      ]
    },
    {
      "id": "step-2",
      "title": "Simmer potatoes",
      "instruction": "Add sweet potatoes, tomatoes, broth and salt. Bring to a boil and simmer partially covered for 20 to 25 minutes until potatoes are fork-tender.",
      "ingredients": [
        "sweet potatoes",
        "canned crushed tomatoes",
        "vegetable broth",
        "salt"
      ]
    },
    {
      "id": "step-3",
      "title": "Add peanut butter",
      "instruction": "Ladle half a cup hot broth into a bowl and whisk with peanut butter until smooth. Stir the mixture back into the pot and simmer gently for three minutes.",
      "ingredients": [
        "smooth peanut butter"
      ]
    },
    {
      "id": "step-4",
      "title": "Wilt spinach",
      "instruction": "Wash spinach and stir into stew until wilted, about two minutes. Divide among four bowls.",
      "safety": "Contains peanuts; check suitability for diners. Refrigerate leftovers within two hours.",
      "ingredients": [
        "spinach"
      ]
    }
  ]
}),
  recipe({
  "id": "potato-leek-soup",
  "title": "Potato Leek Soup",
  "description": "A gentle potato and leek soup finished with milk and chives.",
  "cuisine": "French-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 20,
  "cookMinutes": 30,
  "servings": 4,
  "ingredients": [
    {
      "name": "leeks",
      "amount": 3,
      "unit": "",
      "note": "white and light green parts"
    },
    {
      "name": "potatoes",
      "amount": 1.5,
      "unit": "pound",
      "note": "peeled and diced"
    },
    {
      "name": "butter",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "vegetable broth",
      "amount": 4,
      "unit": "cup"
    },
    {
      "name": "milk",
      "amount": 0.5,
      "unit": "cup"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "chives",
      "amount": 2,
      "unit": "tablespoon",
      "note": "chopped"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Clean leeks",
      "instruction": "Split leeks lengthwise, rinse between layers to remove grit, then slice thinly. Peel and dice potatoes into half-inch cubes.",
      "ingredients": [
        "leeks",
        "potatoes"
      ]
    },
    {
      "id": "step-2",
      "title": "Sweat leeks",
      "instruction": "Melt butter in a large pot over medium-low heat. Add leeks and cook eight minutes, stirring often, until soft without browning.",
      "ingredients": [
        "leeks",
        "butter"
      ]
    },
    {
      "id": "step-3",
      "title": "Simmer potatoes",
      "instruction": "Add potatoes, broth, salt and pepper. Bring to a boil, then simmer covered for twenty minutes until potatoes are very soft.",
      "ingredients": [
        "potatoes",
        "vegetable broth",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-4",
      "title": "Finish soup",
      "instruction": "Remove from heat and blend briefly with an immersion blender, leaving some texture. Stir in milk and warm on low without boiling. Serve with chives.",
      "safety": "Keep blender submerged and beware of hot splashes. Refrigerate within two hours.",
      "ingredients": [
        "milk",
        "chives"
      ]
    }
  ]
}),
  recipe({
  "id": "eggplant-tomato-pasta",
  "title": "Eggplant Tomato Pasta",
  "description": "Roasted eggplant folded into penne with tomato basil sauce.",
  "cuisine": "Italian-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 30,
  "servings": 4,
  "ingredients": [
    {
      "name": "penne",
      "amount": 12,
      "unit": "ounce"
    },
    {
      "name": "eggplant",
      "amount": 1,
      "unit": "pound",
      "note": "cut into half-inch cubes"
    },
    {
      "name": "olive oil",
      "amount": 3,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 3,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "canned crushed tomatoes",
      "amount": 28,
      "unit": "ounce"
    },
    {
      "name": "salt",
      "amount": 1.5,
      "unit": "teaspoon",
      "note": "divided"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "fresh basil",
      "amount": 0.25,
      "unit": "cup",
      "note": "torn"
    },
    {
      "name": "parmesan",
      "amount": 0.25,
      "unit": "cup",
      "note": "grated"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Roast eggplant",
      "instruction": "Heat oven to 425 F (220 C). Toss washed, cubed eggplant with two tablespoons oil and half a teaspoon salt. Roast in one layer for 25 minutes, turning halfway, until soft and browned.",
      "ingredients": [
        "eggplant",
        "olive oil",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Make sauce",
      "instruction": "Heat remaining oil in a deep skillet over medium-low heat. Stir garlic for one minute, add tomatoes, pepper and half a teaspoon salt, and simmer twenty minutes.",
      "ingredients": [
        "olive oil",
        "garlic",
        "canned crushed tomatoes",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Cook pasta",
      "instruction": "Meanwhile bring a large pot of water to a boil with remaining salt. Cook penne according to package directions until al dente. Reserve half a cup pasta water and drain.",
      "safety": "Drain carefully to avoid steam burns.",
      "ingredients": [
        "penne",
        "salt"
      ]
    },
    {
      "id": "step-4",
      "title": "Toss and serve",
      "instruction": "Fold roasted eggplant and drained pasta into sauce. Add a little reserved water if needed and warm one minute. Add basil and serve with parmesan.",
      "safety": "Refrigerate leftovers within two hours.",
      "ingredients": [
        "fresh basil",
        "parmesan"
      ]
    }
  ]
}),
  recipe({
  "id": "turkey-bean-chili",
  "title": "Turkey Bean Chili",
  "description": "A warming ground turkey chili with kidney beans and sweet pepper.",
  "cuisine": "American",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 40,
  "servings": 4,
  "ingredients": [
    {
      "name": "ground turkey",
      "amount": 1,
      "unit": "pound"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "red bell pepper",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 3,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "chili powder",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "ground cumin",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "canned diced tomatoes",
      "amount": 28,
      "unit": "ounce"
    },
    {
      "name": "canned kidney beans",
      "amount": 15,
      "unit": "ounce",
      "note": "drained and rinsed"
    },
    {
      "name": "chicken broth",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Soften vegetables",
      "instruction": "Heat oil in a large pot over medium heat. Cook onion and pepper for seven minutes, then stir in garlic, chili powder and cumin for one minute.",
      "ingredients": [
        "onion",
        "red bell pepper",
        "olive oil",
        "garlic",
        "chili powder",
        "ground cumin"
      ]
    },
    {
      "id": "step-2",
      "title": "Cook turkey",
      "instruction": "Add turkey and break into small pieces with a spoon. Cook for eight minutes, stirring, until the meat reaches 165 F (74 C).",
      "safety": "Keep raw turkey separate from vegetables and wash hands and utensils after handling it.",
      "ingredients": [
        "ground turkey"
      ]
    },
    {
      "id": "step-3",
      "title": "Simmer chili",
      "instruction": "Add tomatoes, beans, broth and salt. Bring to a simmer and cook uncovered for 25 minutes, stirring occasionally, until thick. Add a little water if it becomes too dry.",
      "ingredients": [
        "canned diced tomatoes",
        "canned kidney beans",
        "chicken broth",
        "salt"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Ladle into four bowls and serve hot.",
      "safety": "Refrigerate leftovers within two hours and reheat to 165 F (74 C).",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "baked-lemon-cod",
  "title": "Baked Lemon Cod",
  "description": "Tender oven-baked cod with lemon, garlic and juicy tomatoes.",
  "cuisine": "Mediterranean-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 10,
  "cookMinutes": 20,
  "servings": 4,
  "ingredients": [
    {
      "name": "cod fillets",
      "amount": 1.5,
      "unit": "pound",
      "note": "four similar-size pieces, thawed"
    },
    {
      "name": "cherry tomatoes",
      "amount": 2,
      "unit": "cup",
      "note": "halved"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "lemon juice",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "garlic",
      "amount": 3,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "dried oregano",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "parsley",
      "amount": 2,
      "unit": "tablespoon",
      "note": "chopped"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare dish",
      "instruction": "Heat oven to 400 F (200 C). Put washed, halved tomatoes in a baking dish. Pat cod dry and arrange among the tomatoes.",
      "ingredients": [
        "cod fillets",
        "cherry tomatoes"
      ]
    },
    {
      "id": "step-2",
      "title": "Season fish",
      "instruction": "Mix oil, lemon juice, garlic, oregano, salt and pepper. Spoon over fish and tomatoes.",
      "safety": "Thaw fish in the refrigerator and wash hands and utensils after touching raw fish.",
      "ingredients": [
        "olive oil",
        "lemon juice",
        "garlic",
        "dried oregano",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Bake",
      "instruction": "Bake for fifteen to twenty minutes, depending on thickness, until the thickest part of each fillet reaches 145 F (63 C). Continue baking if needed.",
      "ingredients": [
        "cod fillets"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Sprinkle parsley over the dish and divide fish and tomatoes among four plates.",
      "safety": "Check for small bones before serving. Refrigerate leftovers within two hours.",
      "ingredients": [
        "parsley"
      ]
    }
  ]
}),
  recipe({
  "id": "pork-tenderloin-apples",
  "title": "Pork Tenderloin with Apples",
  "description": "Mustard pork tenderloin roasted over apples and onions.",
  "cuisine": "American",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 35,
  "servings": 4,
  "ingredients": [
    {
      "name": "pork tenderloin",
      "amount": 1.25,
      "unit": "pound",
      "note": "silver skin removed"
    },
    {
      "name": "apples",
      "amount": 2,
      "unit": "",
      "note": "cored and sliced"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "sliced"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon",
      "note": "divided"
    },
    {
      "name": "Dijon mustard",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "dried thyme",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "chicken broth",
      "amount": 0.5,
      "unit": "cup"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Heat oven",
      "instruction": "Heat oven to 400 F (200 C). Toss apples and onion with one tablespoon oil in a roasting dish. Pat pork dry on a separate board.",
      "ingredients": [
        "pork tenderloin",
        "apples",
        "onion",
        "olive oil"
      ]
    },
    {
      "id": "step-2",
      "title": "Sear pork",
      "instruction": "Season pork with salt and pepper. Heat remaining oil in a skillet over medium-high heat and sear pork on all sides for six minutes total.",
      "safety": "Wash hands and utensils after handling raw pork; transfer using clean utensils.",
      "ingredients": [
        "pork tenderloin",
        "olive oil",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Roast",
      "instruction": "Place pork over apples and onion. Rub with mustard and thyme, pour broth around it and roast twenty to twenty-five minutes until the center reaches 145 F (63 C).",
      "ingredients": [
        "apples",
        "onion",
        "Dijon mustard",
        "dried thyme",
        "chicken broth"
      ]
    },
    {
      "id": "step-4",
      "title": "Rest and serve",
      "instruction": "Rest pork at least three minutes, then slice and serve with apples, onion and pan juices.",
      "safety": "Use a thermometer and the full three-minute rest. Refrigerate leftovers within two hours.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "chicken-noodle-soup",
  "title": "Chicken Noodle Soup",
  "description": "A comforting broth with poached chicken, vegetables and egg noodles.",
  "cuisine": "American",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 35,
  "servings": 4,
  "ingredients": [
    {
      "name": "boneless chicken breasts",
      "amount": 1,
      "unit": "pound"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "carrots",
      "amount": 2,
      "unit": "",
      "note": "sliced"
    },
    {
      "name": "celery",
      "amount": 2,
      "unit": "",
      "note": "stalks; sliced"
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "chicken broth",
      "amount": 6,
      "unit": "cup"
    },
    {
      "name": "egg noodles",
      "amount": 4,
      "unit": "ounce",
      "note": "dry"
    },
    {
      "name": "dried thyme",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "parsley",
      "amount": 2,
      "unit": "tablespoon",
      "note": "chopped"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Soften vegetables",
      "instruction": "Heat oil in a large pot over medium heat. Cook onion, carrots and celery for seven minutes, stirring occasionally.",
      "ingredients": [
        "onion",
        "carrots",
        "celery",
        "olive oil"
      ]
    },
    {
      "id": "step-2",
      "title": "Poach chicken",
      "instruction": "Add broth, thyme, salt, pepper and chicken. Bring to a gentle simmer and cook partially covered for fifteen to twenty minutes until chicken reaches 165 F (74 C).",
      "safety": "Do not wash raw chicken; wash hands and utensils after handling it.",
      "ingredients": [
        "boneless chicken breasts",
        "chicken broth",
        "dried thyme",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Cook noodles",
      "instruction": "Transfer chicken to a clean plate. Add noodles to simmering broth and cook according to package directions, usually six to eight minutes. Shred chicken with two forks while noodles cook.",
      "ingredients": [
        "boneless chicken breasts",
        "egg noodles"
      ]
    },
    {
      "id": "step-4",
      "title": "Finish",
      "instruction": "Return chicken and juices to the soup and heat through. Stir in parsley and divide among bowls.",
      "safety": "Chill leftovers within two hours in shallow containers and reheat to 165 F (74 C).",
      "ingredients": [
        "boneless chicken breasts",
        "parsley"
      ]
    }
  ]
}),
  recipe({
  "id": "salmon-potato-traybake",
  "title": "Salmon Potato Traybake",
  "description": "A single-tray meal of lemon dill salmon, potatoes and green beans.",
  "cuisine": "European-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 35,
  "servings": 4,
  "ingredients": [
    {
      "name": "salmon fillets",
      "amount": 1.5,
      "unit": "pound",
      "note": "four portions, thawed"
    },
    {
      "name": "baby potatoes",
      "amount": 1.5,
      "unit": "pound",
      "note": "halved"
    },
    {
      "name": "green beans",
      "amount": 12,
      "unit": "ounce",
      "note": "trimmed"
    },
    {
      "name": "olive oil",
      "amount": 3,
      "unit": "tablespoon",
      "note": "divided"
    },
    {
      "name": "lemon juice",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "dried dill",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon",
      "note": "divided"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Start potatoes",
      "instruction": "Heat oven to 425 F (220 C). Toss washed, halved potatoes with two tablespoons oil and half a teaspoon salt. Roast cut-side down on a large rimmed tray for twenty minutes.",
      "ingredients": [
        "baby potatoes",
        "olive oil",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Add salmon and beans",
      "instruction": "Turn potatoes and move to one side. Add trimmed beans and salmon in separate areas. Drizzle with remaining oil, lemon juice, remaining salt, pepper and dill.",
      "safety": "Keep raw fish and its utensils away from ready-to-eat food; wash hands after handling fish.",
      "ingredients": [
        "salmon fillets",
        "green beans",
        "olive oil",
        "lemon juice",
        "dried dill",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Finish roasting",
      "instruction": "Roast twelve to fifteen minutes until salmon reaches 145 F (63 C) in its thickest part and potatoes are tender. If necessary, remove cooked fish to a clean plate while vegetables finish.",
      "ingredients": [
        "salmon fillets"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide salmon, potatoes and beans among four plates.",
      "safety": "Check fish for bones and refrigerate leftovers within two hours.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "ginger-chicken-lettuce-cups",
  "title": "Ginger Chicken Lettuce Cups",
  "description": "Ginger chicken and mushrooms spooned into crisp lettuce leaves.",
  "cuisine": "East Asian-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 20,
  "cookMinutes": 15,
  "servings": 4,
  "ingredients": [
    {
      "name": "ground chicken",
      "amount": 1,
      "unit": "pound"
    },
    {
      "name": "neutral oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "mushrooms",
      "amount": 8,
      "unit": "ounce",
      "note": "finely chopped"
    },
    {
      "name": "carrot",
      "amount": 1,
      "unit": "",
      "note": "grated"
    },
    {
      "name": "garlic",
      "amount": 2,
      "unit": "clove",
      "note": "minced"
    },
    {
      "name": "fresh ginger",
      "amount": 1,
      "unit": "tablespoon",
      "note": "grated"
    },
    {
      "name": "soy sauce",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "hoisin sauce",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "rice vinegar",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "water",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "butter lettuce leaves",
      "amount": 12,
      "unit": "",
      "note": "washed and dried"
    },
    {
      "name": "scallions",
      "amount": 2,
      "unit": "",
      "note": "sliced"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare sauce",
      "instruction": "Mix soy sauce, hoisin, vinegar and water in a small bowl. Wash and dry lettuce and set on a clean serving plate away from raw meat.",
      "ingredients": [
        "soy sauce",
        "hoisin sauce",
        "rice vinegar",
        "water",
        "butter lettuce leaves"
      ]
    },
    {
      "id": "step-2",
      "title": "Cook mushrooms",
      "instruction": "Heat oil over medium-high heat in a large skillet. Cook mushrooms and carrot for five minutes, stirring, then add garlic and ginger for thirty seconds.",
      "ingredients": [
        "neutral oil",
        "mushrooms",
        "carrot",
        "garlic",
        "fresh ginger"
      ]
    },
    {
      "id": "step-3",
      "title": "Cook chicken",
      "instruction": "Add chicken, breaking it into small pieces. Cook seven to eight minutes until it reaches 165 F (74 C). Stir in sauce and simmer two minutes until coating the mixture.",
      "safety": "Wash hands and utensils after handling raw chicken and check its temperature.",
      "ingredients": [
        "ground chicken"
      ]
    },
    {
      "id": "step-4",
      "title": "Assemble cups",
      "instruction": "Spoon warm filling into the lettuce leaves and scatter scallions on top. Serve three cups per person.",
      "safety": "Refrigerate filling within two hours; store lettuce separately and reheat filling to 165 F (74 C).",
      "ingredients": [
        "butter lettuce leaves",
        "scallions"
      ]
    }
  ]
}),
  recipe({
  "id": "beef-meatballs-tomato-sauce",
  "title": "Beef Meatballs in Tomato Sauce",
  "description": "Tender baked beef meatballs finished in a simple tomato sauce.",
  "cuisine": "Italian-American",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 25,
  "cookMinutes": 35,
  "servings": 4,
  "ingredients": [
    {
      "name": "ground beef",
      "amount": 1,
      "unit": "pound"
    },
    {
      "name": "breadcrumbs",
      "amount": 0.5,
      "unit": "cup"
    },
    {
      "name": "milk",
      "amount": 0.25,
      "unit": "cup"
    },
    {
      "name": "egg",
      "amount": 1,
      "unit": ""
    },
    {
      "name": "parmesan",
      "amount": 0.25,
      "unit": "cup",
      "note": "grated"
    },
    {
      "name": "garlic",
      "amount": 3,
      "unit": "clove",
      "note": "minced; divided"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon",
      "note": "divided"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "canned crushed tomatoes",
      "amount": 28,
      "unit": "ounce"
    },
    {
      "name": "dried oregano",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "fresh basil",
      "amount": 0.25,
      "unit": "cup",
      "note": "torn"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Mix meatballs",
      "instruction": "Heat oven to 425 F (220 C). Soak breadcrumbs in milk for five minutes. Mix with beef, egg, parmesan, two minced garlic cloves, half a teaspoon salt and pepper. Shape into sixteen equal meatballs on a lined rimmed tray.",
      "safety": "Wash hands and surfaces after contact with raw beef or egg.",
      "ingredients": [
        "ground beef",
        "breadcrumbs",
        "milk",
        "egg",
        "parmesan",
        "garlic",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-2",
      "title": "Bake",
      "instruction": "Bake meatballs for fifteen to twenty minutes until centers reach 160 F (71 C), checking several with a thermometer.",
      "ingredients": [
        "ground beef"
      ]
    },
    {
      "id": "step-3",
      "title": "Simmer sauce",
      "instruction": "Meanwhile heat oil over medium-low heat in a wide saucepan. Stir remaining garlic for thirty seconds, then add tomatoes, oregano and remaining salt. Simmer twenty minutes, stirring occasionally.",
      "ingredients": [
        "garlic",
        "salt",
        "olive oil",
        "canned crushed tomatoes",
        "dried oregano"
      ]
    },
    {
      "id": "step-4",
      "title": "Finish",
      "instruction": "Transfer cooked meatballs into sauce and simmer five minutes. Add basil and divide among four plates.",
      "safety": "Refrigerate leftovers within two hours and reheat to 165 F (74 C).",
      "ingredients": [
        "fresh basil"
      ]
    }
  ]
}),
  recipe({
  "id": "shrimp-coconut-noodle-soup",
  "title": "Shrimp Coconut Noodle Soup",
  "description": "Rice noodles and shrimp in a mild coconut curry broth.",
  "cuisine": "Southeast Asian-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 15,
  "cookMinutes": 20,
  "servings": 4,
  "ingredients": [
    {
      "name": "raw shrimp",
      "amount": 1,
      "unit": "pound",
      "note": "peeled, deveined and thawed"
    },
    {
      "name": "rice noodles",
      "amount": 6,
      "unit": "ounce"
    },
    {
      "name": "coconut milk",
      "amount": 13.5,
      "unit": "ounce"
    },
    {
      "name": "vegetable broth",
      "amount": 3,
      "unit": "cup"
    },
    {
      "name": "red curry paste",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "neutral oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "red bell pepper",
      "amount": 1,
      "unit": "",
      "note": "thinly sliced"
    },
    {
      "name": "fresh ginger",
      "amount": 1,
      "unit": "tablespoon",
      "note": "grated"
    },
    {
      "name": "soy sauce",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "lime juice",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "cilantro",
      "amount": 0.25,
      "unit": "cup",
      "note": "chopped"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare noodles",
      "instruction": "Prepare rice noodles according to their package directions in a separate pot, then drain and divide among four bowls.",
      "safety": "Drain hot water carefully to avoid steam burns.",
      "ingredients": [
        "rice noodles"
      ]
    },
    {
      "id": "step-2",
      "title": "Build broth",
      "instruction": "Heat oil in a saucepan over medium heat. Cook pepper three minutes, then stir in ginger and curry paste for one minute. Add coconut milk, broth and soy sauce and simmer eight minutes.",
      "ingredients": [
        "coconut milk",
        "vegetable broth",
        "red curry paste",
        "neutral oil",
        "red bell pepper",
        "fresh ginger",
        "soy sauce"
      ]
    },
    {
      "id": "step-3",
      "title": "Cook shrimp",
      "instruction": "Add shrimp to gently simmering broth and cook three to five minutes, stirring occasionally, until firm, pearly and opaque throughout.",
      "safety": "Thaw shrimp in the refrigerator and prevent raw seafood juices from contacting ready-to-eat food.",
      "ingredients": [
        "raw shrimp"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve soup",
      "instruction": "Remove from heat, stir in lime juice and ladle broth and shrimp over noodles. Top with cilantro.",
      "safety": "Check curry paste for shellfish allergens. Refrigerate leftovers within two hours.",
      "ingredients": [
        "lime juice",
        "cilantro"
      ]
    }
  ]
}),
  recipe({
  "id": "chicken-fajita-skillet",
  "title": "Chicken Fajita Skillet",
  "description": "Sizzling spiced chicken strips and peppers wrapped in warm tortillas.",
  "cuisine": "Tex-Mex-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 20,
  "cookMinutes": 20,
  "servings": 4,
  "ingredients": [
    {
      "name": "boneless chicken breasts",
      "amount": 1.25,
      "unit": "pound",
      "note": "thinly sliced"
    },
    {
      "name": "bell peppers",
      "amount": 3,
      "unit": "",
      "note": "sliced"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "sliced"
    },
    {
      "name": "neutral oil",
      "amount": 2,
      "unit": "tablespoon",
      "note": "divided"
    },
    {
      "name": "chili powder",
      "amount": 2,
      "unit": "teaspoon"
    },
    {
      "name": "ground cumin",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon"
    },
    {
      "name": "lime juice",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "flour tortillas",
      "amount": 8,
      "unit": "",
      "note": "small"
    },
    {
      "name": "plain yogurt",
      "amount": 0.5,
      "unit": "cup"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare ingredients",
      "instruction": "Slice washed peppers and onion. On a separate board slice chicken into half-inch strips, then toss chicken with chili powder, cumin and salt.",
      "safety": "Wash hands, board and knife after handling raw chicken.",
      "ingredients": [
        "boneless chicken breasts",
        "bell peppers",
        "onion",
        "chili powder",
        "ground cumin",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Cook vegetables",
      "instruction": "Heat one tablespoon oil in a large skillet over medium-high heat. Cook onion and peppers for eight to ten minutes, stirring, until softened with browned edges. Transfer to a clean bowl.",
      "ingredients": [
        "bell peppers",
        "onion",
        "neutral oil"
      ]
    },
    {
      "id": "step-3",
      "title": "Cook chicken",
      "instruction": "Heat remaining oil in the skillet. Cook chicken in a single layer for seven to nine minutes, turning often, until the thickest strips reach 165 F (74 C). Return vegetables, add lime juice and heat one minute.",
      "ingredients": [
        "boneless chicken breasts",
        "neutral oil",
        "lime juice"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Warm tortillas in a dry skillet over medium heat, about twenty seconds per side. Fill with chicken and vegetables and spoon yogurt over each.",
      "safety": "Refrigerate leftovers within two hours and reheat chicken to 165 F (74 C).",
      "ingredients": [
        "flour tortillas",
        "plain yogurt"
      ]
    }
  ]
}),
  recipe({
  "id": "lentil-shepherds-pie",
  "title": "Lentil Shepherd's Pie",
  "description": "Lentils and vegetables under a golden mashed potato topping.",
  "cuisine": "British-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 25,
  "cookMinutes": 55,
  "servings": 4,
  "ingredients": [
    {
      "name": "potatoes",
      "amount": 1.5,
      "unit": "pound",
      "note": "peeled and cubed"
    },
    {
      "name": "milk",
      "amount": 0.25,
      "unit": "cup"
    },
    {
      "name": "butter",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "canned lentils",
      "amount": 30,
      "unit": "ounce",
      "note": "drained and rinsed"
    },
    {
      "name": "onion",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "carrots",
      "amount": 2,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "frozen peas",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "tomato paste",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "vegetable broth",
      "amount": 1.5,
      "unit": "cup"
    },
    {
      "name": "flour",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "dried thyme",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.75,
      "unit": "teaspoon",
      "note": "divided"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Make mash",
      "instruction": "Heat oven to 400 F (200 C). Cover potatoes with water in a saucepan. Bring to a boil and simmer fifteen to twenty minutes until tender. Drain carefully and mash with milk, butter and half a teaspoon salt.",
      "ingredients": [
        "potatoes",
        "milk",
        "butter",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Start filling",
      "instruction": "Meanwhile heat oil in a deep skillet over medium heat. Cook onion and carrots eight minutes. Stir in tomato paste and flour for one minute.",
      "ingredients": [
        "onion",
        "carrots",
        "olive oil",
        "tomato paste",
        "flour"
      ]
    },
    {
      "id": "step-3",
      "title": "Thicken filling",
      "instruction": "Gradually stir in broth. Add lentils, peas, thyme, pepper and remaining salt and simmer ten minutes until carrots are tender and sauce is thick.",
      "ingredients": [
        "canned lentils",
        "frozen peas",
        "vegetable broth",
        "dried thyme",
        "salt",
        "black pepper"
      ]
    },
    {
      "id": "step-4",
      "title": "Bake",
      "instruction": "Transfer filling to a two-quart baking dish. Spread mash over it and roughen with a fork. Bake twenty to twenty-five minutes until bubbling and golden; rest five minutes before serving.",
      "safety": "Use mitts for the hot dish. Refrigerate leftovers within two hours in shallow containers.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "banana-oat-pancakes",
  "title": "Banana Oat Pancakes",
  "description": "Small tender banana pancakes made with a blended oat batter.",
  "cuisine": "American",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 10,
  "cookMinutes": 20,
  "servings": 3,
  "ingredients": [
    {
      "name": "rolled oats",
      "amount": 1.5,
      "unit": "cup"
    },
    {
      "name": "ripe bananas",
      "amount": 2,
      "unit": "",
      "note": "peeled"
    },
    {
      "name": "eggs",
      "amount": 2,
      "unit": ""
    },
    {
      "name": "milk",
      "amount": 0.5,
      "unit": "cup"
    },
    {
      "name": "baking powder",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "ground cinnamon",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "neutral oil",
      "amount": 1,
      "unit": "tablespoon",
      "note": "for the skillet"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Blend batter",
      "instruction": "Blend oats into a fine flour. Add bananas, eggs, milk, baking powder, cinnamon and salt and blend smooth. Let stand five minutes to thicken.",
      "ingredients": [
        "rolled oats",
        "ripe bananas",
        "eggs",
        "milk",
        "baking powder",
        "ground cinnamon",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Heat pan",
      "instruction": "Warm a nonstick skillet over medium-low heat and brush with a little oil. If batter has become too thick to pour, stir in one tablespoon water.",
      "ingredients": [
        "neutral oil"
      ]
    },
    {
      "id": "step-3",
      "title": "Cook in batches",
      "instruction": "Use a quarter cup batter per pancake. Cook two to three minutes until edges set and bubbles appear, then flip and cook two minutes more until the center is set, reaching 160 F (71 C). Repeat, oiling between batches, to make about nine pancakes.",
      "safety": "Do not taste raw batter containing eggs. Wash hands after handling egg shells.",
      "ingredients": [
        "neutral oil"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide warm pancakes among three plates.",
      "safety": "Refrigerate leftovers within two hours and reheat thoroughly.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "apple-cinnamon-porridge",
  "title": "Apple Cinnamon Porridge",
  "description": "Creamy stovetop oats with soft apple, cinnamon and walnuts.",
  "cuisine": "British-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 5,
  "cookMinutes": 15,
  "servings": 2,
  "ingredients": [
    {
      "name": "rolled oats",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "milk",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "water",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "apple",
      "amount": 1,
      "unit": "",
      "note": "cored and diced"
    },
    {
      "name": "ground cinnamon",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.125,
      "unit": "teaspoon"
    },
    {
      "name": "maple syrup",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "walnuts",
      "amount": 2,
      "unit": "tablespoon",
      "note": "chopped"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare apple",
      "instruction": "Wash the apple, remove its core and dice into small quarter-inch pieces so it softens quickly.",
      "ingredients": [
        "apple"
      ]
    },
    {
      "id": "step-2",
      "title": "Simmer porridge",
      "instruction": "Put oats, milk, water, apple, cinnamon and salt in a saucepan. Bring to a gentle simmer over medium heat, then reduce to low and cook ten to twelve minutes, stirring frequently, until oats are creamy and apple is tender.",
      "ingredients": [
        "rolled oats",
        "milk",
        "water",
        "apple",
        "ground cinnamon",
        "salt"
      ]
    },
    {
      "id": "step-3",
      "title": "Finish porridge",
      "instruction": "Stir in maple syrup. If too thick, add a splash of water.",
      "safety": "Porridge holds heat; let cool slightly before eating. Contains milk and walnuts; refrigerate leftovers within two hours.",
      "ingredients": [
        "maple syrup"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide the porridge between two bowls and sprinkle walnuts on top.",
      "ingredients": [
        "walnuts"
      ]
    }
  ]
}),
  recipe({
  "id": "savory-spinach-oatmeal",
  "title": "Savory Spinach Oatmeal",
  "description": "Savory oats with wilted spinach, parmesan and fully cooked eggs.",
  "cuisine": "American-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 5,
  "cookMinutes": 15,
  "servings": 2,
  "ingredients": [
    {
      "name": "rolled oats",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "vegetable broth",
      "amount": 2,
      "unit": "cup"
    },
    {
      "name": "spinach",
      "amount": 2,
      "unit": "cup"
    },
    {
      "name": "eggs",
      "amount": 2,
      "unit": ""
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "parmesan",
      "amount": 0.25,
      "unit": "cup",
      "note": "grated"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    },
    {
      "name": "water",
      "amount": 1,
      "unit": "tablespoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Cook oats",
      "instruction": "Bring broth to a simmer in a saucepan. Stir in oats, lower heat and cook eight to ten minutes, stirring often, until creamy.",
      "ingredients": [
        "rolled oats",
        "vegetable broth"
      ]
    },
    {
      "id": "step-2",
      "title": "Add spinach",
      "instruction": "Wash spinach and stir into oats with pepper. Cook two minutes until wilted, then remove from heat and stir in parmesan.",
      "ingredients": [
        "spinach",
        "parmesan",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Cook eggs",
      "instruction": "Meanwhile heat oil in a nonstick skillet over medium heat. Crack in eggs, add water to the edge of the pan and cover. Cook four to six minutes until whites and yolks are firm.",
      "safety": "Wash hands after handling egg shells; cook both whites and yolks fully.",
      "ingredients": [
        "eggs",
        "olive oil",
        "water"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide oats between bowls and top each with an egg. Serve warm.",
      "safety": "Refrigerate leftovers within two hours and reheat thoroughly.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "mediterranean-tuna-bean-salad",
  "title": "Mediterranean Tuna Bean Salad",
  "description": "A no-cook tuna and white bean salad with lemon mustard dressing.",
  "cuisine": "Mediterranean-inspired",
  "tags": [
    "home-cooking",
    "quick"
  ],
  "prepMinutes": 15,
  "cookMinutes": 0,
  "servings": 3,
  "ingredients": [
    {
      "name": "canned tuna",
      "amount": 10,
      "unit": "ounce",
      "note": "drained"
    },
    {
      "name": "canned cannellini beans",
      "amount": 15,
      "unit": "ounce",
      "note": "drained and rinsed"
    },
    {
      "name": "cucumber",
      "amount": 1,
      "unit": "",
      "note": "diced"
    },
    {
      "name": "cherry tomatoes",
      "amount": 1,
      "unit": "cup",
      "note": "halved"
    },
    {
      "name": "red onion",
      "amount": 0.25,
      "unit": "cup",
      "note": "finely diced"
    },
    {
      "name": "parsley",
      "amount": 0.25,
      "unit": "cup",
      "note": "chopped"
    },
    {
      "name": "olive oil",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "lemon juice",
      "amount": 2,
      "unit": "tablespoon"
    },
    {
      "name": "Dijon mustard",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "black pepper",
      "amount": 0.25,
      "unit": "teaspoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Prepare ingredients",
      "instruction": "Wash cucumber, tomatoes and parsley before chopping. Drain tuna and flake into a large bowl. Rinse and drain beans and add them with cucumber, tomatoes, onion and parsley.",
      "ingredients": [
        "canned tuna",
        "canned cannellini beans",
        "cucumber",
        "cherry tomatoes",
        "red onion",
        "parsley"
      ]
    },
    {
      "id": "step-2",
      "title": "Make dressing",
      "instruction": "Whisk oil, lemon juice, mustard and pepper in a small bowl until combined.",
      "ingredients": [
        "olive oil",
        "lemon juice",
        "Dijon mustard",
        "black pepper"
      ]
    },
    {
      "id": "step-3",
      "title": "Toss salad",
      "instruction": "Pour dressing over the salad and fold gently to avoid breaking up all the beans.",
      "safety": "Use intact cans, avoid sharp lid edges and refrigerate salad within two hours. Use refrigerated leftovers within three to four days.",
      "ingredients": []
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Divide among three plates or cover and refrigerate until serving.",
      "ingredients": []
    }
  ]
}),
  recipe({
  "id": "roasted-carrot-hummus-wraps",
  "title": "Roasted Carrot Hummus Wraps",
  "description": "Warm cumin carrots wrapped with hummus, spinach and crisp cucumber.",
  "cuisine": "Middle Eastern-inspired",
  "tags": [
    "home-cooking",
    "weeknight"
  ],
  "prepMinutes": 15,
  "cookMinutes": 25,
  "servings": 4,
  "ingredients": [
    {
      "name": "carrots",
      "amount": 1,
      "unit": "pound",
      "note": "cut into thin sticks"
    },
    {
      "name": "olive oil",
      "amount": 1,
      "unit": "tablespoon"
    },
    {
      "name": "ground cumin",
      "amount": 1,
      "unit": "teaspoon"
    },
    {
      "name": "salt",
      "amount": 0.5,
      "unit": "teaspoon"
    },
    {
      "name": "whole-wheat tortillas",
      "amount": 4,
      "unit": "",
      "note": "large"
    },
    {
      "name": "prepared hummus",
      "amount": 1,
      "unit": "cup"
    },
    {
      "name": "cucumber",
      "amount": 1,
      "unit": "",
      "note": "cut into thin sticks"
    },
    {
      "name": "baby spinach",
      "amount": 2,
      "unit": "cup"
    },
    {
      "name": "lemon juice",
      "amount": 1,
      "unit": "tablespoon"
    }
  ],
  "steps": [
    {
      "id": "step-1",
      "title": "Roast carrots",
      "instruction": "Heat oven to 425 F (220 C). Wash and trim carrots, then cut into quarter-inch sticks. Toss with oil, cumin and salt on a rimmed tray. Roast twenty to twenty-five minutes, turning halfway, until tender.",
      "ingredients": [
        "carrots",
        "olive oil",
        "ground cumin",
        "salt"
      ]
    },
    {
      "id": "step-2",
      "title": "Prepare wraps",
      "instruction": "Wash cucumber and spinach. Cut cucumber into sticks. Warm tortillas in a dry skillet over medium heat for twenty seconds per side to make them flexible.",
      "ingredients": [
        "whole-wheat tortillas",
        "cucumber",
        "baby spinach"
      ]
    },
    {
      "id": "step-3",
      "title": "Fill wraps",
      "instruction": "Spread a quarter cup hummus on each tortilla. Divide spinach, cucumber and warm carrots among them and sprinkle with lemon juice.",
      "safety": "Prepared hummus commonly contains sesame. Refrigerate assembled wraps within two hours; keep carrots separate for best leftover texture.",
      "ingredients": [
        "carrots",
        "prepared hummus",
        "cucumber",
        "baby spinach",
        "lemon juice"
      ]
    },
    {
      "id": "step-4",
      "title": "Serve",
      "instruction": "Fold in the sides of each tortilla and roll tightly. Cut the wraps in half and serve.",
      "ingredients": []
    }
  ]
}),
];
