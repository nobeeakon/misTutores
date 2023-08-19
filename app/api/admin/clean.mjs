import {validateAuthorize, validateAuthorizedMiddleWare} from './index.mjs';
import {
    sanitizeBody,
  } from "../../middleware/sanitize.mjs";
import { deleteFaculty } from '../../models/universities.mjs';
import { getAllTutors } from '../../models/tutors.mjs';
import {
    sanitizeTextSpaces,
  } from "../../utils/utils.mjs";

export const get = [validateAuthorizedMiddleWare, dummyGet];

/** @type {import('@enhance/types').EnhanceApiFn} */
async function dummyGet() {
    return {json: {}}
}

export const post = [sanitizeBody,   clean];

const postActions = {
    deleteFaculty: "deleteFaculty",
  };

/** @type {import('@enhance/types').EnhanceApiFn} */
async function clean(req) {
    const { body } = req;
    const isAuthorized = validateAuthorize(req);
  
    if (!isAuthorized) {
      return { status: 401 };
    }
  
    const postAction = body.action;
    try {
      switch (postAction) {
        case postActions.deleteFaculty: {
          await deleteFacultyApi(req);
  
          return {
            json: {
              success: true,
            },
          };
        }
        default:
          throw new Error(`Invalid action: ${postAction}`);
      }
    } catch (error) {
      console.error("clean Error: ", error);
  
      return {
        json: {
          error: "Tuvimos un problema al ejecutar la acción",
        },
        status: 400,
      };
    }
  }

/** @type {import('@enhance/types').EnhanceApiFn} */
async function deleteFacultyApi(req){
  const { body } = req;

    const universityId = sanitizeTextSpaces(body["university-id"] ?? "");
    const facultyId = sanitizeTextSpaces(body["faculty-id"] ?? "");

    if (!universityId || !facultyId) {
            return Promise.reject(
              new Error(`deleteFaculty: missing information. universityId ${!!universityId}, facultyId ${!!facultyId}`)
            );
    }


    const tutorsData = await getAllTutors();

    const facultyHasTutors = tutorsData.filter( tutorItem => {
       const worksIn =  tutorItem.worksIn
        .filter(institutionItem => institutionItem.universityId === universityId && institutionItem.facultyId === facultyId);
        
        return worksIn.length;
    })

    // prevent from loosing information
    // TODO treat this case: 1) force delete and this should also remove all tutors
    if (facultyHasTutors.length) {
        return Promise.reject(new Error(`Invalid action, the faculty has tutors`))
    }


    return deleteFaculty(universityId, facultyId);
}