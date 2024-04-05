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