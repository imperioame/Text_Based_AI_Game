const {
  HfInference
} = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/*******************
 * 
 * Model selection 
 * 
*******************/
let currentModelIndex = 1;

/*******************
 * 
 * Model types
 * 
*******************/

const MODELTYPES = [
  'textgen',
  'qa',
  'conversational'
];

/*******************
 * 
 * Model definitions
 * 
*******************/

const MODELS = [{
    name: 'DialoGPT-medium',
    repo: 'microsoft/DialoGPT-medium',
    comments: '',
    type: MODELTYPES[2]
  },
  {
    name: 'BlenderBot',
    repo: 'facebook/blenderbot-400M-distill',
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


// Add a simple test function
const testAPI = async () => {
  try {
    // Test with a simple text generation model
    const response = await hf.textGeneration({
      model: "gpt2",
      inputs: "Hello, I am",
      parameters: {
        max_length: 50,
        num_return_sequences: 1,
      },
    });
    console.log('Test API Response:', response);
    return response;
  } catch (error) {
    console.error('Test API Error:', error);
    throw error;
  }
};

// Add a function to check the model status
async function checkModelStatus(modelName) {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}`, {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
    });
    const data = await response.json();
    return data.error ? false : true;
  } catch (error) {
    console.error(`Error checking status for ${modelName}:`, error);
    return false;
  }
}


function getModelConfig(prompt1, prompt2 = '', prompt3 = '') {
  const currentModel = MODELS[currentModelIndex];
  switch (currentModel.type) {
    case MODELTYPES[0]:
      return {
        model: currentModel.repo,
          inputs: prompt1,
          parameters: {
            max_new_tokens: 150,
            max_time: 20,
            repetition_penalty: 50,
            temperature: 0.9,
            top_p: 0.95,
            do_sample: true,
            no_repeat_ngram_size: 2,
          },
      };
    case MODELTYPES[1]:
      return {
        model: currentModel.repo,
          inputs: {
            question: prompt2,
            context: prompt1
          },
          /*
                    parameters: {
                      max_new_tokens: 100,
                      max_time: 20,
                      repetition_penalty: 50,
                      temperature: 0.7,
                      top_p: 0.9,
                    },*/
      };
    case MODELTYPES[2]:
      return {
        model: currentModel.repo,
        inputs: {
            past_user_inputs: prompt1 ? [prompt1] : [],
            generated_responses: prompt3 ? [prompt3] : [],
            text: prompt2 ? [prompt2] : [],
          },/*
          
                    parameters: {
                      max_length: 1000,
                      temperature: 0.7,
                      top_p: 0.9,
                    },*/
      };
  }
}

const conversationHistory = {
  pastUserInputs: [],
  generatedResponses: []
};

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

function logInteraction(type, message) {
  const logEntry = `[${new Date().toISOString()}] ${type}: ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
  console.log(logEntry);
}

exports.generateStory = async () => {
  const currentModel = MODELS[currentModelIndex];
  const isModelReady = await checkModelStatus(currentModel.repo);
  if (!isModelReady) {
    throw new Error(`Model ${currentModel.name} is not ready or unavailable.`);
  }

  const randomTheme = storyThemes[Math.floor(Math.random() * storyThemes.length)];
  let prompt1, prompt2, prompt3;

  switch (currentModel.type) {
    case MODELTYPES[0]:
      prompt1 = `In a ${randomTheme} story where I'm the main character, happens `;
      //prompt1 = `Tell me a ${randomTheme} story where I'm the main character`;;
      break;
    case MODELTYPES[1]:
      prompt1 = `We are in a ${randomTheme} story setting where I'm the main character`;
      prompt2 = `What's the current situation and What do I see?`;
      break;
    case MODELTYPES[2]:
      //prompt1 = conversationHistory.pastUserInputs ?? '';
      prompt1 = "no";
      prompt2 = "no";
      //prompt2 = `Let's start a ${randomTheme} story where I'm the main character. What's the current situation and what do I see?`;
      prompt3 =  "no";
      //prompt3 = conversationHistory.generatedResponses ?? '';
      break;
  }

  logInteraction('User', `Model: ${MODELS[currentModelIndex].name}, Prompt: ${prompt1} ${prompt2} ${prompt3}`);

  try {
    let response;
    switch (currentModel.type) {
      case MODELTYPES[0]:
        response = await hf.textGeneration(getModelConfig(prompt1));
        break;
      case MODELTYPES[1]:
        response = await hf.questionAnswering(getModelConfig(prompt1, prompt2));
        break;
      case MODELTYPES[2]:
        response = await hf.conversational(getModelConfig(prompt1, prompt2, prompt3));
        break;
    }

    logInteraction('Debug', `API Response: ${JSON.stringify(response)}`);
    if (!response || !response.generated_text) {
      throw new Error('Invalid response from API');
    }

    let story;
    if (currentModel.type === MODELTYPES[2]) {
      story = response.generated_text;
      conversationHistory.pastUserInputs.push(prompt2);
      conversationHistory.generatedResponses.push(story);
    } else {
      story = response.answer || response.generated_text;
    }

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
  } catch (error) {
    console.error('Error in generateStory:', error);
    logInteraction('Error', `Generate Story Error: ${error.message}`);
    throw error;
  }
};

exports.processAction = async (gameState, action) => {
  const currentModel = MODELS[currentModelIndex];
  const isModelReady = await checkModelStatus(currentModel.repo);
  if (!isModelReady) {
    throw new Error(`Model ${currentModel.name} is not ready or unavailable.`);
  }

  const actionWithoutNumber = action.replace(/^\d+\.\s*/, '').trim();
  let prompt1, prompt2, prompt3;

  switch (MODELS[currentModelIndex].type) {
    case MODELTYPES[0]:
      prompt1 = `In this ${gameState.theme} story, I ${actionWithoutNumber}. Then `;
      break;
    case MODELTYPES[1]:
      prompt1 = `Following the ${gameState.theme} story, I ${actionWithoutNumber}`;
      prompt2 = `What happens next? What follows?`;
      break;
    case MODELTYPES[2]:
      prompt1 = conversationHistory.pastUserInputs;
      prompt2 = `In this ${gameState.theme} story, I ${actionWithoutNumber}. What happens next?`;
      prompt3 = conversationHistory.generatedResponses;
      break;
  }

  logInteraction('User', `Model: ${MODELS[currentModelIndex].name}, Prompt: ${prompt1} ${prompt2} ${prompt3}`);

  try {
    let response;
    switch (currentModel.type) {
      case MODELTYPES[0]:
        response = await hf.textGeneration(getModelConfig(prompt1));
        break;
      case MODELTYPES[1]:
        response = await hf.questionAnswering(getModelConfig(prompt1, prompt2));
        break;
      case MODELTYPES[2]:
        response = await hf.conversational(getModelConfig(prompt1, prompt2, prompt3));
        break;
    }

    logInteraction('Debug', `API Response: ${JSON.stringify(response)}`);

    if (!response || !response.generated_text) {
      throw new Error('Invalid response from API');
    }

    let story;
    if (currentModel.type === MODELTYPES[2]) {
      story = response.generated_text;
      conversationHistory.pastUserInputs.push(prompt2);
      conversationHistory.generatedResponses.push(story);
    } else {
      story = response.answer || response.generated_text;
    }

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
  } catch (error) {
    console.error('Error in processAction:', error);
    logInteraction('Error', `Process Action Error: ${error.message}`);
    throw error;
  }
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
};


// Function to switch the current model
exports.switchModel = (modelName) => {
  const newModelIndex = MODELS.findIndex(model => model.name === modelName);
  if (newModelIndex !== -1) {
    currentModelIndex = newModelIndex;
    // Reset conversation history when switching models
    conversationHistory.pastUserInputs = [];
    conversationHistory.generatedResponses = [];
    return true;
  }
  return false;
};