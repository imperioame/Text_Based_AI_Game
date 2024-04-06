import * as DATA from './data.mjs';
import {
    TEXTOS,
    LANGUAGES,
} from './data.mjs';


export function getLanguageFromURL(e) {
    let idioma_en_url = e.target.URL.split('#')[1];
    if (idioma_en_url) {
        return idioma_en_url;
    } else {
        return 'es';
    }
}

export function findInObject(object, element) {
    // Receives an object and tries to find element in it.
    // Returns index of object, Object transformed into an array
    // Meant for Diccionaries

    const array = Object.entries(object);

    const objectElement = array.find(subArray => subArray[1] == element);
    const index = array.indexOf(objectElement);

    return [index, array, objectElement];
}

export function openModal(e) {
    //This function manages an UI modal
    const modal_overlay = document.createElement('div');
    modal_overlay.id = 'modal_overlay';

    const modal = document.createElement('div');
    modal.id = 'modal';

    const iframe = document.createElement('iframe');

    let trabajo = DATA.TRABAJOS_PORFOLIO.find(trabajo => trabajo.id == e.target.parentElement.dataset.trabajo_id);
    iframe.src = trabajo.link;

    modal.appendChild(iframe);

    modal_overlay.appendChild(modal);
    document.body.appendChild(modal_overlay);
}

export function changeLanguage(new_language) {
    window.currentLanguage.push(new_language);
    let textos_a_usar;
    const boton_idioma_ingles = document.getElementById('cambiar_lenguaje_a_ingles').parentNode;
    const boton_idioma_espanol = document.getElementById('cambiar_lenguaje_a_español').parentNode;

    if (new_language == LANGUAGES.ESPANOL) {
        textos_a_usar = TEXTOS.es;

        boton_idioma_ingles.addEventListener('click', function () {
            window.currentLanguage.pop();
            changeLanguage(LANGUAGES.INGLES);
        });

        boton_idioma_ingles.classList.remove('idioma_seleccionado');
        boton_idioma_espanol.classList.toggle('idioma_seleccionado');

        boton_idioma_espanol.replaceWith(boton_idioma_espanol.cloneNode(true));
    } else {
        textos_a_usar = TEXTOS.en;

        boton_idioma_espanol.addEventListener('click', function () {
            window.currentLanguage.pop();
            changeLanguage(LANGUAGES.ESPANOL);
        });

        boton_idioma_espanol.classList.remove('idioma_seleccionado');
        boton_idioma_ingles.classList.toggle('idioma_seleccionado');
        boton_idioma_ingles.replaceWith(boton_idioma_ingles.cloneNode(true));
    }
    document.documentElement.lang = new_language;
    document.title = textos_a_usar.TITULO_PAGINA;

    const a = document.createElement('a');
    a.href = 'https://media.marioa.me';
    a.target = '_blank';
    a.innerHTML = 'Julián Mario Amé';
    document.getElementById('footer').appendChild(a);
}
