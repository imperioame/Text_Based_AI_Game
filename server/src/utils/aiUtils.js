const { pipeline } = require('@xenova/transformers');

// Load the model and tokenizer
const setupModel = async () => {
  const generator = await pipeline('text-generation', 'facebook/blenderbot-400M-distill');
  return generator;
};

// Initialize the model
let modelPromise = setupModel();

const storyThemes = [
  "space exploration",
  "medieval fantasy",
  "cyberpunk dystopia",
  "underwater civilization",
  "post-apocalyptic wasteland",
  "steampunk adventure",
  "ancient Egyptian mystery",
  "wild west frontier",
  "arctic expedition",
  "jungle survival",
  "random"
];

const conversationHistory = [];

exports.generateStory = async () => {
  const randomTheme = storyThemes[Math.floor(Math.random() * storyThemes.length)];
  const prompt = `Human: Generate a text-based adventure game opening scenario for a ${randomTheme} theme. Follow this structure:

1. Setting: Describe the initial setting in 2-3 sentences.
2. Character: Introduce the main character in 1-2 sentences.
3. Situation: Explain the current situation or challenge in 2-3 sentences.
4. Options: Provide exactly three numbered options for the player, each on a new line.

AI:`;

  // Use the model to generate text
  const generator = await modelPromise;
  const response = await generator(prompt, { max_length: 400, temperature: 0.8, top_p: 0.9 });
  const story = response[0].generated_text.trim();

  conversationHistory.push(story);
  const { processedStory, options } = extractStoryAndOptions(story);
  const gameState = { scene: 'opening', theme: randomTheme };

  return { story: processedStory, options, gameState };
};

exports.getConversationHistory = () => {
  return conversationHistory;
};

exports.processAction = async (gameState, action) => {
  const prompt = `Human: Continue the ${gameState.theme} themed text-based adventure game. Previous scene: ${gameState.scene}. Player's action: ${action}. Follow this structure:

1. Outcome: Describe the result of the player's action in 2-3 sentences.
2. New Situation: Explain the new situation or challenge in 2-3 sentences.
3. Options: Provide exactly three numbered options for the player, each on a new line.

AI:`;

  // Use the model to generate text
  const generator = await modelPromise;
  const response = await generator(prompt, { max_length: 400, temperature: 0.8, top_p: 0.9 });
  const story = response[0].generated_text.trim();

  conversationHistory.push(story);
  const { processedStory, options } = extractStoryAndOptions(story);
  const newGameState = { ...gameState, scene: 'continuation' };

  return { story: processedStory, options, gameState: newGameState };
};

function extractStoryAndOptions(text) {
  const parts = text.split(/\n(?=\d+\.)/);
  let processedStory = parts[0].trim();
  let options = [];

  if (parts.length > 1) {
    options = parts.slice(1).map(part => part.trim());
  }

  // If we don't have exactly 3 options, generate some based on the story
  if (options.length !== 3) {
    const genericOptions = [
      "Investigate further",
      "Talk to someone nearby",
      "Check your surroundings",
      "Use an item from your inventory",
      "Rest and plan your next move",
      "Try to find a way out",
      "Search for clues",
      "Attempt to use a skill or ability",
      "Call for help",
      "Set up camp or find shelter"
    ];

    while (options.length < 3) {
      const newOption = genericOptions[Math.floor(Math.random() * genericOptions.length)];
      if (!options.includes(newOption)) {
        options.push(`${options.length + 1}. ${newOption}`);
      }
    }

    // Append the generated options to the story
    processedStory += "\n\nYour options are:";
    options.forEach(option => {
      processedStory += `\n${option}`;
    });
  }

  return { processedStory, options };
}
