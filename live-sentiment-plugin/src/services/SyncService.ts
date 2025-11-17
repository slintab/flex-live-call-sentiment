import * as Flex from "@twilio/flex-ui";
import { SyncClient } from "twilio-sync";
import axios from "axios";

const FUNCTIONS_URL = process.env.FLEX_APP_FUNCTIONS_URL;
const SYNC_TOKEN_IDENTITY = process.env.FLEX_APP_SYNC_TOKEN_IDENTITY;

class SyncService {
  url: string | undefined;
  identity: string | undefined;
  manager: Flex.Manager;
  client: SyncClient | null;

  constructor() {
    this.url = FUNCTIONS_URL;
    this.identity = SYNC_TOKEN_IDENTITY;
    this.manager = Flex.Manager.getInstance();
    this.client = null;
  }

  async getToken() {
    const url = `${this.url}/token?identity=${this.identity}`;

    try {
      const response = await axios.get(url);
      return response.data.token;
    } catch (e) {
      console.log(`Error making request: ${e}} `);
    }

    return false;
  }

  async getSyncClient() {
    const token = await this.getToken();

    if (token) {
      this.client = new SyncClient(token);
    }
  }

  async getStream(name: string) {
    if (this.client === null) {
      await this.getSyncClient();
    }

    if (!this.client) {
      return false;
    }

    return this.client.stream({
      id: name,
      mode: "open_or_create",
      ttl: 3600,
    });
  }
}

export default new SyncService();
