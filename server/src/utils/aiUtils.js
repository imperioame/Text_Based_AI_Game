const {
  HfInference
} = require('@huggingface/inference');
const fs = require('fs');
const {
  type
} = require('os');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const MODELTYPES = [
  'textgen',
  'qa',
  'conversational'
];

// I can do a repo of different models that work for this game, for the user to select them
const MODELS = [{
    name: 'DialoGPT-medium',
    repo: 'microsoft/DialoGPT-medium',
    comments: '',
    type: MODELTYPES[2]
  },
  {
    name: 'RoBERTa',
    repo: 'deepset/roberta-base-squad2',
    comments: '',
    type: MODELTYPES[1]
  },
  {
    name: 'GPT-Neo-2.7B',
    repo: 'EleutherAI/gpt-neo-2.7B',
    comments: 'Its ok, difficult to limit the answer',
    type: MODELTYPES[0]
  },
  {
    name: 'OPT-2.7B',
    repo: 'facebook/opt-2.7b',
    comments: 'a slow loading model',
    type: MODELTYPES[0]
  },
  {
    name: 'OPT-1.3b',
    repo: 'facebook/opt-1.3b',
    comments: 'a slow loading model',
    type: MODELTYPES[0]
  }
];

function getModelConfig(prompt1, prompt2 = '', prompt3 = '') {
  switch (MODELS[0].type) {
    case MODELTYPES[0]:
      return {
        model: MODELS[0].repo,
          inputs: prompt,
          parameters: {
            max_new_tokens: 100,
            max_time: 20,
            repetition_penalty: 50,
            // to adjust randomness
            temperature: .3,
            top_p: 0.9,
          },
      };
    case MODELTYPES[1]:
      return {
        model: MODELS[0].repo,
          inputs: {
            question: prompt2,
            context: prompt1
          },
          parameters: {
            max_new_tokens: 100,
            max_time: 20,
            repetition_penalty: 50,
            // to adjust randomness
            temperature: .3,
            top_p: 0.9,
          },
      };
    case MODELTYPES[2]:
      return {
        model: MODELS[0].repo,
          inputs: {
            past_user_inputs: prompt1,
            generated_responses: prompt3,
            text: prompt2
          },
          parameters: {
            max_new_tokens: 100,
            max_time: 20,
            repetition_penalty: 50,
            // to adjust randomness
            temperature: .3,
            top_p: 0.9,
          },
      }
  }
};


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
  let prompt1;
  let prompt2 = '';
  let prompt3 = '';
  switch (MODELS[0].type) {
    case MODELTYPES[0]:
      //prompt1 is the base text for the ai to continue
      prompt1 = `In 20 words, tell me a ${randomTheme} story where I'm the main character. Only answer back with the story`;
      break;
    case MODELTYPES[1]:
      //prompt1 is the context for the ai
      //prompt2 is the question
      prompt1 = `We are in a ${randomTheme} story setting where I'm the main character`;
      prompt2 = `What's the current situation and What do I see?`;
      break;
    case MODELTYPES[2]:
      //prompt1 is the previous information provided to the ai
      //prompt2 is the question, or the user input
      //prompt3 is the generated responses of the ai
      prompt1 = `We are in a ${randomTheme} story setting where I'm the main character`;
      prompt2 = `What's the current situation and What do I see?`;
      break;
  }
  //to give me options, . 

  logInteraction('User', prompt1 + prompt2);

  const warning = checkPromptLength(prompt1) || checkPromptLength(prompt2) || checkPromptLength(prompt3);
  if (warning) return warning;

  let response;
  switch (MODELS[0].type) {
    case MODELTYPES[0]:
      response = await hf.textGeneration(getModelConfig(prompt1));
      break;
    case MODELTYPES[1]:
      response = await hf.questionAnswer(getModelConfig(prompt1, prompt2));
      break;
    case MODELTYPES[2]:
      response = await hf.conversational(getModelConfig(prompt1, prompt2, prompt3));
  };

  const fullText = response.generated_text.trim();
  const story = fullText.replace(prompt, '').trim();
  conversationHistory.push(story);

  logInteraction('AI', story);

  const {
    processedStory,
    options
  } = extractStoryAndOptions(story);
  const gameState = {
    scene: 'opening',
    theme: randomTheme,
    lastScene: processedStory
  };

  return {
    story: processedStory,
    options,
    gameState
  };
};

exports.getConversationHistory = () => {
  return conversationHistory;
};

exports.processAction = async (gameState, action) => {
  const actionWithoutNumber = action.replace(/^\d+\.\s*/, '').trim();

  let prompt1;
  let prompt2 = '';
  let prompt3 = '';
  switch (MODELS[0].type) {
    case MODELTYPES[0]:
      //prompt1 is the base text for the ai to continue
      prompt1 = `What happens next? Following the ${gameState.theme} story, I ${actionWithoutNumber}. What follows?`;
      break;
    case MODELTYPES[1]:
      //prompt1 is the context for the ai
      //prompt2 is the question
      prompt1 = `Following the ${gameState.theme} story, I ${actionWithoutNumber}`;
      prompt2 = `What happens next? What follows?`;
      break;
    case MODELTYPES[2]:
      //prompt1 is the previous information provided to the ai
      //prompt2 is the question, or the user input
      //prompt3 is the generated responses of the ai
      prompt1 = `In a ${gameState.theme} story, I ${actionWithoutNumber}`;
      prompt2 = `What happens next? What follows?`;
      prompt3 =  gameState.lastScene;
      break;
  }

  logInteraction('System', gameState.lastScene);
  logInteraction('User', prompt1 + prompt2);

  const warning = checkPromptLength(prompt1) || checkPromptLength(prompt2) || checkPromptLength(prompt3);
  if (warning) return warning;

  let response;
  switch (MODELS[0].type) {
    case MODELTYPES[0]:
      response = await hf.textGeneration(getModelConfig(prompt1));
      break;
    case MODELTYPES[1]:
      response = await hf.questionAnswer(getModelConfig(prompt1, prompt2));
      break;
    case MODELTYPES[2]:
      response = await hf.conversational(getModelConfig(prompt1, prompt2, prompt3));
  };

  const fullText = response.generated_text.trim();
  const story = fullText.replace(prompt, '').trim();
  conversationHistory.push(story);

  logInteraction('AI', story);

  const {
    processedStory,
    options
  } = extractStoryAndOptions(story);
  const newGameState = {
    ...gameState,
    scene: 'continuation',
    lastScene: processedStory
  };

  return {
    story: processedStory,
    options,
    gameState: newGameState
  };
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
    /*processedStory += "\n\nYour options are:";
    options.forEach(option => {
      processedStory += `\n${option}`;
    });
    */
  }

  // Separate the last scene narrative from the options for optimization
  const narrative = processedStory.split("\n\nYour options are:")[0].trim();

  logInteraction('System', processedStory);
  logInteraction('System', options);
  logInteraction('System', narrative);
  return {
    processedStory,
    options,
    narrative
  };
}