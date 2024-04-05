
export function call_api_hf_gpt2() {
    document.getElementById("error_msj").innerHTML = '';
    document.getElementById("error_msj").style.display = "none";


    async function query(data) {
        const api_language = window.currentLanguage[0] == 'es' ? 'https://api-inference.huggingface.co/models/flax-community/gpt-2-spanish' : 'https://api-inference.huggingface.co/models/gpt2';

        const response = await fetch(api_language, {
                headers: {
                    Authorization: "Bearer " + process.env.HF_API_TOKEN
                },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }

    const query_content = document.getElementById("contacto_extra_input").value;

    let response_limit = 200;
    if(query_content.length > 200){
        response_limit = query_content.length + 200;
    }

    const error = {
        es: 'El servicio de GPT2 no se encuentra disponible en este momento. Probar dentro de la próxima hora.<br>(Puede deberse a demasiadas consultas, también puede requerir un breve tiempo para inicializar)',
        en: 'GPT2 service is not available in this moment. Try again in the next hour.<br>(May be due to too many requests, it also may need a little time to initialize)'
    }
    let error_content = window.currentLanguage[0] == 'es' ? error.es : error.en;

    let params = {
        "inputs": query_content,
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

                document.getElementById("contacto_extra_input").value = final_response + '...';
            } else {
                document.getElementById("error_msj").innerHTML = error_content;
                document.getElementById("error_msj").style.display = "block";
            }
        });
    }
}