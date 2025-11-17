import "@twilio-labs/serverless-runtime-types";
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { Twilio } from "twilio";

const { createResponse, createError } = require(Runtime.getFunctions()[
  "common/utils"
].path);

type OperatorResult = {
  result?: {
    label?: string;
  };
};

type OperatorContext = {
  metadata?: {
    conversation_source_id?: string;
  };
};

type MyEvent = {
  intelligence_service_id: string;
  operator_results: OperatorResult[];
  context: OperatorContext[];
};

type MyContext = {
  SYNC_SERVICE_SID: string;
  REALTIME_INTELLIGENCE_SERVICE_SID: string;
};

async function publishSentiment(
  client: Twilio,
  syncServiceSid: string,
  callSid: string,
  sentiment: string
) {
  try {
    await client.sync.v1
      .services(syncServiceSid)
      .syncStreams("FLEX_LIVE_SENTIMENT_" + callSid)
      .streamMessages.create({ data: { sentiment } });
  } catch (error: any) {
    // if stream does not exist yet, create it
    if (error.status === 404 || error.code === 20404) {
      await client.sync.v1.services(syncServiceSid).syncStreams.create({
        ttl: 3600,
        uniqueName: "FLEX_LIVE_SENTIMENT_" + callSid,
      });
      await client.sync.v1
        .services(syncServiceSid)
        .syncStreams("FLEX_LIVE_SENTIMENT_" + callSid)
        .streamMessages.create({ data: { sentiment } });
    }
  }
}

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    const {
      REALTIME_INTELLIGENCE_SERVICE_SID,
      SYNC_SERVICE_SID,
      getTwilioClient,
    } = context;

    const {
      intelligence_service_id: intelligentServiceSid,
      operator_results: operatorResults,
      context: operatorContext,
    } = event;

    if (!(REALTIME_INTELLIGENCE_SERVICE_SID && SYNC_SERVICE_SID)) {
      return createError(Error("Internal error"), 500, callback);
    }

    if (!(intelligentServiceSid && operatorResults && operatorContext)) {
      return createError(Error("Missing parameters"), 400, callback);
    }

    if (intelligentServiceSid !== REALTIME_INTELLIGENCE_SERVICE_SID) {
      return createError(Error("Bad request"), 400, callback);
    }

    try {
      const twilioClient = getTwilioClient() as any as Twilio;
      const callSid = operatorContext[0].metadata?.conversation_source_id;
      const sentiment = operatorResults[0].result?.label;

      if (sentiment && callSid) {
        await publishSentiment(
          twilioClient,
          SYNC_SERVICE_SID,
          callSid,
          sentiment
        );
      }

      return createResponse({ result: true }, callback);
    } catch (err) {
      console.error(err);
      return createError(Error("Internal error"), 500, callback);
    }
  };
