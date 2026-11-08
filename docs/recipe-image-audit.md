# Recipe image coverage audit

Audited 2026-11-08. Before: 5 photos / 45 placeholders. After: 18 photos / 32 placeholders.

The machine-readable record `public/recipes/image-audit.json` is updated as well. All 50 mapped paths exist. Local files were decoded with Pillow. The five existing photographs were visually reviewed and preserved; source records remain in SOURCES.md. New Commons candidates were reviewed as contact sheets and only matched dishes were accepted. No generated images or paid API calls were used in this pass.

Commons initially returned HTTP 429; one slower sequential pass was attempted after waiting. When throttling returned, requests stopped. Unmatched, empty-search and throttled dishes retain the honest local fallback. In particular, guacamole was rejected for avocado pasta, raw dal/fritters for cooked dal, and meat quesadillas for black-bean quesadillas.

Legacy caveats retained from the earlier audit: the creamy chicken source URL is labeled pizza, so its attribution and exact dish match still need review; the curry photo shows bone-in chicken although the recipe specifies boneless thighs; the stew photo does not prove the specified tomato/potato preparation. These files were preserved, not newly verified. Their existing review-needed flags remain in the machine-readable audit. The earlier `scripts/image-candidates/` files were not used, and their unverified attribution status is unchanged.

Photographs are illustrative: they do not certify exact ingredients or presentation of the editorial SOUS recipes. Existing source records and original files are preserved. No unrelated recipes share a photograph.

| ID | Title | Image | Before | After / visual review | Source |
| --- | --- | --- | --- | --- | --- |
| creamy-garlic-chicken | Creamy Garlic Chicken | `/recipes/creamy-garlic-chicken.jpg` | photo | Existing dish photograph preserved | Existing SOURCES.md |
| tomato-beef-stew | Tomato Beef Stew | `/recipes/tomato-beef-stew.jpg` | photo | Existing dish photograph preserved | Existing SOURCES.md |
| chicken-curry | Chicken Curry | `/recipes/chicken-curry.jpg` | photo | Existing dish photograph preserved | Existing SOURCES.md |
| bibimbap | Bibimbap | `/recipes/bibimbap.jpg` | photo | Existing dish photograph preserved | Existing SOURCES.md |
| garlic-butter-shrimp | Garlic Butter Shrimp | `/recipes/garlic-butter-shrimp.jpg` | photo | Existing dish photograph preserved | Existing SOURCES.md |
| spaghetti-pomodoro | Spaghetti Pomodoro | `/recipes/spaghetti-pomodoro.jpg` | placeholder | Photo: visually matched | [CC0](https://commons.wikimedia.org/wiki/File:Spaghetti_pomodoro,_Venice.jpg) |
| chickpea-spinach-curry | Chickpea Spinach Curry | `/recipes/chickpea-spinach-curry.jpg` | placeholder | Photo: visually matched | [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Spinach-Chickpea_Curry_(3117324894).jpg) |
| miso-soup | Miso Soup | `/recipes/miso-soup.jpg` | placeholder | Photo: visually matched | [CC0](https://commons.wikimedia.org/wiki/File:Miso_Soup_001.jpg) |
| teriyaki-salmon | Teriyaki Salmon | `/recipes/teriyaki-salmon.jpg` | placeholder | Photo: visually matched | [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Oven-baked_teriyaki_salmon_with_vegetables.jpg) |
| vegetable-fried-rice | Vegetable Fried Rice | `/recipes/vegetable-fried-rice.jpg` | placeholder | Photo: visually matched | [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Kerala_vegetable_fried_rice_2.jpg) |
| homemade-tacos | Homemade Tacos | `/recipes/homemade-tacos.jpg` | placeholder | Photo: visually matched | [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Homemade_Tacos_with_Avocado.jpg) |
| black-bean-quesadillas | Black Bean Quesadillas | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| greek-chickpea-salad | Greek Chickpea Salad | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| lentil-vegetable-soup | Lentil Vegetable Soup | `/recipes/lentil-vegetable-soup.jpg` | placeholder | Photo: visually matched | [CC0](https://commons.wikimedia.org/wiki/File:Amy%27s_lentil_vegetable_soup.jpg) |
| shakshuka | Shakshuka | `/recipes/shakshuka.jpg` | placeholder | Photo: visually matched | [CC BY-SA 3.0](https://commons.wikimedia.org/wiki/File:Shakshuka_by_Calliopejen1.jpg) |
| thai-basil-chicken | Thai Basil Chicken | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| lemon-herb-chicken | Lemon Herb Chicken | `/recipes/lemon-herb-chicken.jpg` | placeholder | Photo: visually matched | [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Grilled_chicken_with_lemon_and_herbs_served_on_a_dark_platter.jpg) |
| avocado-pasta | Avocado Pasta | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| mushroom-risotto | Mushroom Risotto | `/recipes/mushroom-risotto.jpg` | placeholder | Photo: visually matched | [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Mushroom_and_Leek_Risotto_(49535206656).jpg) |
| beef-broccoli-stir-fry | Beef and Broccoli Stir-Fry | `/recipes/beef-broccoli-stir-fry.jpg` | placeholder | Photo: visually matched | [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Beef_and_broccoli_stir_fry.jpg) |
| roasted-tomato-soup | Roasted Tomato Soup | `/recipes/roasted-tomato-soup.jpg` | placeholder | Photo: visually matched | [CC BY 2.0](https://commons.wikimedia.org/wiki/File:Grilled_cheese_sandwich_with_roasted_tomato_soup.jpg) |
| baked-sweet-potato-beans | Baked Sweet Potatoes with Beans | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| broccoli-cheddar-frittata | Broccoli Cheddar Frittata | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| lemon-couscous-chickpeas | Lemon Couscous with Chickpeas | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| creamy-polenta-mushrooms | Creamy Polenta with Mushrooms | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| sesame-tofu-noodles | Sesame Tofu Noodles | `/recipes/sesame-tofu-noodles.jpg` | placeholder | Photo: visually matched | [CC BY-SA 4.0](https://commons.wikimedia.org/wiki/File:Unique-texture-tofu-noodle-salad-tossed-in-a-sesame-dressing-18.jpg) |
| red-lentil-dal | Red Lentil Dal | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| spinach-ricotta-shells | Spinach Ricotta Stuffed Shells | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| white-bean-kale-skillet | White Bean and Kale Skillet | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| cauliflower-chickpea-traybake | Cauliflower Chickpea Traybake | `/recipes/placeholder.svg` | placeholder | Placeholder: no suitably matched licensed candidate | — |
| butternut-squash-soup | Butternut Squash Soup | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| quinoa-roasted-vegetable-bowls | Quinoa Roasted Vegetable Bowls | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| peanut-sweet-potato-stew | Peanut Sweet Potato Stew | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| potato-leek-soup | Potato Leek Soup | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| eggplant-tomato-pasta | Eggplant Tomato Pasta | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| turkey-bean-chili | Turkey Bean Chili | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| baked-lemon-cod | Baked Lemon Cod | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| pork-tenderloin-apples | Pork Tenderloin with Apples | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| chicken-noodle-soup | Chicken Noodle Soup | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| salmon-potato-traybake | Salmon Potato Traybake | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| ginger-chicken-lettuce-cups | Ginger Chicken Lettuce Cups | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| beef-meatballs-tomato-sauce | Beef Meatballs in Tomato Sauce | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| shrimp-coconut-noodle-soup | Shrimp Coconut Noodle Soup | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| chicken-fajita-skillet | Chicken Fajita Skillet | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| lentil-shepherds-pie | Lentil Shepherd's Pie | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| banana-oat-pancakes | Banana Oat Pancakes | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| apple-cinnamon-porridge | Apple Cinnamon Porridge | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| savory-spinach-oatmeal | Savory Spinach Oatmeal | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| mediterranean-tuna-bean-salad | Mediterranean Tuna Bean Salad | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
| roasted-carrot-hummus-wraps | Roasted Carrot Hummus Wraps | `/recipes/placeholder.svg` | placeholder | Placeholder: source throttled | — |
