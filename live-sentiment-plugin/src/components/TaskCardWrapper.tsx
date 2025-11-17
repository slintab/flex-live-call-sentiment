import { useEffect, useState } from "react";
import * as Flex from "@twilio/flex-ui";

import SyncService from "../services/SyncService";
import {
  TaskCardInnerContainer,
  TaskCardOuterContainer,
} from "./TaskCardWrapper.Styles";

export type Sentiment = "positive" | "negative" | "neutral" | "mixed";

interface SyncStreamMessage {
  message: {
    data: {
      sentiment: Sentiment;
    };
  };
}

const addTaskCardWrapper = (flex: typeof Flex) => {
  flex.Supervisor.TaskCard.Content.addWrapper((Original) => (originalProps) => {
    const [currentSentiment, setCurrentSentiment] = useState<Sentiment>();
    const customerCallSid =
      originalProps.task?.attributes.conference?.participants?.customer;

    useEffect(() => {
      async function subscribeToStream() {
        if (!customerCallSid) {
          console.error("Error fetching customer callSid.");
          return;
        }

        const streamname = "FLEX_LIVE_SENTIMENT_" + customerCallSid;
        const syncStream = await SyncService.getStream(streamname);

        if (!syncStream) {
          console.error("Error fetching stream.");
          return;
        }

        syncStream.on("messagePublished", (event: SyncStreamMessage) => {
          const { sentiment } = event.message.data;
          console.log("Sentiment: ", sentiment);

          if (!sentiment) {
            return;
          }

          setCurrentSentiment(sentiment);
        });
      }

      subscribeToStream();
    }, []);

    return (
      <TaskCardOuterContainer currentSentiment={currentSentiment}>
        <TaskCardInnerContainer>
          <Original {...originalProps} />
        </TaskCardInnerContainer>
      </TaskCardOuterContainer>
    );
  });
};

export default addTaskCardWrapper;
