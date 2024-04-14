# Twilio Flex - Live call sentiment

This repository contains the code for a Twilio Flex plugin for displaying a real-time call sentiment indicator for supervisors in the Flex UI.


## Table of contents
* [Demo](#demo)
* [Components](#components)
* [Setup](#setup)
* [Maintainer](#maintainer)


## Demo
![Demo](demo.png?raw=true)


## Components
The solution consists of the following building blocks:
- **Twilio Flex plugin *(live-sentiment-plugin)***: for streaming call audio and displaying the live sentiment indicator for supervisors in the Flex Teams View.
- **Cloudflare worker *(live-sentiment-worker)***: used as the destination for call streams. The worker forwards the audio to [Deepgram](https://deepgram.com) for transcription and uses [Workers AI](https://developers.cloudflare.com/workers-ai/) for detecting sentiment from the transcript. Finally, it publishes the result to a Twilio Sync stream.
- **Twilio functions *(live-sentiment-functions)***: used as middleware for updating calls for streaming, and for obtaining the token for connecting to Twilio Sync.
- **Twilio Sync stream**: pub/sub service for publishing and delivering the results of the sentiment analysis.
- **Deepgram**: for transcribing call audio.


## Setup
1. **Create Sync service:** 
   1. This can be done using the Twilio Console, under *Sync > Services > Create new Sync service*.
2. **Deploy Twilio functions:**
   1. Navigate to the functions directory: `cd live-sentiment-functions`
   2. Install the [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit).
   3. Rename `.env.example` to `.env`, and set the values of environment variables as follows:
      - `ACCOUNT_SID`: your Twilio account SID
      - `AUTH_TOKEN`: your Twilio auth token 
      - `API_KEY`: your Twilio API key
      - `API_SECRET`: your Twilio API secret
      - `SYNC_SERVICE_SID`: SID of the Sync service from step 1.
      - `SYNC_TOKEN_IDENTITY`: hard-to-guess, arbitrary string. Used as the Sync access token's identity and for accessing the function for fetching the Sync token.
   4. Deploy the functions using `npm run deploy`.
3. **Deploy Cloudflare worker:**
   1. Navigate to the worker directory: `cd live-sentiment-worker`.
   2. Install dependencies via `npm install`.
   3. Deploy the worker using `npm run deploy`.
   4. Add the following [secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers) to your worker:
      - `DEEPGRAM_API_KEY`: your [Deepgram](https://deepgram.com) API key.
      - `SYNC_TOKEN_IDENTITY`: identity string from step 2.
      - `SYNC_TOKEN_URL`: full URL of the deployed `/token` Twilio function from step 2.
4. **Re-deploy Twilio functions:**
   1. Navigate to the functions directory: `cd live-sentiment-functions`
   2. Update the `.env` file and set `STREAM_URL` to the websocket URL of the Cloudflare worker from step 3.
   3. Re-deploy the functions using `npm run deploy`.
5. **Deploy Flex plugin:**
   1. Navigate to the plugin directory: `cd live-sentiment-plugin`.
   2. Install the [Flex Plugins CLI](https://www.twilio.com/docs/flex/developer/plugins/cli).
   3. Rename `.env.example` to `.env`, and set the values of environment variables as follows: 
      - `FLEX_APP_FUNCTIONS_URL`: base URL of Twilio functions from step 2.
      - `FLEX_APP_SYNC_TOKEN_IDENTITY`: identity string from step 2.
   4. Deploy the plugin using the `twilio flex:plugins:deploy` command.


## Maintainer
Thanks for reading this far!
If you have any questions, do not hesitate to reach out at `hello@slintab.dev`