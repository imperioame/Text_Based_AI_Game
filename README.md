# Text_Based_AI_Game
[![Generic badge](https://img.shields.io/badge/Version-0.1-blue.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/Mantained-Yes-green.svg)](https://shields.io/)
[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)



Text based game using Hugging face inference API with a selection of models.
The game story is developed by the AI model, the user is the player.


## Dev
Remember to compile css

For tailwind:
> cd ./client
> 
> npm run tailwind

There's also a .scss file in the client folder

## Build for dev
> docker-compose up --build



## Backlog:
| Task          | Status        | Dependencies / Notes        |
| ------------- | ------------- | ------------------- |
| Safeguard for long promts, cap at certain length | 🕯️ |  |
| Login for user | 🔨 | I have a backend untested, need to do front |
| Sidebar games history | 💻 | Login for user |
| UI story view scroll to last entry | 💻 | Review front-back interaction - Need Daniel |
| Declare new text2text generation in modeltypes | ✅️ |  |
| Search text2text generation add new models | 🔨 | Have declared t2tgen |
| Try for the AI to provide options for the user | 💻 | Should implement another query to do this |
| Validate that the pre-made user options are not repeated | 💻 |  |
| Loader animation when initializing a AI model | 🔨 | UI review |
| Error messages in the UI | 💻 | Review front-back interaction - UI review - Need Daniel |
| AI model switch | 🔨 | I have a backend untested, need to do front |
| Document how to build for prod (Without docker) | 💻 | Need Daniel |
| Text writing animation on the UI | 🔨 | Check if tailwind has something |
| Sidebar with glass transparency effect | 🔨 | Check if tailwind has something |
| Check responsive | 💻 | 
| Sidebar opening animation | 💻 |
| UI Action feedback - animation + loader | 💻 | Check if tailwind has something |
| CRT monitor sound effect | 💻 | Investigate sonorization options |
| Get a title for each adventure | 🔨 | I have a backend untested, need to do front |
| Add a help button with basic info of the game | 💻 |  |
| Add a footer with my info | 💻 |  |
| Also print user inputs | 🔨 | Back should provide both user action and story |
| Clean css and normalize as .scss | 💻 |  |
| Incorporate tailwind in the scss and adjust npm script to build scss and tailwind | 💻 | normalize css |
| Code review and optimization | 💻 | have a happily functional prototype |
| Qwen2-Boundless tends to answer in an asian language that breaks the utf encoding when pushig to db. try to limit this | ✅️ |  |
| in aiUtils check if the response has the original prompt, and trim it | 💻 |  |
| The frontend is not keeping the linebreaks sent by the api | 💻 |  |

💻: To be done

🔨: Working on it

✅️: Done

🕯️: Needs QA

❌: Dismissed
