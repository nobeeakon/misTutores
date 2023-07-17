import {  normalizeString } from "../utils/utils.mjs";
import { getAllUniversities } from "../models/universities.mjs";
import { getAllTutors } from "../models/tutors.mjs";
import {getSearchTextRegexp, prepareTutorsList} from './search.mjs'

const TUTOR_BY_NAME_MIN_LENGTHS = 2;
/**
 * @param {string} searchName
 * @param {string} searchSurname1
 * @param {string} searchSurname2
 * @returns list of tutors that match the criteria
 */
const getTutorByNameAndSurname = async (
  searchName = "",
  searchSurname1 = "",
  searchSurname2 = "",
) => {
  if (searchName.length < TUTOR_BY_NAME_MIN_LENGTHS || searchSurname1.length < TUTOR_BY_NAME_MIN_LENGTHS) {
    return [];
  }
    
  const tutorsData = await getAllTutors();
  const nameRegexp = getSearchTextRegexp(searchName);
  const surname1Regexp = getSearchTextRegexp(searchSurname1);
  const surname2Regexp = getSearchTextRegexp(searchSurname2);

  // create a Map for the names
  const institutionMap = new Map();
  const universities = await getAllUniversities();
  universities.forEach((universityItem) => {
    institutionMap.set(universityItem.key, universityItem.name);

    universityItem.faculties.forEach((facultyItem) =>
      institutionMap.set(facultyItem.key, facultyItem.name)
    );
  });

  const filteredTutors = tutorsData
    .filter(({ name, surname1, surname2 }) => {
      const hasName = nameRegexp.test(normalizeString(name));
      const hasSurname1 = surname1Regexp.test(normalizeString(surname1));
      const hasSurname2 = searchSurname2?surname2Regexp.test(normalizeString(surname2)):true; // true by default as is optional
     
      return hasName && hasSurname1 && hasSurname2
    })


  const tutorsList = prepareTutorsList(filteredTutors, institutionMap);



  return tutorsList;
};


/** @type {import('@enhance/types').EnhanceApiFn} */
export async function get(req) {
    const {  tutorName = '', tutorSurname1 = '', tutorSurname2 =''
   } = req.query;
  

   try {
    const QUERY_SIZE_LIMIT = 40;
       
       const data = await getTutorByNameAndSurname(tutorName, tutorSurname1, tutorSurname2);
       
       return {
           json: {
               data: data.slice(0, QUERY_SIZE_LIMIT),
            },
        };
    } catch(error) {
        
        console.log('Error in SearchByName', error.toString())

        return {
          json: {
            error: "Búsqueda no válida, por favor intenta de nuevo",
          },
          status: 400,
        };
    }
  
 
  
  
  
  }
  