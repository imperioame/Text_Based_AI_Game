import {
    call_api_hf_gpt2
} from '../services/text_generation.mjs';


export var IS_MOBILE = window.innerWidth < 900;

//agrego la llamada a la api de gpt2
document.querySelector('#contacto_extra button').addEventListener('click', call_api_hf_gpt2);
//call_api_hf_gpt2();

