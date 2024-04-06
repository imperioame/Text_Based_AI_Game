import {
    URL_HF_API,
    INPUT_TEXT_SIZE
} from '../configs/configs.mjs';

import {
    pipeline,
    env
} from '@xenova/transformers';

//env.allowRemoteModels = true;
//env.allowLocalModels = false;
//env.useBrowserCache = false;

env.localModelPath = '/models/gpt2/';
env.allowRemoteModels = false;

// Set location of .wasm files. Defaults to use a CDN.
//env.backends.onnx.wasm.wasmPaths = '/path/to/files/';
/*
export async function HF_STARTUP() {
    return pipe = await pipeline('text-generation', "Xenova/gpt2");
}
*/
export async function HF_DEVELOP_STORY() {
    let pipe = await pipeline('text-generation', "Xenova/gpt2");
    document.getElementById("error_msj").innerHTML = '';
    document.getElementById("error_msj").style.display = "none";

    const query_content = document.getElementById("user_prompt").value;

    let response_limit = INPUT_TEXT_SIZE;
    if (query_content.length > INPUT_TEXT_SIZE) {
        response_limit = query_content.length + INPUT_TEXT_SIZE;
    }

    recursive_call(query_content);

    async function recursive_call(text) {
        let final_response = await pipe(text,{
            max_new_tokens: 20,
            do_sample: true,
            top_k: 5,
        });

        /*
        // Error handling
        if (!response.error) {
        } else {
            document.getElementById("error_msj").innerHTML = response.error;
            document.getElementById("error_msj").style.display = "block";
        }
        */
        if (final_response.length < response_limit) {
            text = final_response;
            recursive_call(text)
        }

        document.getElementById("story_text").innerHTML = final_response + '...';
    }
}