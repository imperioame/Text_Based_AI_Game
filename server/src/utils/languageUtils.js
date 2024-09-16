const iconv = require('iconv-lite');
const emojiRegex = require('emoji-regex');

function isValidUTF8(text) {
  try {
    return iconv.decode(Buffer.from(text), 'utf8') === text;
  } catch (error) {
    return false;
  }
}

function containsNonLatinCharacters(text) {
  const emojiPattern = emojiRegex();
  return /[^\u0000-\u007F\u00A0-\u00FF\s.,!?;:'"()-]/.test(text.replace(emojiPattern, ''));}

function replaceNonLatinWithScribbles(text) {
  const randomCharacters = '*/-+!@#$%^&*()_+[]{}|;:,.<>?';
  const emojiPattern = emojiRegex();
  
  return text.replace(/[^\u0000-\u007F\u00A0-\u00FF\s.,!?;:'"()-]/g, (match) => {
    return emojiPattern.test(match) ? match : randomCharacters[Math.floor(Math.random() * randomCharacters.length)];
  });
}

function removeSpecialUnicodeBlocks(text) {
  return text.replace(/\\x[A-Fa-f0-9]{2}/g, '');
}

function createCreativeError(text) {
  const scribbledText = replaceNonLatinWithScribbles(text);
  //return `${scribbledText}\n\n[Translator's note: Parts of this text were indecipherable, possibly due to interference from an interdimensional rift. We've done our best to transcribe what we could.]`;
  return `${scribbledText}`;
}

function sanitizeText(text) {
  const withoutSpecialBlocks = removeSpecialUnicodeBlocks(text);
  return replaceNonLatinWithScribbles(withoutSpecialBlocks);
}

async function generateWithLanguageCheck(generationFunction, maxAttempts = 1) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await generationFunction();
    
    const sanitizedNewChunk = sanitizeText(result.newChunk);
    const sanitizedFullStory = sanitizeText(result.fullStory);
    
    if (isValidUTF8(sanitizedNewChunk) && isValidUTF8(sanitizedFullStory)) {
      result.newChunk = sanitizedNewChunk;
      result.fullStory = sanitizedFullStory;
      return result;
    }
    
    console.log(`Attempt ${attempt}: Generated text contains invalid characters. Retrying...`);
  }
  
  // If we've reached this point, we've failed to generate valid text
  const lastResult = await generationFunction();
  lastResult.newChunk = sanitizeText(lastResult.newChunk);
  lastResult.fullStory = sanitizeText(lastResult.fullStory);
  return lastResult;
}

module.exports = {
  generateWithLanguageCheck,
  sanitizeText
};