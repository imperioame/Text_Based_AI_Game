import {
    LANGUAGES
} from '../js/data.mjs';
import {
    changeLanguage
} from '../js/functions.mjs';

let userLanguages = navigator.languages && navigator.languages[0] || navigator.language || navigator.userLanguage;

if(userLanguages.length > 2){
    userLanguages = userLanguages.slice(0,2);
}

if (userLanguages.indexOf(LANGUAGES.ESPANOL) > -1) {
    window.currentLanguage.push(LANGUAGES.ESPANOL);
} else {
    window.currentLanguage.push(LANGUAGES.INGLES);
}

changeLanguage(window.currentLanguage.pop());

//export const URL_HF_API = 'https://api-inference.huggingface.co/models/openai-community/gpt2-xl';
//export const URL_HF_API = 'https://api-inference.huggingface.co/models/openai-community/gpt2';
export const URL_HF_API = "Xenova/gpt2";
export const INPUT_TEXT_SIZE = 200;
