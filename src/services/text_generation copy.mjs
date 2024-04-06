import {
    URL_HF_API
} from '../configs/configs.mjs';

export function load_API_hf() {
    async function query() {
        const response = await fetch(
            URL_HF_API, {
                headers: {
                    Authorization: "Bearer " + process.env.HF_API_TOKEN
                },
                method: "POST",
                body: JSON.stringify(''),
            });
        const result = await response.json();
        return result;
    }

    let params = {
        "inputs": '',
        "options": 'wait_for_model'
    };

    query(params).then((response) => {
        console.log(!response.error? response[0].generated_text : response.error);
    });
}

export function call_API_hf_gpt() {

    document.getElementById("error_msj").innerHTML = '';
    document.getElementById("error_msj").style.display = "none";


    async function query(data) {
        const response = await fetch(
            URL_HF_API, {
                headers: {
                    Authorization: "Bearer " + process.env.HF_API_TOKEN
                },
                method: "POST",
                body: JSON.stringify(data),
            });
        const result = await response.json();
        return result;
    }

    const query_content = document.getElementById("user_prompt").value;

    let response_limit = 200;
    if (query_content.length > 200) {
        response_limit = query_content.length + 200;
    }

    let params = {
        "inputs": query_content,
        "outputs": 'model.generate(inputs, max_new_tokens=20)',
        "pad_token_id": "eos_token_id: 50256",
        "options": 'wait_for_model'
    };
    let final_response = params.inputs;

    recursive_call(params);


    function recursive_call(params) {
        query(params).then((response) => {
            if (!response.error) {
                final_response = response[0].generated_text;



                if (final_response.length < response_limit) {
                    params.inputs = final_response;
                    recursive_call(params)
                }

                document.getElementById("story_text").innerHTML = final_response + '...';
            } else {
                document.getElementById("error_msj").innerHTML = response.error;
                document.getElementById("error_msj").style.display = "block";
            }
        });
    }
}