import data from "@begin/data";
import { tables } from "./constants.mjs";


/**
 * @returns {import('../models/types').TutorType[]}
 */
export const getAllTutors = async () => {
  const paginatedQuery = await data.page({
    table: tables.tutors,
    limit: 100,
  });

  const tutorsData = [];

  for await (const page of paginatedQuery) {
    page.forEach(({ table: _table, ...universityItem }) => {
      tutorsData.push(universityItem);
    });
  }

  tutorsData.sort((a, b) => a.name.localeCompare(b.name, "es"));

  return tutorsData;
};

/**
 * @param {string} tutorId
 * @returns {import('../models/types').TutorType|undefined}
 */
export const getTutor = async (tutorId) => {
  if (!tutorId) return null;

  const tutorData = await data.get({
    table: tables.tutors,
    key: tutorId,
  });

  if (!tutorData) return;

  const {table: _table, ...tutorInfo} = tutorData;

  return tutorInfo;
};

export const upsertTutor = async (tutor) => {
  return data.set({ table: tables.tutors, ...tutor });
};
