import { styled } from "@twilio/flex-ui";
import { Sentiment } from "./TaskCardWrapper";

interface TaskCardOuterContainerProps {
  currentSentiment?: Sentiment;
}

const getBorderColor = (sentiment?: Sentiment) => {
  if (sentiment === "mixed") {
    return "#F2BE5A";
  }

  if (sentiment === "neutral" || sentiment === "positive") {
    return "#6ADDB2";
  }

  if (sentiment === "negative") {
    return "#F22F46";
  }

  return "transparent";
};

export const TaskCardOuterContainer = styled(
  "div"
)<TaskCardOuterContainerProps>`
  border-right-width: 5px;
  border-radius: 6px;
  border-right-style: solid;
  border-right-color: ${(props) => getBorderColor(props.currentSentiment)};
  overflow: hidden;
`;

export const TaskCardInnerContainer = styled("div")`
  margin: -8px -16px -8px 0;
`;
