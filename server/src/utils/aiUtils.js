// server/src/utils/aiUtils.js
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

exports.generateStory = async () => {
  const prompt = `Generate a text-based adventure game opening scenario. Include a brief setting description and character introduction. Provide three options for the player to choose from.`;

  const response = await hf.textGeneration({
    model: 'gpt2',
    inputs: prompt,
    parameters: {
      max_new_tokens: 200,
      temperature: 0.8,
    },
  });

  const story = response.generated_text.trim();
  const options = story.split('\n').slice(-3);
  const gameState = { scene: 'opening' };

  return { story, options, gameState };
};

exports.processAction = async (gameState, action) => {
  const prompt = `Continue the text-based adventure game. Previous scene: ${gameState.scene}. Player's action: ${action}. Provide the next part of the story and three new options for the player.`;

  const response = await hf.textGeneration({
    model: 'gpt2',
    inputs: prompt,
    parameters: {
      max_new_tokens: 200,
      temperature: 0.8,
    },
  });

  const story = response.generated_text.trim();
  const options = story.split('\n').slice(-3);
  const newGameState = { ...gameState, scene: 'continuation' };

  return { story, options, gameState: newGameState };
};