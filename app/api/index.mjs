import {
  incrementViewsCounters,
  viewCountersPageNames,
} from "../models/counters.mjs";
import { setSessionId } from "../middleware/sanitize.mjs";

export const get = [setSessionId, getAction];

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function getAction(req) {
  const { session } = req;

  // incrementViewsCounters
  await incrementViewsCounters(viewCountersPageNames.home);

  return {
    session,
    json: {}
  };
}
