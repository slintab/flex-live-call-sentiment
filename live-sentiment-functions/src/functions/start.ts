import "@twilio-labs/serverless-runtime-types";
import { Twilio } from "twilio";
import {
  HandlerFn,
  Callback,
  functionValidator as TokenValidator,
} from "twilio-flex-token-validator";

const { createResponse, createError } = require(Runtime.getFunctions()[
  "common/utils"
].path);

type MyEvent = {
  Token: string;
  TokenResult?: object;
  callSid?: string;
};

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  REALTIME_INTELLIGENCE_SERVICE_SID?: string;
  getTwilioClient?: () => Twilio;
};

async function startCallSentiment(
  client: Twilio,
  callSid: string,
  intelligenceServiceSid: string
) {
  await client.calls(callSid).transcriptions.create({
    intelligenceService: intelligenceServiceSid,
    track: "inbound_track",
  });
}

export const handler: HandlerFn = TokenValidator(async function (
  context: MyContext,
  event: MyEvent,
  callback: Callback
) {
  const { callSid } = event;
  const { REALTIME_INTELLIGENCE_SERVICE_SID, getTwilioClient } = context;

  if (!callSid) {
    return createError(Error("Missing parameters"), 400, callback);
  }

  if (!(REALTIME_INTELLIGENCE_SERVICE_SID && getTwilioClient)) {
    return createError(Error("Internal error"), 500, callback);
  }

  try {
    const twilioClient = getTwilioClient();
    await startCallSentiment(
      twilioClient,
      callSid,
      REALTIME_INTELLIGENCE_SERVICE_SID
    );

    return createResponse({ result: true }, callback);
  } catch (err) {
    console.error(err);
    return createError(Error("Internal error"), 500, callback);
  }
});
