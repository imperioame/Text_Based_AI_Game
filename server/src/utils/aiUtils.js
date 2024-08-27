const { generateWithLanguageCheck } = require('./languageUtils');

const {
  HfInference
} = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/*******************
 * 
 * "Memory" provided to the model 
 * 
 *******************/

const MAX_HISTORY_LENGTH = 10;


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
  'conversational',
  'text2text',
];

/*******************
 * 
 * Model definitions
 * 
 *******************/

const MODELS = [{
    name: 'flan-t5-base',
    repo: 'google/flan-t5-base',
    comments: 'Works quite well, fairly slow to process',
    type: MODELTYPES[3]
  },
  {
    name: 'Qwen2-Boundless',
    repo: 'ystemsrx/Qwen2-Boundless',
    comments: 'Works well, quite creative, tends to mix with non-latin languages (non supported)',
    type: MODELTYPES[3]
  },
  {
    name: 'gpt2-large-conversational-retrain',
    repo: 'Locutusque/gpt2-large-conversational-retrain',
    comments: 'Slow load',
    type: MODELTYPES[2]
  },
  {
    name: 'gpt2-large',
    repo: 'openai-community/gpt2-large',
    comments: '',
    type: MODELTYPES[0]
  },
  {
    name: 'DialoGPT-medium',
    repo: 'microsoft/DialoGPT-medium',
    comments: 'Slow load - Doesnt answer',
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
    comments: 'A slow loading model',
    type: MODELTYPES[0]
  },
  {
    name: 'OPT-1.3b',
    repo: 'facebook/opt-1.3b',
    comments: 'A slow loading model',
    type: MODELTYPES[0]
  }
];


// Add this new function to get the list of available models
exports.getAvailableModels = () => {
  return MODELS.map(model => ({ name: model.name, type: model.type, comments: model.comments }));
};



const conversationHistory = {
  fullRecord: [],
  pastUserInputs: [],
  generatedResponses: []
};

exports.getConversationHistory = () => {
  return {
    fullRecord: conversationHistory.fullRecord,
    userInputs: conversationHistory.pastUserInputs,
    aiResponses: conversationHistory.generatedResponses
  };
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


function getModelConfig(prompt1, prompt2 = '') {
  const currentModel = MODELS[currentModelIndex];
  let inputs = '';
  let parameters = {
    max_new_tokens: 200,
    //max_time: 25,
    repetition_penalty: 1.5,
    //repetition_penalty: 50,
    temperature: 0.7,
    top_k: 50,
    top_p: 0.9,
    do_sample: true,
    //do_sample: false,
    no_repeat_ngram_size: 3,
    early_stopping: true,
    //num_beams: 4,
  };

  switch (currentModel.type) {
    case MODELTYPES[0]:
      inputs = prompt1;
      break;
    case MODELTYPES[1]:
      inputs = `Context: ${prompt1}\nQuestion: ${prompt2}`;
      break;
    case MODELTYPES[2]:
    case MODELTYPES[3]:
      /*
      const pastInputs = Array.isArray(prompt1) ? prompt1.join('\n') : prompt1;
      const pastResponses = Array.isArray(prompt3) ? prompt3.join('\n') : prompt3;
      inputs = `${pastInputs}\n${pastResponses}\n ${prompt2}`;
      break;
      */

      const fullRecord = Array.isArray(prompt1) ? prompt1.join('\n') : prompt1;
      inputs = `${fullRecord}\n ${prompt2}`;
      break;

  }

  return {
    model: currentModel.repo,
    inputs: inputs,
    parameters: parameters,
  };
}

function logInteraction(type, message) {
  const logEntry = `[${new Date().toISOString()}] ${type}: ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry);
  console.log(logEntry);
}

async function generateTitle(story) {
  const prompt = `Generate a brief title (5-6 words max) for the following story:\n\n${story}\n\nTitle:`;
  
  const config = getModelConfig(prompt);
  const response = await hf.textGeneration(config);
  
  return response.generated_text.trim().slice(0, 100); // Limit to 100 characters
}

exports.generateStory = async (modelName) => {
  let modelIndex = MODELS.findIndex(model => model.name === modelName);
  if (modelIndex != -1) {
    currentModelIndex = modelIndex;
  }

  const currentModel = MODELS[currentModelIndex];
  const isModelReady = await checkModelStatus(currentModel.repo);
  if (!isModelReady) {
    throw new Error(`Model ${currentModel.name} is not ready or unavailable.`);
  }

  const randomTheme = storyThemes[Math.floor(Math.random() * storyThemes.length)];
  let prompt1, prompt2;

  switch (currentModel.type) {
    case MODELTYPES[0]:
      prompt1 = `In a ${randomTheme} story where I'm the main character, the following happens: `;
      break;
    case MODELTYPES[1]:
      prompt1 = `We are in a ${randomTheme} story setting where I'm the main character.`;
      prompt2 = `What's the current situation and what do I see?`;
      break;
    case MODELTYPES[2]:
    case MODELTYPES[3]:

      prompt1 = conversationHistory.fullRecord.join('\n');
      prompt2 = `Tell me a brief ${randomTheme} story where I'm the main character. What's the current situation and what do I see?`;
      //prompt2 = `Let's start a ${randomTheme} story where I'm the main character. What's the current situation and what do I see?`;
      break;
  }

  logInteraction('User', `Model: ${MODELS[currentModelIndex].name}, Prompt: ${prompt1} ${prompt2}`);

  try {
    const result = await generateWithLanguageCheck(async () => {

    const config = getModelConfig(prompt1, prompt2);
    const response = await hf.textGeneration(config);


    //log-Interaction('Debug', `API Response: ${JSON.stringify(response)}`);
    if (!response || !response.generated_text) {
      throw new Error('Invalid response from API');
    };

    let story = response.generated_text;
    conversationHistory.generatedResponses.push(story);
    if (currentModel.type === MODELTYPES[2]) {
      conversationHistory.pastUserInputs.push(prompt2);
    } else {
      conversationHistory.pastUserInputs.push(`${prompt1} ${prompt2}`);
    };
    conversationHistory.fullRecord.push(conversationHistory.pastUserInputs[conversationHistory.pastUserInputs.length - 1], story);

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

    const title = await generateTitle(story);

    return {
      title,
      fullStory: story,
      newChunk: story,
      options,
      gameState,
      conversationHistory: [{
        type: 'ai',
        content: story
      }],
      aiModel: MODELS[currentModelIndex].name
      //conversationHistory: exports.getConversationHistory()
    }});

    return result;

  } catch (error) {
    console.error('Error in generateStory:', error);
    logInteraction('Error', `Generate Story Error: ${error.message}`);
    if (error.response) {
      logInteraction('Error', `API Error Response: ${JSON.stringify(error.response)}`);
    };
    throw error;
  }
};

exports.processAction = async (gameState, action, history) => {
  const startTime = Date.now();

  const currentModel = MODELS[currentModelIndex];
  const isModelReady = await checkModelStatus(currentModel.repo);
  if (!isModelReady) {
    throw new Error(`Model ${currentModel.name} is not ready or unavailable.`);
  }

  // Limit history to last MAX_HISTORY_LENGTH entries
  const limitedHistory = history.slice(-MAX_HISTORY_LENGTH);

  // Combine limited history into a single string, avoiding repetition
  const fullStory = limitedHistory.map(entry => {
    if (entry.type === 'user') {
      return `User: ${entry.content}`;
    } else {
      return entry.content;
    }
  }).join('\n\n');

  const actionWithoutNumber = action.replace(/^\d+\.\s*/, '').trim();
  let prompt1, prompt2;

  switch (currentModel.type) {
    case MODELTYPES[0]:
      prompt1 = `In this ${gameState.theme} story, I ${actionWithoutNumber}. Then `;
      break;
    case MODELTYPES[1]:
      prompt1 = `Following the ${gameState.theme} story, I ${actionWithoutNumber}`;
      prompt2 = `What happens next? What follows?`;
      break;
    case MODELTYPES[2]:
    case MODELTYPES[3]:
      /*prompt1 = conversationHistory.pastUserInputs.join('\n');
      prompt2 = `I ${actionWithoutNumber}. What happens next?`;
      prompt3 = conversationHistory.generatedResponses.join('\n');*/
      prompt1 = fullStory;
      prompt2 = `I ${actionWithoutNumber}. What happens next?`;
      break;
  }

  logInteraction('User', `Model: ${MODELS[currentModelIndex].name}, Prompt: ${prompt1} ${prompt2}`);

  try {
    const result = await generateWithLanguageCheck(async () => {

    const config = getModelConfig(prompt1, prompt2);
    const response = await hf.textGeneration(config);

    //logInteraction('Debug', `API Response: ${JSON.stringify(response)}`);

    if (!response || !response.generated_text) {
      throw new Error('Invalid response from API');
    }

    const newChunk = response.generated_text;
    const updatedFullStory = `${fullStory}\n\nUser: ${action}\n\nAI: ${newChunk}`;

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    conversationHistory.generatedResponses.push(newChunk);
    if (currentModel.type === MODELTYPES[2]) {
      conversationHistory.pastUserInputs.push(prompt2);
    } else {
      conversationHistory.pastUserInputs.push(`${prompt1} ${prompt2}`);
    };
    conversationHistory.fullRecord.push(conversationHistory.pastUserInputs[conversationHistory.pastUserInputs.length - 1], newChunk);

    logInteraction('AI', newChunk);

    const {
      processedStory,
      options
    } = extractStoryAndOptions(newChunk);
    const newGameState = {
      ...gameState,
      scene: 'continuation',
      lastScene: processedStory
    };

    return {
      fullStory: updatedFullStory,
      newChunk: processedStory,
      options,
      gameState: newGameState,
      conversationHistory: [{
          type: 'user',
          content: actionWithoutNumber
        },
        {
          type: 'ai',
          content: processedStory
        }
      ],
      loadTime
    }});
    
    return result;

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
  
  options = options.map(option => {
    const withoutNumber = option.replace(/^\d+\.\s*/, '').trim();
    return withoutNumber;
  });

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