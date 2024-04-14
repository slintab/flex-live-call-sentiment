import "@twilio-labs/serverless-runtime-types";
import { Twilio as ITwilio, twiml as Twiml } from "twilio";
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

async function updateParticipant(
  client: ITwilio,
  conferenceSid: string,
  callSid: string
) {
  await client
    .conferences(conferenceSid)
    .participants(callSid)
    .update({ endConferenceOnExit: false });
}

async function startCallStream(
  client: ITwilio,
  callSid: string,
  taskSid: string,
  url: string
) {
  const twiml = new Twiml.VoiceResponse();

  const start = twiml.start();
  start.stream({
    url: url + "/ws/" + taskSid,
  });

  const dial = twiml.dial();
  dial.conference({ endConferenceOnExit: true }, taskSid);

  await client.calls(callSid).update({
    twiml: twiml.toString(),
  });
}

export const handler: HandlerFn = TokenValidator(async function (
  context: MyContext,
  event: MyEvent,
  callback: Callback
) {
  const { callSid, conferenceSid, taskSid } = event;
  const { STREAM_URL, getTwilioClient } = context;

  if (!(callSid && conferenceSid && taskSid)) {
    return createError(Error("Missing parameters"), 400, callback);
  }

  if (!(STREAM_URL && getTwilioClient)) {
    return createError(Error("Internal error"), 500, callback);
  }

  try {
    const twilioClient = getTwilioClient();

    await updateParticipant(twilioClient, conferenceSid, callSid);
    await startCallStream(twilioClient, callSid, taskSid, STREAM_URL);

    return createResponse({ result: true }, callback);
  } catch (err) {
    return createError(Error("Internal error"), 500, callback);
  }
});
