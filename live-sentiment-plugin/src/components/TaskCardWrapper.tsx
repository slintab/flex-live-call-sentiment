import { useEffect, useState } from "react";
import * as Flex from "@twilio/flex-ui";

import SyncService from "../services/SyncService";
import {
  TaskCardInnerContainer,
  TaskCardOuterContainer,
} from "./TaskCardWrapper.Styles";

interface SyncStreamMessage {
  message: {
    data: SentimentResult;
  };
}

export interface SentimentResult {
  score?: number;
  label?: string;
}

const addTaskCardWrapper = (flex: typeof Flex) => {
  flex.Supervisor.TaskCard.Content.addWrapper((Original) => (originalProps) => {
    const initialSentiment = { label: "", score: -1 };
    const [currentSentiment, setCurrentSentiment] =
      useState<Required<SentimentResult>>(initialSentiment);

    useEffect(() => {
      async function subscribeToStream() {
        const streamname = "FLEX_LIVE_SENTIMENT_" + originalProps.task?.taskSid;
        const syncStream = await SyncService.getStream(streamname);

        if (!syncStream) {
          console.error("Error fetching stream.");
          return;
        }

        syncStream.on("messagePublished", (event: SyncStreamMessage) => {
          const { label, score } = event.message.data;
          console.log(score, label);

          if (!(label && score)) {
            return;
          }

          setCurrentSentiment({ label, score });
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
