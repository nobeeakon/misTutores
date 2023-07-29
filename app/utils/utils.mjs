import {
  v4 as uuidv4,
  validate as uuidValidate,
  version as uuiVersion,
} from "uuid";


/**
 * Builds a name string
 * @param {string} name
 * @param {string} surname1
 * @param {string} surname2
 * @param {boolean} normalize removes tildes
 * @returns string
 */
export const getPersonName = (name, surname1, surname2, normalize = false) => {
  const completeName = `${name} ${surname1} ${surname2}`;

  if (!normalize) return completeName;

  return normalizeString(completeName);
};

/**
 * Normalizes a string, removes the tildes expect for the ~ as is used in ñ
 * @param {string} text
 * @returns string
 */
export const normalizeString = (text) => {
  // \u0303 is used in ñ
  return text.normalize("NFD").replace(/[\u0300-\u0302]|[\u0304-\u036f]/g, "");
}

/**
 * Converts a string into a number
 * @param {string} numberString
 * @returns {number|null} number if is a valid input
 */
export const stringToInt = (numberString) => {
  const number = parseInt(numberString, 10);

  return isFinite(number) ? number : null;
};

/**
 * removes additional spaces
 * @param {string} text
 */
export const sanitizeTextSpaces = (text) => text.replace(/\s+/g, " ").trim();

/**
 * Creates an array of a certain size
 * @param {number} size
 * @returns {number[]}
 */
export const createArrayOfSize = (size) =>
  Array(size)
    .fill(null)
    .map((_, index) => index);


/**
 * Creates an array of a certain size, starts at 1 and has a defined size
 * @param {number} size
 * @returns {number[]}
 */
export const getLikertScaleArray = (size) =>
 createArrayOfSize(size)
    .map((index) => index+1);    

/**
 * Validates a user Id obtained from the req.session
 * @param {string} sessionUserId
 * @returns {boolean}
 */
export const validateUserId = (sessionUserId) => {
  const isValidUuid = uuidValidate(sessionUserId);
  return isValidUuid && uuiVersion(sessionUserId) === 4;
};

/**
 * Gets a session Id or creates a new one if not obtained
 * @param {Record<string, any>} session
 * @returns {string}
 */
export const getSessionUserId = (session) => {
  const sessionUuid = session.userId ?? "";

  return validateUserId(sessionUuid)? sessionUuid: uuidv4();
};



/**
 * Strip session from error, success
 * @param {	{string: any}} session
 */
export const sessionStripPostMessages = (session) => {
  const { error, success, ...sanitizedSession } = session;

  return {
    error,
    success,
    session: sanitizedSession,
  };
};


/**
 * normalizes the search string and returns a regexp
 * @param {string} searchText
 * @returns regexp
 */
export const getNormalizedStringRegexp = (searchText) =>
  new RegExp(normalizeString(searchText), "i");
