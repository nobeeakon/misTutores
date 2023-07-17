import xss from "xss";

import { getSessionUserId } from "../utils/utils.mjs";

const cleanAllHtmlConfig = {
  whiteList: {}, // empty, means filter out all tags
  stripIgnoreTag: true, // filter out all HTML not in the whitelist
  stripIgnoreTagBody: ["script"], // the script tag is a special case, we need
  // to filter out its content
}

export async function sanitizeBody(req) {
  let text = JSON.stringify(req.body);
  let sanitizedBody = xss(text, cleanAllHtmlConfig);
  req.body = JSON.parse(sanitizedBody);
}


export async function sanitizeQuery(req) {
  let text = JSON.stringify(req.query);
  let sanitizedQuery = xss(text, cleanAllHtmlConfig);
  req.query = JSON.parse(sanitizedQuery);
}

export async function setSessionId(req) {
  const sessionUserId = getSessionUserId(req.session);

  return {...req, 
    session: {
      ...req.session,
      userId: sessionUserId,
    }
  }
}