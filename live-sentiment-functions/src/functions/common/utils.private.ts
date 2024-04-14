import { ServerlessCallback } from "@twilio-labs/serverless-runtime-types/types";

export function createError(
  e: Error,
  code: number,
  callback: ServerlessCallback
) {
  console.error("Exception: ", typeof e, e);

  const response = new Twilio.Response();

  response.setStatusCode(code);
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");
  response.setBody({ error: typeof e === "string" ? e : e.message });

  callback(null, response);
}

export function createResponse(obj: object, callback: ServerlessCallback) {
  const response = new Twilio.Response();

  response.setStatusCode(200);
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");
  response.setBody(typeof obj === "string" ? { obj } : obj);

  callback(null, response);
}
