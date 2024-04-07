import {
    pipeline,
    env
} from '@xenova/transformers';

env.allowRemoteModels = true;
env.allowLocalModels = false;
class PipelineFactory {
    static task = null;
    static model = null;

    // NOTE: instance stores a promise that resolves to the pipeline
    static instance = null;

    constructor(tokenizer, model) {
        this.tokenizer = tokenizer;
        this.model = model;
    }

    /**
     * Get pipeline instance
     * @param {*} progressCallback 
     * @returns {Promise}
     */
    static getInstance(progressCallback = null) {
        if (this.task === null || this.model === null) {
            throw Error("Must set task and model")
        }
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {
                progress_callback: progressCallback
            });
        }

        return this.instance;
    }
}

class TextGenerationPipelineFactory extends PipelineFactory {
    static task = 'text-generation';
    static model = 'Xenova/gpt2';
}

export async function HF_DEVELOP_STORY() {
    const data = document.getElementById("user_prompt").value;

    let pipeline = await TextGenerationPipelineFactory.getInstance(data => {
        self.postMessage({
            type: 'download',
            task: 'text-generation',
            data: data
        });
    })

    let text = data.text.trim();

    return await pipeline(text, {
        ...data.generation,
        callback_function: function (beams) {
            const decodedText = pipeline.tokenizer.decode(beams[0].output_token_ids, {
                skip_special_tokens: true,
            })

            self.postMessage({
                type: 'update',
                target: data.elementIdToUpdate,
                data: decodedText
            });
        }
    })
}