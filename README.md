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
| Login for user | 🔨 | Check authMiddleware, not sure what is doing right now |
| Sidebar games history | 🔨 | requires Login for user to work well |
| The API /:id is not authenticated, needs to be crossed with user info | 💻 | Login for user |
| UI story view scroll to last entry | ✅️ |  |
| Declare new text2text generation in modeltypes | ✅️ |  |
| Search text2text generation add new models | ✅️ |  |
| Try for the AI to provide options for the user | 🔨 | The extractStoryAndOptions in aiutils tryes to catch options fron the ai story and provides presets if unable  |
| Validate that the pre-made user options are not repeated | 🔨 | Seems like the extractStoryAndOptions is always returning the same 3 options |
| Loader animation when initializing a AI model | 🔨 | Needs alignment |
| Error messages in the UI | 🔨 |  |
| AI model switch | 🔨 | Pending to implement a tooltip to show ai model comment and type, or some UI structure for it |
| Document how to build for prod (Without docker) | 💻 | Need Daniel |
| Text writing animation on the UI | 🔨 | Don't know why it breaks so much. Seems to be working now. |
| Sidebar with glass transparency effect | 💻 | Check if tailwind has something |
| Check responsive | 💻 | 
| UI Action feedback - animation + loader | 💻 | Check if tailwind has something |
| CRT monitor sound effect | 💻 | Investigate sonorization options |
| Get a title for each adventure | 🔨 | The current function is calling hf api. I dont think that's efficient. Let's at least call a fast loading model. |
| Add a help button with basic info of the game | 💻 |  |
| Add a footer with my info | 💻 |  |
| Also print user inputs | 🔨 | Back should provide both user action and story |
| Clean css and normalize as .scss | 💻 |  |
| Incorporate tailwind in the scss and adjust npm script to build scss and tailwind | 💻 | normalize css |
| Code review and optimization | 💻 | have a happily functional prototype |
| Qwen2-Boundless tends to answer in an asian language that breaks the utf encoding when pushig to db. try to limit this | ✅️ |  |
| in aiUtils check if the response has the original prompt, and trim it | 💻 |  |
| The frontend is not keeping the linebreaks sent by the api | 💻 |  |
| The Ai model or my languageUtils are generating special unicode blocks (https://en.wikipedia.org/wiki/Specials_%28Unicode_block%29) as \xEF\xBC\ or such. DB is breaking at this point | 💻 |  |
| When opening the site, it's making to requests for a new game | 💻 |  |
| If sidebar is pinned, push content right | 💻 |  |
| If a user registers while playing a game, implement a separate endpoint to associate the game with the newly registered user | 💻 |  take the game's publicId and the user's ID, then updates the game's userId field. This endpoint should be called after successful user registration if there's an active game. |



💻: To be done

🔨: Working on it

✅️: Done

🕯️: Needs QA

❌: Dismissed
