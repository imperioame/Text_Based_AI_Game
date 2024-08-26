const iconv = require('iconv-lite');

function isValidUTF8(text) {
  try {
    return iconv.decode(Buffer.from(text), 'utf8') === text;
  } catch (error) {
    return false;
  }
}

function containsNonLatinCharacters(text) {
  return /[^\u0000-\u007F\u00A0-\u00FF\s.,!?;:'"()-]/g.test(text);
}

function replaceNonLatinWithScribbles(text) {
  return text.replace(/[^\u0000-\u007F\u00A0-\u00FF\s.,!?;:'"()-]/g, '-');
}

function createCreativeError(text) {
  const scribbledText = replaceNonLatinWithScribbles(text);
  //return `${scribbledText}\n\n[Translator's note: Parts of this text were indecipherable, possibly due to interference from an interdimensional rift. We've done our best to transcribe what we could.]`;
  return `${scribbledText}`;
}

async function generateWithLanguageCheck(generationFunction, maxAttempts = 1) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await generationFunction();
    
    if (isValidUTF8(result.newChunk) && !containsNonLatinCharacters(result.newChunk)) {
      return result;
    }
    
    console.log(`Attempt ${attempt}: Generated text contains non-UTF-8 or non-Latin characters. Retrying...`);
  }
  
  // If we've reached this point, we've failed to generate valid text
  const lastResult = await generationFunction();
  lastResult.newChunk = createCreativeError(lastResult.newChunk);
  lastResult.fullStory = createCreativeError(lastResult.fullStory);
  return lastResult;
}

module.exports = {
  generateWithLanguageCheck
};