# Twilio Flex: Live call sentiment

This repository contains the code for a Twilio Flex plugin for displaying a real-time call sentiment indicator for supervisors in the Flex UI.


## Table of contents

* [Demo](#demo)
* [Components](#components)
* [Setup](#setup)
* [Maintainer](#maintainer)


## Demo

The sentiment indicator is displayed to the right of the [TaskCard](https://assets.flex.twilio.com/docs/releases/flex-ui/2.8.3/programmable-components/components/Supervisor%E2%80%A4TaskCard/) component for each Voice task. Green, yellow and red is used to indicate positive,neutral and negative sentiment, respectively. The below screenshot shows a voice task with positive sentiment:

![Demo](demo.png?raw=true)


## Components

The solution consists of the following building blocks:
- **Twilio Flex plugin *(live-sentiment-plugin)***: for streaming call audio and displaying the live sentiment indicator for supervisors in the Flex Teams View.
- **Twilio Functions *(live-sentiment-functions)***: used as middleware for updating calls for streaming, and for obtaining the token for connecting to Twilio Sync.
- **Twilio Real-Time Conversational Intelligence**: service for evaluating call sentiment in real-time.
- **Twilio Sync Stream**: pub/sub service for publishing and delivering the results of the sentiment analysis.


## Setup
1. **Create Sync Service:** Create a Sync Service using the Twilio Console, under *Sync > Services > Create new Sync service*.
2. **Deploy Twilio Functions:**
   1. Navigate to the functions directory: `cd live-sentiment-functions`
   2. Install the [Twilio Serverless Toolkit](https://www.twilio.com/docs/labs/serverless-toolkit).
   3. Rename `.env.example` to `.env`, and set the values of environment variables as follows:
      - `ACCOUNT_SID`: your Twilio account SID
      - `AUTH_TOKEN`: your Twilio auth token 
      - `API_KEY`: your Twilio API key
      - `API_SECRET`: your Twilio API secret
      - `SYNC_SERVICE_SID`: SID of the Sync service from step 2.
   4. Deploy the functions using `npm run deploy`.
3. **Create Conversational Intelligence Service:** Create a Real-Time Conversational Intelligence Service for analyzing call sentiment following the instructions [here](https://www.twilio.com/docs/conversational-intelligence/real-time/getting-started#real-time-sentiment-create-an-intelligence-service). Configure its webhook to the URL of the `/events` function from step 2.
4. **Re-deploy Twilio Functions:**
   1. Navigate to the functions directory: `cd live-sentiment-functions`
   2. Update the `.env` file and set `REALTIME_INTELLIGENCE_SERVICE_SID` to the SID of the Conversational Intelligence service from step 3.
   3. Re-deploy the functions using `npm run deploy`.
5. **Deploy Flex plugin:**
   1. Navigate to the plugin directory: `cd live-sentiment-plugin`.
   2. Install the [Flex Plugins CLI](https://www.twilio.com/docs/flex/developer/plugins/cli).
   3. Rename `.env.example` to `.env`, and set `FLEX_APP_FUNCTIONS_URL` to the base URL of Twilio Functions from step 2.
   4. Deploy the plugin using the `twilio flex:plugins:deploy` command.


## Maintainer

Thanks for reading this far!
If you have any questions, do not hesitate to reach out at `hello@slintab.dev`