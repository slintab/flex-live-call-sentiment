import "@twilio-labs/serverless-runtime-types";
import { Twilio as ITwilio } from "twilio";
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
  conferenceSid?: string;
  taskSid?: string;
};

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  STREAM_URL?: string;
  getTwilioClient?: () => ITwilio;
};

async function startCallStream(
  client: ITwilio,
  callSid: string,
  taskSid: string,
  url: string
) {
  await client.calls(callSid).streams.create({
    url: url + "/ws/" + taskSid,
  });
}

export const handler: HandlerFn = TokenValidator(async function (
  context: MyContext,
  event: MyEvent,
  callback: Callback
) {
  const { callSid, taskSid } = event;
  const { STREAM_URL, getTwilioClient } = context;

  if (!(callSid && taskSid)) {
    return createError(Error("Missing parameters"), 400, callback);
  }

  if (!(STREAM_URL && getTwilioClient)) {
    return createError(Error("Internal error"), 500, callback);
  }

  try {
    const twilioClient = getTwilioClient();
    await startCallStream(twilioClient, callSid, taskSid, STREAM_URL);

    return createResponse({ result: true }, callback);
  } catch (err) {
    return createError(Error("Internal error"), 500, callback);
  }
});
