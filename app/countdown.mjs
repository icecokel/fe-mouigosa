export const remainingSeconds = (deadline, now) => Math.max(0, Math.ceil((deadline - now) / 1000));

export const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
