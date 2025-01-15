import { useState } from "react";

interface Participant {
  id: string;
  name?: string;
}

export const useParticipantHandler = (
  onParticipantJoined: (participant: Participant) => void,
  onParticipantLeft: (participant: { id: string }) => void
) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  const handleParticipantJoined = (event: any) => {
    console.log("Participant joined:", event);
    const newParticipant = {
      id: event.participant.user_id,
      name: event.participant.user_name,
    };
    setParticipants(prev => [...prev, newParticipant]);
    onParticipantJoined(newParticipant);
  };

  const handleParticipantLeft = (event: any) => {
    console.log("Participant left:", event);
    setParticipants(prev => prev.filter(p => p.id !== event.participant.user_id));
    onParticipantLeft({ id: event.participant.user_id });
  };

  return {
    participants,
    handleParticipantJoined,
    handleParticipantLeft
  };
};