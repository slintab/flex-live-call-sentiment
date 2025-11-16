import { Actions, ITask, IWorker } from "@twilio/flex-ui";
import { Call } from "@twilio/flex-ui/src/task_channels";
import { EventEmitter } from "events";
import LiveTranscriptionService from "../services/LiveTranscriptionService";

//import SuggestionService from "../services/SuggestionService";

interface Reservation extends EventEmitter {
  task: ITask;
  on(event: "accepted", listener: (reservation: Reservation) => void): this;
}

export default (reservation: Reservation) => {
  reservation.on("accepted", async (reservation) => {
    const { taskChannelUniqueName, attributes, sid } = reservation.task;

    if (taskChannelUniqueName !== "voice") {
      return;
    }
    const customerCallSid = attributes.conference?.participants?.customer;

    if (!customerCallSid) {
      return;
    }
    const result = await LiveTranscriptionService.startTranscription(
      customerCallSid,
      sid
    );

    if (!result) {
      console.error(
        `Error starting live transcription for callSid: ${customerCallSid}.`
      );
      return;
    }
    console.log(`Live transription started for callSid ${customerCallSid}.`);
  });
};
