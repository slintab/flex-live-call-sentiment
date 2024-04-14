import React from "react";
import * as Flex from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import { reservationCreated } from "./listeners";
import addTaskCardWrapper from "./components/TaskCardWrapper";

const PLUGIN_NAME = "LiveSentimentPlugin";

export default class LiveSentimentPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    manager.workerClient?.on("reservationCreated", reservationCreated);

    const isAdminOrSupervisor =
      manager.user.roles.includes("admin") ||
      manager.user.roles.includes("supervisor");

    if (isAdminOrSupervisor) {
      addTaskCardWrapper(flex);
    }
  }
}
