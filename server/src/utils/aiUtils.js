const {
  generateWithLanguageCheck
} = require('./languageUtils');

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
let currentModelIndex = 0;

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
    name: 'Qwen2-Boundless',
    repo: 'ystemsrx/Qwen2-Boundless',
    comments: 'Works well, quite creative, tends to mix with non-latin languages (non supported)',
    type: MODELTYPES[3]
  }, {
    name: 'Flan-t5-base',
    repo: 'google/flan-t5-base',
    comments: 'Works quite well, fairly slow to process',
    type: MODELTYPES[3]
  },
  {
    name: 'Gpt2-large-conversational-retrain',
    repo: 'Locutusque/gpt2-large-conversational-retrain',
    comments: 'Super slow load',
    type: MODELTYPES[2]
  },
  {
    name: 'Gpt2-large',
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


exports.getAvailableModels = () => {
  return MODELS.map(model => ({
    name: model.name,
    type: model.type,
    repo: model.repo,
    comments: model.comments
  }));
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
    logInteraction('System', 'Test API Response: ' + response);
    return response;
  } catch (error) {
    logInteraction('System', 'Test API Error: ' + error);
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
    logInteraction('Error', `Error checking status for ${modelName}: ` + error);
    return false;
  }
}


function getModelConfig(prompt1, prompt2 = '') {
  const currentModel = MODELS[currentModelIndex];
  let inputs = '';
  let parameters = {
    max_new_tokens: 200,
    max_time: 20,
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

async function generateTitle(story, storyTheme) {
  const model = "facebook/bart-large-cnn";
  const maxLength = 10; // Adjust this value to get shorter or longer titles

  try {
    const response = await hf.summarization({
      model: model,
      inputs: story,
      parameters: {
        max_length: maxLength,
        min_length: 1,
        do_sample: false
      }
    });

    if (response && response.summary_text) {
      return response.summary_text.trim();
    } else {
      console.warn('Unexpected response format from summarization API:', response);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error generating title:', error);
    // Fallback title generation
    const words = story.split(/\s+/).slice(0, 5).join(' ');
    return `${words}... - A ${storyTheme} Adventure`;
  }
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

  conversationHistory.fullRecord = [];
  conversationHistory.pastUserInputs = [];
  conversationHistory.generatedResponses = [];

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
      prompt1 = '';
      prompt2 = `Tell me a brief ${randomTheme} story where I'm the main character. What's the current situation and what do I see?`;
      break;
  }

  logInteraction('User', `Model: ${MODELS[currentModelIndex].name}, Prompt: ${prompt1} ${prompt2}`);

  try {
    const result = await generateWithLanguageCheck(async () => {
      const config = getModelConfig(prompt1, prompt2);
      const response = await hf.textGeneration(config);

      if (!response || !response.generated_text) {
        throw new Error('Invalid response from API');
      };

      let story = response.generated_text;
      story = story.replace(prompt1, '').replace(prompt2, '').trim();

      const {
        processedStory,
        options
      } = extractStoryAndOptions(story);
      const gameState = {
        scene: 'opening',
        theme: randomTheme,
        lastScene: processedStory
      };

      conversationHistory.generatedResponses = [processedStory];
      if (currentModel.type === MODELTYPES[2]) {
        conversationHistory.pastUserInputs.push(prompt2);
      } else {
        conversationHistory.pastUserInputs.push(`${prompt1} ${prompt2}`);
      };
      conversationHistory.fullRecord.push(conversationHistory.pastUserInputs[conversationHistory.pastUserInputs.length - 1], processedStory);

      let title;
      try {
        title = await generateTitle(story, randomTheme);
      } catch (titleError) {
        console.error('Error generating title:', titleError);
        title = `A ${randomTheme} Adventure`;
      }
      
      return {
        title,
        fullStory: processedStory,
        newChunk: processedStory,
        options,
        gameState,
        conversationHistory: [{
          type: 'ai',
          content: processedStory
        }],
        aiModel: MODELS[currentModelIndex].name
      }
    });

    return result;

  } catch (error) {
    logInteraction('Error in generateStory:', error);
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
      prompt1 = fullStory;
      prompt2 = `I ${actionWithoutNumber}. What happens next?`;
      break;
  }

  logInteraction('User', `Model: ${MODELS[currentModelIndex].name}, Prompt: ${prompt1} ${prompt2}`);

  try {
    const result = await generateWithLanguageCheck(async () => {
      const config = getModelConfig(prompt1, prompt2);
      const response = await hf.textGeneration(config);

      if (!response || !response.generated_text) {
        throw new Error('Invalid response from API');
      }

      const {
        processedStory,
        options
      } = extractStoryAndOptions(response.generated_text, fullStory, actionWithoutNumber);
      const newChunk = processedStory;
      const updatedFullStory = `${fullStory}\n\nUser: ${action}\n\nAI: ${newChunk}`;

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      const newGameState = {
        ...gameState,
        scene: 'continuation',
        lastScene: newChunk
      };

      return {
        fullStory: updatedFullStory,
        newChunk,
        options,
        gameState: newGameState,
        conversationHistory: [{
            type: 'user',
            content: actionWithoutNumber
          },
          {
            type: 'ai',
            content: newChunk
          }
        ],
        loadTime
      };
    });

    return result;
  } catch (error) {
    console.error('Error in processAction:', error);
    logInteraction('Error', `Process Action Error: ${error.message}`);
    throw error;
  }
};

function extractStoryAndOptions(text, previousStory = '', userAction = '') {
  // Remove the previous story and any prompt text from the response
  const promptPattern = /^(In this .+ story, I .+\. Then |Following the .+ story, I .+\nWhat happens next\? What follows\?|I .+\. What happens next\?|Tell me a brief .+ story where I'm the main character\. What's the current situation and what do I see\?)/;
  let newContent = text.replace(previousStory, '').replace(promptPattern, '').trim();

  // Remove the user's action and "What happens next?" from the beginning of the response
  const userActionPattern = new RegExp(`^I ${userAction}\\.?\\s*What happens next\\?`, 'i');
  newContent = newContent.replace(userActionPattern, '').trim();

  // Try to find options in the text
  const optionPatterns = [
    /(?:Your options are:|You can:|Options:|Choices:|What will you do\?)\s*((?:\d+\.\s*.+\n?)+)/i,
    /(?:Your options are:|You can:|Options:|Choices:|What will you do\?)\s*((?:[a-z]\)\s*.+\n?)+)/i,
    /(?:Your options are:|You can:|Options:|Choices:|What will you do\?)\s*((?:-\s*.+\n?)+)/i
  ];

  let extractedOptions = [];
  let optionsStart = -1;
  let optionsEnd = -1;

  for (const pattern of optionPatterns) {
    const match = newContent.match(pattern);
    if (match) {
      optionsStart = newContent.indexOf(match[0]);
      optionsEnd = optionsStart + match[0].length;
      extractedOptions = match[1].split('\n')
        .map(option => option.replace(/^(?:\d+\.|\w\)|-)\s*/, '').trim())
        .filter(option => option.length > 0);
      break;
    }
  }

  let processedStory = newContent;
  let options = extractedOptions;

  if (optionsStart !== -1 && optionsEnd !== -1) {
    processedStory = newContent.slice(0, optionsStart) + newContent.slice(optionsEnd);
  }

  const genericOptions = [
    "Investigate further",
    "Talk this out",
    "Check the surroundings",
    "Use an item from the inventory",
    "Rest and plan the next move",
    "Try to find a way out",
    "Search for clues",
    "Attempt to use a skill or ability",
    "Call for help",
    "Set up camp or find shelter",
    "Explore a new area",
    "Interact with the environment",
    "Gather resources",
    "Craft item",
    "Negotiate",
    "Hide and observe",
    "Try to solve this riddle"
  ];

  // If we don't have exactly 3 options, use generic options
  if (options.length !== 3) {
    const shuffledGenericOptions = genericOptions.sort(() => 0.5 - Math.random());
    const usedOptions = new Set(options);
    while (options.length < 3) {
      const newOption = shuffledGenericOptions.find(option => !usedOptions.has(option));
      if (newOption) {
        options.push(newOption);
        usedOptions.add(newOption);
      } else {
        break; // Break if we've used all generic options
      }
    }
  }

  // Trim options to exactly 3
  options = options.slice(0, 3);

  logInteraction('System', processedStory);
  logInteraction('System', options);

  return {
    processedStory,
    options,
  };
}

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