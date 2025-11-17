import "@twilio-labs/serverless-runtime-types";
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

const { createResponse, createError } = require(Runtime.getFunctions()[
  "common/utils"
].path);

type MyEvent = {
  identity: string;
};

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  API_KEY: string;
  API_SECRET: string;
  SYNC_SERVICE_SID: string;
  SYNC_TOKEN_IDENTITY: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    const {
      ACCOUNT_SID,
      API_KEY,
      API_SECRET,
      SYNC_SERVICE_SID,
      SYNC_TOKEN_IDENTITY,
    } = context;
    const { identity } = event;

    if (!identity || identity !== SYNC_TOKEN_IDENTITY) {
      return createError(Error("Invalid identity."), 401, callback);
    }

    const AccessToken = Twilio.jwt.AccessToken;
    const SyncGrant = AccessToken.SyncGrant;

    try {
      const syncGrant = new SyncGrant({
        serviceSid: SYNC_SERVICE_SID,
      });

      const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET, {
        identity: SYNC_TOKEN_IDENTITY,
      });
      accessToken.addGrant(syncGrant);

      return createResponse({ token: accessToken.toJwt() }, callback);
    } catch (err) {
      console.log(err);
      return createError(Error("Internal error"), 500, callback);
    }
  };
