import LiveTranscriptionService from "../services/LiveTranscriptionService";

export default (reservation: TaskRouter.Reservation) => {
  reservation.on("accepted", async (reservation) => {
    const { taskChannelUniqueName, attributes } = reservation.task;

    if (taskChannelUniqueName !== "voice") {
      return;
    }
    const customerCallSid = attributes.conference?.participants?.customer;

    if (!customerCallSid) {
      return;
    }
    const result = await LiveTranscriptionService.startTranscription(
      customerCallSid
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
