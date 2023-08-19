import {
  getPersonName,
  normalizeString,
  stringToInt,
  getNormalizedStringRegexp,
} from "../utils/utils.mjs";
import { getAllUniversities, getUniversity } from "../models/universities.mjs";
import { getAllTutors } from "../models/tutors.mjs";
import { sanitizeQuery, setSessionId } from "../middleware/sanitize.mjs";
import {
  incrementViewsCounters,
  viewCountersPageNames,
} from "../models/counters.mjs";

export const SEARCH_QUERY_TYPES = {
  tutor: "tutor",
  institutionName: "institutionName",
  tutorsInInstitution: "tutorsInInstitution",
  tutorByName: "tutorByNameAndSurname",
};

const defaultInvalidSearchMessage =
  "Búsqueda inválida, por favor intenta de nuevo";



/**
 * @param {Array.<import ('../models/types').TutorType>} tutors
 * @param {Map<string, string>} institutionMap
 * @param {Map<string, string>} universityAbbreviationsMap
 * @param {boolean} showUniversityAbbreviation to get university abbreviation instead of university name
 * @returns {Array.<{key:string; name:string; reviewCount: number; institutionNames:{universityName:string;facultyName:string;}[]>}
 */
export const prepareTutorsList = (
  tutors,
  institutionMap,
  universityAbbreviationsMap,
  showUniversityAbbreviation = true
) => {
  const tutorsList = tutors.map((tutorItem) => {
    const institutionNames = tutorItem.worksIn
      .map((institutionItem) => {
        const universityName = institutionMap.get(institutionItem.universityId);
        const universityAbbreviation = universityAbbreviationsMap.get(
          institutionItem.universityId
        );
        const facultyName = institutionMap.get(institutionItem.facultyId);

        return universityName && facultyName
          ? {
              universityName:
                showUniversityAbbreviation && universityAbbreviation
                  ? universityAbbreviation
                  : universityName,
              facultyName,
            }
          : null;
      })
      .filter(Boolean);

    return {
      key: tutorItem.key,
      name: getPersonName(
        tutorItem.name,
        tutorItem.surname1,
        tutorItem.surname2
      ),
      reviewsCount: tutorItem.reviews.length,
      institutionNames,
    };
  });

  return tutorsList;
};

const MINIMUM_SEARCH_TEXT_LENGTH = 3;

/**
 * @param {string} searchText
 * @param {string} universityId
 * @param {string} facultyId
 * @returns list of tutors that match the criteria
 */
const getTutors = async (
  searchText = "",
  universityId = "",
  facultyId = ""
) => {
  if (searchText.length < MINIMUM_SEARCH_TEXT_LENGTH) {
    return {
      error: defaultInvalidSearchMessage,
    };
  }

  const tutorsData = await getAllTutors();
  const searchTextRegexp = getNormalizedStringRegexp(searchText);

  // create a Map for the names
  const institutionMap = new Map();
  const universities = await getAllUniversities();
  universities.forEach((universityItem) => {
    institutionMap.set(universityItem.key, universityItem.name);

    universityItem.faculties.forEach((facultyItem) =>
      institutionMap.set(facultyItem.key, facultyItem.name)
    );
  });

  const universityAbbreviationsMap = new Map();
  universities.forEach((universityItem) => {
    const { abbreviation } = universityItem;
    if (abbreviation) {
      universityAbbreviationsMap.set(universityItem.key, abbreviation);
    }
  });

  const filteredTutors = tutorsData
    .filter(({ name, surname1, surname2 }) => {
      return searchText
        ? searchTextRegexp.test(getPersonName(name, surname1, surname2, true))
        : true;
    })
    .filter(({ worksIn }) => {
      if (!universityId) return true;

      return worksIn.some(
        (facultyItem) =>
          facultyItem.universityId === universityId &&
          (!facultyId ? true : facultyItem.facultyId === facultyId)
      );
    });

  const tutorsList = prepareTutorsList(
    filteredTutors,
    institutionMap,
    universityAbbreviationsMap,
    true
  );

  return { data: tutorsList ?? [] };
};

/**
 *
 * @param {string} searchText
 * @returns a list of institutions that match with the searched string
 */
const getInstitutionsByName = async (searchText) => {
  if (searchText.length < MINIMUM_SEARCH_TEXT_LENGTH) {
    return {
      error: defaultInvalidSearchMessage,
    };
  }

  const textRegexp = getNormalizedStringRegexp(searchText);
  const universities = await getAllUniversities();

  const data = universities
    .map(({ key: universityId, name, abbreviation, faculties }) => {
      const isTextInUniversityName =
        textRegexp.test(normalizeString(name)) ||
        abbreviation.toLowerCase() === searchText.toLowerCase();

      const filteredFaculties = faculties.filter((facultyItem) =>
        textRegexp.test(normalizeString(facultyItem.name))
      );

      if (!isTextInUniversityName && filteredFaculties.length === 0)
        return null;

      const facultiesToDisplay =
        filteredFaculties.length > 0 ? filteredFaculties : faculties;

      return facultiesToDisplay.map((facultyItem) => ({
        university: name,
        universityId,
        faculty: facultyItem.name,
        facultyId: facultyItem.key,
        stateAbbreviation: facultyItem.stateId,
      }));
    })
    .filter(Boolean)
    .flat();

  return { data };
};

/**
 * @param {string} universityId
 * @param {string} facultyId
 * @returns a list of institutions that match with the searched string
 */
const getTutorsInInstitution = async (universityId, facultyId) => {
  // early return if nothing to match

  const universityInfo = await getUniversity(universityId ?? "");
  if (!universityInfo) {
    return { error: defaultInvalidSearchMessage };
  }

  const institutionMap = new Map();
  institutionMap.set(universityInfo.key, universityInfo.name);

  universityInfo.faculties.forEach((facultyItem) =>
    institutionMap.set(facultyItem.key, facultyItem.name)
  );

  const universityAbbreviationsMap = new Map();

  if (universityInfo.abbreviation) {
    universityAbbreviationsMap.set(universityInfo.key, universityInfo.abbreviation);
  }

  const tutorsData = await getAllTutors();

  const filteredTutors = tutorsData.filter(({ worksIn }) => {
    return worksIn.some(
      (facultyItem) =>
        facultyItem.universityId === universityId &&
        (!facultyId ? true : facultyItem.facultyId === facultyId)
    );
  });

  const tutorsList = prepareTutorsList(
    filteredTutors,
    institutionMap,
    universityAbbreviationsMap,
    true
  );

  return { data: tutorsList };
};

const SEARCH_PAGE_SIZE = 40;
export const get = [sanitizeQuery, setSessionId, searchInfoWrapper];

/** @type {import('@enhance/types').EnhanceApiFn} */
async function searchInfoWrapper(req) {
  const { session } = req;

  try {
    const searchData = await searchInfo(req);

    return searchData;
  } catch (error) {
    console.error(`Error when searching data: ${error.toString()}`);
    return {
      session,
      json: {
        error: "Algo salió mal, por favor intenta de nuevo",
      },
    };
  }
}

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function searchInfo(req) {
  const { session } = req;
  const {
    type = "",
    text = "",
    universityId = "",
    facultyId = "",
    page = "",
  } = req.query;

  const pageNumber = stringToInt(page);
  const currentPage = pageNumber != null && pageNumber > 0 ? pageNumber : 0;

  if (!type) {
    return { json: {} };
  }

  let queryInfo;

  switch (type) {
    case SEARCH_QUERY_TYPES.tutor: {
      queryInfo = await getTutors(text, universityId, facultyId);
      break;
    }
    case SEARCH_QUERY_TYPES.institutionName: {
      queryInfo = await getInstitutionsByName(text);
      break;
    }
    case SEARCH_QUERY_TYPES.tutorsInInstitution:
      queryInfo = await getTutorsInInstitution(universityId, facultyId);
      break;
    default:
      return {
        session,
        json: {
          error: defaultInvalidSearchMessage,
        },
        status: 400,
      };
  }

  const data = !queryInfo.data
    ? undefined
    : queryInfo.data.slice(
        currentPage * SEARCH_PAGE_SIZE,
        (currentPage + 1) * SEARCH_PAGE_SIZE
      );

  // increment view counter
  await incrementViewsCounters(viewCountersPageNames.search);

  return {
    session,
    json: {
      ...queryInfo,
      data,
      type,
      currentPage,
      pagesLength: Math.ceil((queryInfo?.data?.length ?? 0) / SEARCH_PAGE_SIZE),
    },
  };
}
