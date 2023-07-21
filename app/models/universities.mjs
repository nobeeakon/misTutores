import data from "@begin/data";
import { tables } from "./constants.mjs";


/**
 * @param {string[]} universitiesIds 
 * @returns {PromiseLike<Array.<import('../models/types').UniversityType>>}
 */
export const getAllUniversities = async () => {
  const paginatedQuery = await data.page({
    table: tables.universities,
    limit: 100,
  });

  const universitiesData = [];

  for await (const page of paginatedQuery) {
    page.forEach(({table: _table, ...universityItem }) => {
      const faculties = [...universityItem.faculties]

      faculties.sort((a,b) => a.name.localeCompare(b.name, "es"))
      universitiesData.push({...universityItem, faculties});
    });
  }


  universitiesData.sort((a, b) => a.name.localeCompare(b.name, "es"));

  return universitiesData;
};

/**
 * @param {string[]} universitiesIds 
 * @returns {PromiseLike<Array.<import('../models/types').UniversityType>>}
 */
export const getUniversities = async (universitiesIds) => {
  if ( !universitiesIds.length ) return [];

  const universitiesToQuery = universitiesIds.map( universityId => ({table: tables.universities, key: universityId}))
  
  const universities = await data.get(universitiesToQuery);

  const universitiesData = universities.filter(Boolean).map(({ table: _table, ...universityItem }) => universityItem
    ).sort((a, b) => a.name.localeCompare(b.name, "es"));

  return universitiesData;
};

/**
 * @param {string} universityId
 * @returns {PromiseLike<import('../models/types').UniversityType | undefined>}
 */
export const getUniversity = async (universityId) => {
  if (!universityId) return null;

  const universityData = await data.get({
    table: tables.universities,
    key: universityId,
  });

  if (!universityData) return;

  const {table: _table, ...universityInfo} = universityData;

  return universityInfo;
};




/**
 * @param {import('../models/types').UniversityType} university 
 */
export const upsertUniversity = async (university) => {
  return data.set({ table: tables.universities, ...university });
};
