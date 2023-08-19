import { validateAuthorizedMiddleWare } from "./index.mjs";
import { getCounts } from "../../models/counters.mjs";
import { getAllUniversities } from "../../models/universities.mjs";
import { getAllTutors } from "../../models/tutors.mjs";

export const get = [validateAuthorizedMiddleWare, getCountsData];

/** @type {import('@enhance/types').EnhanceApiFn} */
export async function getCountsData() {
  const universities = await getAllUniversities();
  const faculties = universities.map(({ faculties }) => faculties).flat();

  const tutorsInfo = await getAllTutors();
  const reviews = tutorsInfo
    .map(
      ({ key: tutorKey, name: tutorName, surname1: tutorSurname1, reviews }) => {
        if (!reviews.length) {
          return null;
        }

        const mostRecentDateString = reviews.map(reviewItem => reviewItem.createdAt).sort((a,b) => new Date(a) > new Date(b)?-1:0)[0]

  

        return { tutorKey, tutorName: `${tutorName} ${tutorSurname1}`, dateISOString: mostRecentDateString }
      }
    )
    .filter(Boolean);

  // sort by most recent 
  reviews.sort((a,b) =>  new Date(a.dateISOString) > new Date(b.dateISOString)?-1:0)


  const countersData = await getCounts();

  return {
    json: {
      ...countersData,
      data: {
        dataCounts: universities.length,
        faculties: faculties.length,
        tutors: tutorsInfo.length,
        reviews,
      },
    },
  };
}
