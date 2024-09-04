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
| Task          | Front/Back        | Status        | Dependencies / Notes        |
| ------------- | ------------- | ------------- | ------------------- |
| Safeguard for long promts, cap at certain length | back/aiutils | 🕯️ |  |
| Login for user | front | 🕯️ | It's working but I would like to keep on testing it |
| Call for /api/user/games when starting a new game | front | 🕯️ | It's working but I would like to keep on testing it |
| Dont call /api/user/games if the user is not logged | front | 🕯️ |  |
| keep the user logged in | front | 🔨 |  |
| Sidebar games history | front | 🔨 | answering empty |
| The API /:id is not authenticated, needs to be crossed with user info | back | 💻 | Login for user |
| UI story view scroll to last entry | front | ✅️ |  |
| Declare new text2text generation in modeltypes | back | ✅️ |  |
| Search text2text generation add new models |  | ✅️ |  |
| Try for the AI to provide options for the user | back/aiUtils | 🔨 | The extractStoryAndOptions in aiutils tryes to catch options fron the ai story and provides presets if unable  |
| Validate that the pre-made user options are not repeated | back/aiutils | 🕯️ |  |
| Loader animation when initializing a AI model | front | 🔨 | Needs alignment |
| Error messages in the UI | front | 🔨 | Maybe implement a controller to catch any error |
| AI model switch | front | 🔨 | Pending to implement a tooltip to show ai model comment and type, or some UI structure for it |
| Document how to build for prod (Without docker) |  | 💻 | finish the dev first |
| Text writing animation on the UI | front | 🔨 | Don't know why it breaks so much. Seems to be working now. |
| Sidebar with glass transparency effect | front | 💻 | Check if tailwind has something |
| Check responsive | front | 💻 | 
| UI Action feedback - animation + loader | front | 💻 | Check if tailwind has something |
| CRT monitor sound effect | front | 💻 | Investigate sonorization options |
| Get a title for each adventure | back/aiutils | 🔨 | The title is beign provided but not placed on UI |
| Add a help button with basic info of the game | front | 💻 |  |
| Add a footer with my info | front | 💻 |  |
| Also print user inputs | ✅️ | Back should provide both user action and story |
| Clean css and normalize as .scss | front | 💻 |  |
| Incorporate tailwind in the scss and adjust npm script to build scss and tailwind | front | 💻 | normalize css |
| Code review and optimization | front and back | 💻 | have a happily functional prototype |
| Qwen2-Boundless tends to answer in an asian language that breaks the utf encoding when pushig to db. try to limit this | back | ✅️ |  |
| in aiUtils check if the response has the original prompt, and trim it | back | ✅️ |  |
| The frontend is not keeping the linebreaks sent by the api | front | ✅️ |  |
| The Ai model or my languageUtils are generating special unicode blocks (https://en.wikipedia.org/wiki/Specials_%28Unicode_block%29) as \xEF\xBC\ or such. DB is breaking at this point | back/aiutils | 🕯️ |  |
| The Ais sometimes provide emojis, the backend provides this in conversationHistory but not in lastChunk, I would like to keep this | back/aiutils | 🕯️ |  |
| When opening the site, it's making to requests for a new game | front | 🕯️ |  |
| If sidebar is pinned, push content right | front | 💻 |  |
| Normalize use and style of spinner | front | 💻 |  |
| If a user registers while playing a game, implement a separate endpoint to associate the game with the newly registered user | front+back | 🕯️ |  take the game's publicId and the user's ID, then updates the game's userId field. This endpoint should be called after successful user registration if there's an active game. |
| Make sure errors dont halt server in prod | front + back | 💻 |  |
| Add the username or a user icon somewhere to aknowledge the logged user | front | 💻 |  |
| Add a big error X and message if the game cant start | front | 💻 |  |
| If the user starts a new game it should completely refresh storyDisplay | front | 💻 |  |
| Only allow one query to "new game" and "submit action", lock the action buttons until query processed | front | 🔨 |  |
| Add "Error processing action" - "SyntaxError: Invalid regular expression" when the backend detects an option in the AI story | backend | 💻 |  |


💻: To be done

🔨: Working on it

✅️: Done

🕯️: Needs QA

❌: Dismissed
