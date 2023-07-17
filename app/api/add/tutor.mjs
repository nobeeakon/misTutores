import { v4 as uuidv4 } from "uuid";
import { states } from "../../data/states.mjs";
import { sanitizeText, sessionStripPostMessages } from "../../utils/utils.mjs";
import { sanitizeQuery, sanitizeBody , setSessionId} from "../../middleware/sanitize.mjs";
import {
  getAllUniversities,
  getUniversity,
} from "../../models/universities.mjs";
import { upsertTutor } from "../../models/tutors.mjs";
import {  incrementViewsCounters, viewCountersPageNames } from "../../models/counters.mjs";

export const get = [sanitizeQuery, setSessionId, getTutors];

/** @type {import('@enhance/types').EnhanceApiFn} */
async function getTutors(req) {
  const { universityId, facultyId } = req.query;
  const { success, error, session } = sessionStripPostMessages(req.session);

  const universityInfo = await getUniversity(universityId);

  const universitiesData = await getAllUniversities();
  const cleanUniversitiesData = universitiesData.map(
    ({ key, name, abbreviation, faculties }) => ({
      key,
      name,
      abbreviation,
      faculties,
    })
  );

  const facultyInfo =
    facultyId && universityInfo
      ? universityInfo.faculties.find(
          (facultyItem) => facultyItem.key === facultyId
        )
      : null;

  // increment view counter
  await incrementViewsCounters(viewCountersPageNames.addTutor)


  return {
    session,
    json: {
      universityId: universityInfo?.key ?? "",
      facultyId: facultyInfo?.key ?? "",
      states,
      universities: cleanUniversitiesData,
      success,
      error,
    },
  };
}

export const post = [sanitizeBody, postNewTutor];

/** @type {import('@enhance/types').EnhanceApiFn} */
async function postNewTutor(req) {
  const currentLocation = "tutor";

  try {
    const tutorInfo = await addNewTutor(req);



    return {
      session: {
        ...req.session,
      },
      location: `/${tutorInfo.key}`,
    };
  } catch (error) {
    console.error("addNewTutor Error: ", error);

    return {
      session: {
        ...req.session,
        error: "Tuvimos un problema al agregar al tutor",
      },
      currentLocation,
    };
  }
}

/** @type {import('@enhance/types').EnhanceApiFn} */
async function addNewTutor(req) {
  const { body } = req;

  const universityId = sanitizeText(body["university-id"] ?? "");
  const facultyId = sanitizeText(body["faculty-id"] ?? "");

  const tutorName = sanitizeText(body["tutor-name"] ?? "");
  const tutorSurname1 = sanitizeText(body["tutor-surname1"] ?? "");
  const tutorSurname2 = sanitizeText(body["tutor-surname2"] ?? "");

  if (
    !universityId ||
    !facultyId ||
    !tutorName ||
    !tutorSurname1 ||
    !tutorSurname2
  ) {
    return Promise.reject(new Error("Add new tutor: Missing information"));
  }

  const universityInfo = await getUniversity(universityId ?? "");
  const facultyExist = !universityInfo
    ? false
    : universityInfo.faculties.find(
        (facultyItem) => facultyItem.key === facultyId ?? ""
      );

  if (!universityInfo || !facultyExist) {
    return Promise.reject(
      new Error("Add new tutor: missing university or faculty information")
    );
  }

  const tutorUuid = uuidv4();
  const newTutor = {
    name: tutorName,
    surname1: tutorSurname1,
    surname2: tutorSurname2,
    key: tutorUuid,
    worksIn: [{ universityId, facultyId }],
    reviews: [],
  };

  return upsertTutor(newTutor);
}
