import {
  sanitizeTextSpaces,
  sessionStripPostMessages,
  getNormalizedStringRegexp,
  normalizeString,
} from "../../utils/utils.mjs";
import {
  sanitizeQuery,
  sanitizeBody,
  setSessionId,
} from "../../middleware/sanitize.mjs";
import {
  getAllUniversities,
  getUniversity,
} from "../../models/universities.mjs";
import {
  getAllTutors,
  getNewTutor,
  upsertTutor,
} from "../../models/tutors.mjs";
import { validateAuthorizedMiddleWare, validateAuthorize } from "./login.mjs";

export const get = [
  sanitizeQuery,
  setSessionId,
  validateAuthorizedMiddleWare,
  getPageInformation,
];

/** @type {import('@enhance/types').EnhanceApiFn} */
async function getPageInformation(req) {
  const { session } = sessionStripPostMessages(req.session);

  const universitiesData = await getAllUniversities();
  const cleanUniversitiesData = universitiesData.map(
    ({ key, name, abbreviation, faculties }) => ({
      key,
      name,
      abbreviation,
      faculties,
    })
  );

  return {
    session,
    json: {
      universities: cleanUniversitiesData,
    },
  };
}

export const post = [sanitizeBody, postNewTutor];

const postActions = {
  checkExistence: "checkExistence",
  add: "add",
};

/** @type {import('@enhance/types').EnhanceApiFn} */
async function postNewTutor(req) {
  const { body } = req;
  const isAuthorized = validateAuthorize(req);

  if (!isAuthorized) {
    return { status: 401 };
  }

  const postAction = body.action;
  try {
    switch (postAction) {
      case postActions.checkExistence: {
        const tutorInfo = await checkTutorsExistence(req);

        return {
          json: {
            ...tutorInfo,
          },
        };
      }
      case postActions.add: {
        const addedTutors = await addTutors(req);

        return {
          json: {
            ...addedTutors,
          },
        };
      }
      default:
        throw new Error(`Invalid action: ${postAction}`);
    }
  } catch (error) {
    console.error("addNewTutor Error: ", error);

    return {
      json: {
        error: "Tuvimos un problema al agregar al tutor",
      },
      status: 400,
    };
  }
}

/** @type {import('@enhance/types').EnhanceApiFn} */
async function checkTutorsExistence(req) {
  const { body } = req;

  const tutorsToValidate = body["tutors"];

  if (!tutorsToValidate || !Array.isArray(tutorsToValidate)) {
    return Promise.reject(new Error("Add new tutor: Missing information"));
  }

  const sanitizedTutors = tutorsToValidate
    .filter((tutorItem) => typeof tutorItem === "object")
    .map(({ name, surname1, surname2 }) => {
      const sanitizedName = sanitizeTextSpaces(name ?? "");
      const sanitizedSurname1 = sanitizeTextSpaces(surname1 ?? "");
      const sanitizedSurname2 = sanitizeTextSpaces(surname2 ?? "");

      if (!sanitizedName || !sanitizedSurname1) return null;

      return {
        name: sanitizedName,
        surname1: sanitizedSurname1,
        surname2: sanitizedSurname2,
      };
    })
    .filter(Boolean);

  const allTutors = await getAllTutors().then((tutors) => {
    const cleanTutors = tutors.map(({ name, surname1, surname2, key }) => ({
      key,
      name,
      surname1,
      surname2,
    }));
    return cleanTutors;
  });

  const tutorsAndSimilars = sanitizedTutors
    .map((tutorToSeachItem) => {
      const nameToSearchRegexp = getNormalizedStringRegexp(
        tutorToSeachItem.name
      );
      const surname1ToSearchRegexp = getNormalizedStringRegexp(
        tutorToSeachItem.surname1
      );

      const similarTutors = allTutors.filter(
        (tutorItem) =>
          nameToSearchRegexp.test(normalizeString(tutorItem.name)) &&
          surname1ToSearchRegexp.test(normalizeString(tutorItem.surname1))
      );

      return { tutor: tutorToSeachItem, similarTutors };
    })
    .filter(Boolean);

  return { data: tutorsAndSimilars };
}

/** @type {import('@enhance/types').EnhanceApiFn} */
async function addTutors(req) {
  const { body } = req;

  const universityId = body["university-id"];
  const facultyId = body["faculty-id"];
  const tutors = body["tutors"];

  if (!universityId || !facultyId || !tutors || !Array.isArray(tutors)) {
    return Promise.reject(new Error("Add new tutors: Missing information"));
  }

  const universityInfo = await getUniversity(universityId);

  const isValidFaculty = universityInfo?.faculties.some(
    (facultyItem) => facultyItem.key === facultyId
  );

  if (!universityInfo || !isValidFaculty) {
    return Promise.reject(
      new Error("Add new tutors: Invalid university or faculty id")
    );
  }

  const tutorsToAdd = tutors
    .filter((tutorItem) => typeof tutorItem === "object")
    .map(({ name, surname1, surname2 }) => {
      const sanitizedName = sanitizeTextSpaces(name ?? "");
      const sanitizedSurname1 = sanitizeTextSpaces(surname1 ?? "");
      const sanitizedSurname2 = sanitizeTextSpaces(surname2 ?? "");

      if (!sanitizedName || !sanitizedSurname1) return null;

      return getNewTutor({
        name: sanitizedName,
        surname1: sanitizedSurname1,
        surname2: sanitizedSurname2,
        universityId,
        facultyId,
      });
    })
    .filter(Boolean);

  const addedTutors = await Promise.allSettled(
    tutorsToAdd.map((tutorItem) => upsertTutor(tutorItem))
  ).then((results) => {
    const rejected = results
      .filter((resultItem) => resultItem.status === "rejected")
      .map((resultItem) => resultItem.reason);
    const fulfilled = results
      .filter((resultItem) => resultItem.status === "fulfilled")
      .map((resultItem) => resultItem.value)
      .map((tutorItem) => ({
        name: tutorItem.name,
        surname1: tutorItem.surname1,
        surname2: tutorItem.surname2,
        key: tutorItem.key,
      }));

    return { rejected, fulfilled };
  });

  return { data: addedTutors };
}
