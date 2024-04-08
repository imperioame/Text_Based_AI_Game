//import axios from 'axios';
/*
axios.get('localhost')
  .then((response) => console.log(response.data))
  .catch((error) => console.log(error));
*/

fetch("http://localhost/")
  .then((response) => response.json())
  .then((json) => console.log(json));


document.addEventListener('keypress', function (e) {

    //Get the user input
    let user_prompt = document.getElementById('user_prompt').value;

    //call the api



    //Been trigered only on an enter keyboard imput from the user
    if (e.key === 'Enter') {
        document.getElementById("story_text").innerHTML = "";
    }
});