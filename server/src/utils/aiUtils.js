const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const conversationHistory = [];

exports.generateStory = async () => {
  const prompt = `Human: Generate a text-based adventure game opening scenario. Include a brief setting description and character introduction. Provide three options for the player to choose from.

AI:`;

  const response = await hf.textGeneration({
    model: 'facebook/blenderbot-400M-distill',
    inputs: prompt,
    parameters: {
      max_new_tokens: 200,
      temperature: 0.8,
    },
  });

  const story = response.generated_text.trim();
  conversationHistory.push(story);
  const options = extractOptions(story);
  const gameState = { scene: 'opening' };

  return { story, options, gameState };
};

exports.getConversationHistory = () => {
  return conversationHistory;
};

exports.processAction = async (gameState, action) => {
  const prompt = `Human: Continue the text-based adventure game. Previous scene: ${gameState.scene}. Player's action: ${action}. Provide the next part of the story and three new options for the player.

AI:`;

  const response = await hf.textGeneration({
    model: 'facebook/blenderbot-400M-distill',
    inputs: prompt,
    parameters: {
      max_new_tokens: 200,
      temperature: 0.8,
    },
  });

  const story = response.generated_text.trim();
  conversationHistory.push(story);
  const options = extractOptions(story);
  const newGameState = { ...gameState, scene: 'continuation' };

  return { story, options, gameState: newGameState };
};

function extractOptions(text) {
  const lines = text.split('\n');
  const options = [];
  for (const line of lines) {
    if (line.match(/^\d+\.\s/)) {
      options.push(line.trim());
    }
  }
  return options.length > 0 ? options : ['No clear options provided'];
}