import {
  pipeline,
  env
} from '@xenova/transformers';
const messages_text = document.getElementById('messages_text');
env.allowRemoteModels = true;
env.allowLocalModels = false;
//env.useBrowserCache = false;

//env.localModelPath = './models/gpt2/';
//env.allowRemoteModels = false;
//env.allowLocalModels = true;


window.onload = async function () {
  messages_text.innerHTML = 'Loading models, please wait...';
  const pipe = await pipeline('text-generation', 'Xenova/gpt2');
  messages_text.innerHTML = 'Ready to play';
}

let storyline = document.getElementById('story_text');

document.addEventListener('keypress', function (e) {

  //Get the user input
  let user_prompt = document.getElementById('user_prompt').value;

  //call the api



  //Been trigered only on an enter keyboard imput from the user
  if (e.key === 'Enter') {

    storyline += user_prompt + '\n';
    const output = await generator(storyline, {
      max_new_tokens: 20,
      do_sample: true,
      top_k: 5,
  });

    document.getElementById("story_text").innerHTML = output;
  }
});