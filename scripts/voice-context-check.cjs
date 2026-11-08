// No providers, sockets, credentials, workers, or browser APIs are used.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, 'foundation-check.cjs'), 'utf8');
const loader = source.slice(0, source.indexOf('const {listRecipes,getRecipe'));
vm.runInNewContext(loader + `
const {listRecipes, describeIngredient} = load('lib/recipe.ts');
const {newSession, nextStep, previousStep, jumpToStep, currentStep, setServings, noteSubstitution} = load('lib/session.ts');
const {buildStartCall, buildContext} = load('lib/agent-config.ts');
const recipes = listRecipes();
assert.equal(recipes.length, 50);
let steps = 0, maxContext = 0;
for (const recipe of recipes) {
 let state = newSession(recipe.id, 'mock-session', 'mock-secret');
 const call = buildStartCall('mock-agent', recipe, state, 'https://example.test');
 assert.equal(call.agent.id, 'mock-agent');
 assert.deepEqual(JSON.parse(call.knowledgeBase), recipe, recipe.id);
 assert.ok(call.knowledgeBase.length <= 100000);
 assert.ok(!/Substitutes for heavy cream|juices running clear|no pink inside|recipe contains no|recipe has no gluten/.test(call.knowledgeBase));
 assert.ok(call.context.includes('Recipe ID: ' + recipe.id));
 assert.equal(call.customTools.length, 7);
 assert.equal(buildStartCall('mock-agent', recipe, state, null).customTools, undefined);
 for (const servings of [1, recipe.servings, 12]) {
  const scaled = setServings(state, servings).state;
  const context = buildContext(recipe, scaled);
  maxContext = Math.max(maxContext, context.length);
  assert.ok(context.length <= 4000);
  for (const ingredient of recipe.ingredients) assert.ok(context.includes(describeIngredient(ingredient, recipe.servings, servings, 'spoken')));
 }
 for (let index = 0; index < recipe.steps.length; index++) {
  const step = recipe.steps[index];
  const transition = nextStep(state); state = transition.state;
  assert.equal(state.recipeId, recipe.id);
  assert.equal(state.stepIndex, index);
  assert.equal(transition.result.instruction, step.instruction);
  assert.equal(transition.result.title, step.title);
  assert.equal(transition.result.safety, step.safety ?? null);
  assert.equal(transition.result.tip, step.tip ?? null);
  assert.equal(transition.result.suggestedTimerSeconds, step.durationSeconds ?? null);
  for (const name of step.ingredients ?? []) assert.ok(recipe.ingredients.some(i => i.name === name), recipe.id + ': ' + name);
  assert.deepEqual(transition.result.ingredientsForThisStep, (step.ingredients ?? []).map(name => describeIngredient(recipe.ingredients.find(i => i.name === name), recipe.servings, state.servings, 'spoken')));
  assert.equal(currentStep(state).state.stepIndex, index);
  assert.equal(jumpToStep(state, index + 1).result.instruction, step.instruction);
  assert.equal(previousStep(state).result.instruction, recipe.steps[Math.max(0, index - 1)].instruction);
  const context = buildContext(recipe, state);
  assert.ok(context.includes(step.title) && context.includes(step.instruction));
  steps++;
 }
 state = nextStep(state).state;
 assert.equal(state.status, 'finished');
 assert.ok(buildContext(recipe, state).includes('finished every step'));
 const substituted = noteSubstitution(state, recipe.ingredients[0].name, 'agreed substitute').state;
 assert.ok(buildContext(recipe, substituted).includes('agreed substitute instead of ' + recipe.ingredients[0].name));
 assert.throws(() => buildStartCall('mock-agent', recipe, {...state, recipeId: 'wrong-id'}, null), /Recipe\\/session mismatch/);
}
const chicken = recipes[0];
assert.ok(buildContext(chicken, newSession(chicken.id, 's', 'x')).includes('one minute and 30 seconds'));
console.log('PASS: 50 selected recipe payloads; ' + steps + ' steps, ingredient references, navigation, tips/safety, timers, servings 1/base/12, substitutions, finished state, ID mismatch rejection. Max context: ' + maxContext + '/4000. No provider calls.');
`, {require, __dirname, console}, {filename: __filename});
