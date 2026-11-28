// One creator turn at a time per agent, the way a CLI behaves: a message
// sent while a turn is thinking waits in line and runs right after it (two
// turns at once would race on the draft and the session). `stop(id)` is Esc:
// it cancels the running turn and every waiting one.

import { Stopped } from "./errors.mjs";

export function createTurnLanes() {
  const lanes = new Map(); // id → { tail, turns: Set<AbortController> }

  const laneOf = (id) => {
    if (!lanes.has(id)) lanes.set(id, { tail: Promise.resolve(), turns: new Set() });
    return lanes.get(id);
  };

  return {
    // Runs `work(signal)` once every earlier turn of `id` is over. `onQueued()`
    // fires at once when it has to wait. `signal` (the caller closing the
    // request) cancels this turn alone. Any failure of a stopped turn is Stopped.
    async run(id, work, { signal, onQueued = () => {} } = {}) {
      const lane = laneOf(id);
      const controller = new AbortController();
      const cancel = () => controller.abort();
      signal?.addEventListener("abort", cancel, { once: true });
      if (signal?.aborted) cancel();
      if (lane.turns.size) onQueued();
      lane.turns.add(controller);
      const turn = lane.tail.then(() => {
        controller.signal.throwIfAborted();
        return work(controller.signal);
      });
      lane.tail = turn.catch(() => {});
      try {
        return await turn;
      } catch (error) {
        throw controller.signal.aborted && !(error instanceof Stopped) ? new Stopped(error) : error;
      } finally {
        signal?.removeEventListener("abort", cancel);
        lane.turns.delete(controller);
        if (!lane.turns.size) lanes.delete(id);
      }
    },

    // → how many turns it stopped (0 when the agent was idle).
    stop(id) {
      const turns = [...(lanes.get(id)?.turns ?? [])];
      for (const controller of turns) controller.abort();
      return turns.length;
    },
  };
}
