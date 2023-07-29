import { sanitizeBody } from "../../middleware/sanitize.mjs";

export const validateAuthorize = (req) => {
  return req.session?.authorized;
};

export const validateAuthorizedMiddleWare = (req) => {
  const authorized = validateAuthorize(req);

  if (!authorized)
    return {
      location: "/",
    };

  return req;
};

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function get(req) {
  const authorized = req.session?.authorized;

  return {
    json: { authorized },
  };
}

export const post = [sanitizeBody, handleLogActions];

const postActions = {
  login: "login",
  logout: "logout",
};
async function handleLogActions(req) {
  const action = req.body?.action;
  const currentLocation = "/admin"

  try {
    switch (action) {
      case postActions.login: {
        const loginInfo = getlogInSessionObject(req);

        return { ...loginInfo, location: currentLocation };
      }
      case postActions.logout: {
        const logoutInfo = getLogoutSessionObject(req);

        return { ...logoutInfo, location: currentLocation };
      }
      default:
        return {
          location: "/",
        };
    }
  } catch (error) {
    console.error("Failed when trying to login/out", error);

    return {
      status: 500,
    };
  }
}

const getLogoutSessionObject = (req) => {
  const { authorized: _authorized, ...newSession } = req.session;

  return {
    session: newSession,
  };
};

const getlogInSessionObject = (req) => {
  const isAuthorized =
    req.body?.username === process.env.SECRET_USERNAME &&
    req.body?.password === process.env.SECRET_PASSWORD;

  return {
    session: {
      ...req.session,
      authorized: isAuthorized ? true : undefined,
    },
  };
};
