import { v4 as uuidv4 } from "uuid";
import { states } from "../../data/states.mjs";
import {
  sanitizeTextSpaces,
  normalizeString,
  sessionStripPostMessages,
} from "../../utils/utils.mjs";
import {
  sanitizeQuery,
  sanitizeBody,
  setSessionId,
} from "../../middleware/sanitize.mjs";
import {
  getAllUniversities,
  getUniversity,
  upsertUniversity,
} from "../../models/universities.mjs";
import {
  incrementViewsCounters,
  viewCountersPageNames,
} from "../../models/counters.mjs";

export const get = [sanitizeQuery, setSessionId, getInstitutions];

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function getInstitutions(req) {
  const { universityId } = req.query;

  const { success, error, session } = sessionStripPostMessages(req.session);

  const universityInfo = await getUniversity(universityId);

  const universitiesData = await getAllUniversities();
  const cleanUniversitiesData = universitiesData.map(
    ({ key, name, abbreviation }) => ({ key, name, abbreviation })
  );

  await incrementViewsCounters(viewCountersPageNames.addInstitution);

  return {
    session,
    json: {
      universityId: universityInfo?.key ?? "",
      universityName: universityInfo?.name ?? "",
      universityAbbreviation: universityInfo?.abbreviation ?? "",
      states,
      universities: cleanUniversitiesData,
      success,
      error,
    },
  };
}

export const post = [sanitizeBody, postNewInstitution];

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function postNewInstitution(req) {
  const location = "institution";

  try {
    await addNewInstitution(req);

    return {
      session: {
        ...req.session,
        success: "Institución creada",
      },
      location,
    };
  } catch (error) {
    console.error("error", error);

    return {
      session: {
        ...req.session,
        error: "Tuvimos un problema al crear la institución",
      },
      location,
    };
  }
}

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function addNewInstitution(req) {
  const { body } = req;

  const universityId = sanitizeTextSpaces(body["university-id"] ?? "");
  const universityName = sanitizeTextSpaces(body["university-name"] ?? "");
  const universityAbbreviation = sanitizeTextSpaces(
    body["university-abbreviation"] ?? ""
  );
  const facultyName = sanitizeTextSpaces(body["faculty-name"] ?? "");
  const facultyAbbreviation = sanitizeTextSpaces(body["faculty-abbreviation"] ?? "");
  const geographicStateId = sanitizeTextSpaces(body["faculty-geographic-state"] ?? "");

  if (
    !universityName.length ||
    !facultyName.length ||
    !(geographicStateId in states)
  ) {
    return Promise.reject(
      new Error("Add new institution: missing information")
    );
  }

  const universityInfo = await getUniversity(universityId);

  const facultyExist = !!universityInfo?.faculties?.find(
    (facultyItem) =>
      normalizeString(facultyItem.name).toLowerCase() === normalizeString(facultyName).toLowerCase() && facultyItem.stateId === geographicStateId
  );

  const facultyUuid = uuidv4();
  const newFaculty = {
    name: facultyName,
    abbreviation: facultyAbbreviation,
    stateId: geographicStateId,
    key: facultyUuid,
  };
  const newFaculties = [...(universityInfo?.faculties ?? []), newFaculty];

  if (universityInfo && facultyExist) return;
  if (universityInfo && !facultyExist) {
    await upsertUniversity({ ...universityInfo, faculties: newFaculties });
  } else if (!universityInfo) {
    const universityId = uuidv4();
    const newUniv = {
      key: universityId,
      name: universityName,
      abbreviation: universityAbbreviation,
      faculties: newFaculties,
    };

    await upsertUniversity(newUniv);
  }
}
