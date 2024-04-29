import {
  pipeline,
  env
} from '@xenova/transformers';
const messages_text = document.getElementById('messages_text');
//env.allowRemoteModels = true;
//env.allowLocalModels = false;
//env.useBrowserCache = false;

env.localModelPath = './models/gpt2';
console.log(env.localModelPath);
env.allowRemoteModels = false;
env.allowLocalModels = true;

let pipe;
window.onload = async function () {
  messages_text.innerHTML = 'Loading models, please wait...';
  pipe = await pipeline('text-generation', model = env.localModelPath);
  messages_text.innerHTML = 'Ready to play';
}

let storyline = document.getElementById('story_text');

async function generateStory(text) {
  const output = await pipe(text, {
    max_new_tokens: 20,
    do_sample: true,
    top_k: 5,
  });

  document.getElementById("story_text").innerHTML = output;
}


document.addEventListener('keypress', function (e) {

  //Get the user input
  let user_prompt = document.getElementById('user_prompt').value;

  //call the api



  //Been trigered only on an enter keyboard imput from the user
  if (e.key === 'Enter') {

    storyline += user_prompt + '\n';
    generateStory(storyline);
  }
});