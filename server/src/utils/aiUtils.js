const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const conversationHistory = [];
const logFilePath = path.join(__dirname, 'interaction_log.txt');

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
  "random topic"
];

const isDevelopment = process.env.SERVER === 'development';

function logInteraction(type, message) {
  const logEntry = `[${new Date().toISOString()}] ${type}: ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
  console.log(logEntry);
}

function checkPromptLength(prompt) {
  if (prompt.length > 250) {
    const warning = `Warning: Prompt exceeds 250 characters. Length: ${prompt.length}`;
    logInteraction('Warning', warning);
    if (isDevelopment) {
      return warning;
    }
  }
  return null;
}

exports.generateStory = async () => {
  const randomTheme = storyThemes[Math.floor(Math.random() * storyThemes.length)];
  const prompt = `You're a master storyteller. Tell me a story of a ${randomTheme} where I'm the main character.`;
  // What do I see? What's the current situation?. Tell me what can I do.

  logInteraction('User', prompt);

  const warning = checkPromptLength(prompt);
  if (warning) return warning;

  const response = await hf.textGeneration({
    model: 'facebook/blenderbot-400M-distill',
    inputs: prompt,
    parameters: {
      max_new_tokens: 250,
      temperature: 0.8,
      top_p: 0.9,
    },
  });

  const story = response.generated_text.trim();
  conversationHistory.push(story);

  logInteraction('AI', story);

  const { processedStory, options } = extractStoryAndOptions(story);
  const gameState = { scene: 'opening', theme: randomTheme, lastScene: processedStory };

  return { story: processedStory, options, gameState };
};

exports.getConversationHistory = () => {
  return conversationHistory;
};

exports.processAction = async (gameState, action) => {
  const actionWithoutNumber = action.replace(/^\d+\.\s*/, '').trim();
  const prompt = `I ${actionWithoutNumber}. What happens next? Remember that this is a ${gameState.theme} story`;

  logInteraction('System', gameState.lastScene);
  logInteraction('User', prompt);

  const warning = checkPromptLength(prompt);
  if (warning) return warning;

  const response = await hf.textGeneration({
    model: 'facebook/blenderbot-400M-distill',
    inputs: prompt,
    parameters: {
      max_new_tokens: 250,
      temperature: 0.8,
      top_p: 0.9,
    },
  });

  const story = response.generated_text.trim();
  conversationHistory.push(story);

  logInteraction('AI', story);

  const { processedStory, options } = extractStoryAndOptions(story);
  const newGameState = { ...gameState, scene: 'continuation', lastScene: processedStory };

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

  // Separate the last scene narrative from the options for optimization
  const narrative = processedStory.split("\n\nYour options are:")[0].trim();

  logInteraction('System', processedStory);  
  logInteraction('System', options);  
  logInteraction('System', narrative);  
  return { processedStory, options, narrative };
}
