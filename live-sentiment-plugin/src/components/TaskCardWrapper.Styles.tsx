import { styled } from "@twilio/flex-ui";
import { SentimentResult } from "./TaskCardWrapper";

interface TaskCardOuterContainerProps {
  currentSentiment: Required<SentimentResult>;
}

const getBorderColor = ({ score, label }: { score: number; label: string }) => {
  if (0.49 < score && score < 0.7) {
    return "#F2BE5A";
  }

  if (0.7 <= score && label === "POSITIVE") {
    return "#6ADDB2";
  }

  if (0.7 < score && label === "NEGATIVE") {
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
