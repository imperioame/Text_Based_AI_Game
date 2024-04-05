import {
    LANGUAGES
} from '../../configs/configs.mjs';
import * as DATA from './data.mjs';

const boton_descarga_cv = document.getElementById('container_banner_mi_persona').getElementsByClassName('boton_gris')[0];


export function setSpanish() {
    boton_descarga_cv.href = DATA.URLS_CV.ESPANOL;
}

export function setEnglish() {
    boton_descarga_cv.href = DATA.URLS_CV.INGLES;
}