import {
    //HF_STARTUP,
    HF_DEVELOP_STORY
} from '../services/text_generation.mjs';

//HF_STARTUP();
export var IS_MOBILE = window.innerWidth < 900;

//Add the call to the GPT2 API
document.addEventListener('keypress', function (e) {
    //Been trigered only on an enter keyboard imput from the user
    if (e.key === 'Enter'){
        HF_DEVELOP_STORY();
    }
});