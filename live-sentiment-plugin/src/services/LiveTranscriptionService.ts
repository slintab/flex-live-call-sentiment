import * as Flex from "@twilio/flex-ui";
import axios from "axios";

const FUNCTIONS_URL = process.env.FLEX_APP_FUNCTIONS_URL;

class LiveTranscriptionService {
  url: string | undefined;
  manager: Flex.Manager;

  constructor() {
    this.url = FUNCTIONS_URL;
    this.manager = Flex.Manager.getInstance();
  }

  async startTranscription(
    callSid: string,
    conferenceSid: string,
    taskSid: string
  ) {
    const url = this.url + "/start";
    const payload = {
      callSid,
      conferenceSid,
      taskSid,
      Token: this.manager.store.getState().flex.session.ssoTokenPayload.token,
    };

    try {
      return await axios.post(url, payload);
    } catch (e) {
      console.log(`Error making request: ${e}} `);
    }
    return false;
  }
}

export default new LiveTranscriptionService();
