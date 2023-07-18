import { getUniversities } from "../models/universities.mjs";
import { getTutor, upsertTutor } from "../models/tutors.mjs";
import {
  getPersonName,
  getLikertScaleArray,
  sessionStripPostMessages,
} from "../utils/utils.mjs";
import {
  sanitizeQuery,
  sanitizeBody,
  setSessionId,
} from "../middleware/sanitize.mjs";
import { sanitizeTextSpaces, stringToInt, validateUserId } from "../utils/utils.mjs";
import {
  questionTypes,
  reviewQuestions,
  questionsToDisplay,
} from "../data/reviewQuestions.mjs";
import { v4 as uuidv4 } from "uuid";
import { incrementViewsCounters, viewCountersPageNames } from "../models/counters.mjs";

export const get = [sanitizeQuery, setSessionId, getTutorById];

/** @type {import('@enhance/types').EnhanceApiFn} */
async function getTutorById(req) {
  const { tutorId } = req.pathParameters;
  const { userId } = req.session;

  const { error, session } = sessionStripPostMessages(req.session);

  const tutorInfo = await getTutor(tutorId);

  if (!tutorInfo) {
    return {
      location: "/404",
    };
  }

  const universitiesToQuerySet = new Set(
    (tutorInfo.worksIn ?? []).map((facultyItem) => facultyItem.universityId)
  );
  const universitiesData = await getUniversities([...universitiesToQuerySet]);

  const userHasAlreadyReviewed = !!tutorInfo.reviews.find(
    (reviewItem) => reviewItem.userId === userId
  );

  const institutions = (tutorInfo.worksIn ?? [])
    .map((targetIds) => {
      const targetUniversity = universitiesData.find(
        (universityItem) => universityItem.key === targetIds.universityId
      );
      const targetFaculty = targetUniversity?.faculties?.find(
        (facultyItem) => facultyItem?.key === targetIds.facultyId
      );

      if (targetUniversity && targetFaculty) {
        return {
          universityId: targetUniversity.key,
          universityName: targetUniversity.name,
          universityAbbreviation: targetUniversity.abbreviation,
          facultyId: targetFaculty.key,
          facultyName: targetFaculty.name,
          facultyAbbreviation: targetFaculty.abbreviation,
          stateAbbreviation: targetFaculty.stateId,
        };
      }

      return null;
    })
    .filter(Boolean);

  const reviews = tutorInfo.reviews ?? [];

    const selectOptionQuestions = questionsToDisplay
    .filter(
      (questionId) => reviewQuestions[questionId].type === questionTypes.selectOption
    ).map((questionId) => {
      const questionItem = reviewQuestions[questionId];
     
      const questionText = questionItem.label;
      const questionOptions = questionItem.options;

      const answersMap = new Map(questionOptions.map(optionItem => [optionItem.value, 0]));
      
      reviews.forEach(reviewItem => {
        const reviewAnswer = reviewItem?.[questionId];

        
        const oldValue = answersMap.get(reviewAnswer);
        if (oldValue != null) {
          answersMap.set(reviewAnswer, oldValue + 1);
        }
      })



  const optionsFrequency = questionOptions.map(({label, value: id}) => ({
    label, 
    frequency: answersMap.get(id)??0
  }))      

    return {questionText, answers: optionsFrequency}

    })


  const likertQuestions = questionsToDisplay
    .filter(
      (questionId) => reviewQuestions[questionId].type === questionTypes.likert
    )
    .map((questionId) => {
      const questionText = reviewQuestions[questionId].label;
      const { scaleSize, maxMinOptions } = reviewQuestions[questionId];

      const likertAnswers = getLikertScaleArray(scaleSize).reduce(
        (acc, likertIndex) => ({ ...acc, [likertIndex]: 0 }),
        {}
      );

      reviews.forEach((reviewItem) => {
        const reviewAnswer = reviewItem?.[questionId];



        const oldValue = likertAnswers[reviewAnswer];
        if (reviewAnswer != null) {
          likertAnswers[reviewAnswer] = oldValue + 1;
        }
      });

      return {
        questionText,
        scaleSize,
        minTitle: maxMinOptions.min,
        maxTitle: maxMinOptions.max,
        ...likertAnswers,
      };
    });

  const generalComments = reviews
    .map((reviewItem) => {
      const comment = reviewItem?.[reviewQuestions.generalComment.id] ?? "";
      const { createdAt } = reviewItem;

      if (!comment) return null;

      const { favor, against, flagged } = reviewItem.votes;

      return {
        comment,
        createdAt,
        favor: favor?.length ?? 0,
        against: against?.length ?? 0,
        flagged: flagged?.length ?? 0,
        reviewId: reviewItem.key,
      };
    })
    .filter(Boolean);


    // increment counter
    await incrementViewsCounters(viewCountersPageNames.tutorInfo)

  return {
    session,
    json: {
      userId,
      userHasAlreadyReviewed,
      error,
      tutorData: {
        key: tutorInfo.key,
        name: getPersonName(
          tutorInfo.name,
          tutorInfo.surname1,
          tutorInfo.surname2
        ),
        institutions,
      },
      reviews: {
        likertQuestions,
        selectOptionQuestions,
        generalComments,
        amountOfReviews: reviews.length,
      },
    },
  };
}

export const post = [sanitizeBody, postNewReview];

/**
 * Validates that the value is between the max and min, min being > 0
 * @param {string} valueString
 * @param {number} maxValue
 * @returns {number|null}
 */
const sanitizeLikertScale = (valueString, maxValue) => {
  const valueNumber = stringToInt(valueString);
  return valueNumber > 0 && valueNumber <= maxValue ? valueNumber : null;
};

/** @type {import('@enhance/types').EnhanceApiFn} */
async function postNewReview(req) {
  const { tutorId } = req.pathParameters;
  const currentLocation = `/${tutorId}`;
  const { userId } = req.session;

  if (!userId) {
    return {
      session: {
        ...req.session,
        error: "Tuvimos un problema al crear una reseña",
      },
      location: currentLocation,
    };
  }

  try {
    await addNewReview(req);
    return {
      location: currentLocation,
    };
  } catch (error) {
    console.error("PostNewReview: ", error);

    return {
      session: {
        ...req.session,
        error: "Tuvimos un problema al crear una reseña",
      },
      location: currentLocation,
    };
  }
}

/** @type {import('@enhance/types').EnhanceApiFn} */
async function addNewReview(req) {
  const { body } = req;
  const { userId } = req.session;

  const currentLocation = `/${userId}`;

  const answersMap = new Map(
    questionsToDisplay.map((questionItem) => [
      questionItem,
      sanitizeTextSpaces(body[questionItem] ?? ""),
    ])
  );

  const tutorId = body["tutor-id"];
  const tutorInfo = await getTutor(tutorId);

  const userHasAlreadyReviewed = !!tutorInfo.reviews.find(
    (reviewItem) => reviewItem.userUuid === userId
  );

  // prevent a user from creating multiple reviews for the same tutor
  if (userHasAlreadyReviewed) {
    return {
      location: currentLocation,
    };
  }

  const meetings = reviewQuestions.meetings.options.find(
    (optionItem) =>
      optionItem.value === answersMap.get(reviewQuestions.meetings.id)
  )
    ? answersMap.get(reviewQuestions.meetings.id)
    : null;
  const researchEquipment = sanitizeLikertScale(
    answersMap.get(reviewQuestions.researchEquipment.id),
    reviewQuestions.researchEquipment.scaleSize
  );
  const labEnvironment = sanitizeLikertScale(
    answersMap.get(reviewQuestions.labEnvironment.id),
    reviewQuestions.labEnvironment.scaleSize
  );
  const tutorUpdated = sanitizeLikertScale(
    answersMap.get(reviewQuestions.tutorUpdated.id),
    reviewQuestions.tutorUpdated.scaleSize
  );
  const openToCollaborate = sanitizeLikertScale(
    answersMap.get(reviewQuestions.openToCollaborate.id),
    reviewQuestions.openToCollaborate.scaleSize
  );
  const respectToAlumni = sanitizeLikertScale(
    answersMap.get(reviewQuestions.respectToAlumni.id),
    reviewQuestions.respectToAlumni.scaleSize
  );
  const attentionToAlumni = sanitizeLikertScale(
    answersMap.get(reviewQuestions.attentionToAlumni.id),
    reviewQuestions.attentionToAlumni.scaleSize
  );
  const productivity = sanitizeLikertScale(
    answersMap.get(reviewQuestions.productivity.id),
    reviewQuestions.productivity.scaleSize
  );
  const projectTimeline = sanitizeLikertScale(
    answersMap.get(reviewQuestions.projectTimeline.id),
    reviewQuestions.projectTimeline.scaleSize
  );
  const generalComment = answersMap
    .get(reviewQuestions.generalComment.id)
    .trim()
    .slice(0, reviewQuestions.generalComment.maxLength);

  // Check that all required values are set
  if (
    !validateUserId(userId) ||
    !tutorInfo ||
    !meetings ||
    !researchEquipment ||
    !labEnvironment ||
    !tutorUpdated ||
    !openToCollaborate ||
    !respectToAlumni ||
    !attentionToAlumni ||
    !productivity ||
    !projectTimeline
  ) {
    return Promise.reject(
      new Error(`Add review (${tutorId}): missing information`)
    );
  }

  const createdAt = new Date().toISOString();
  const reviewId = uuidv4();

  const reviewData = {
    userId: userId,
    key: reviewId,
    [reviewQuestions.meetings.id]: meetings,
    [reviewQuestions.researchEquipment.id]: researchEquipment,
    [reviewQuestions.labEnvironment.id]: labEnvironment,
    [reviewQuestions.tutorUpdated.id]: tutorUpdated,
    [reviewQuestions.openToCollaborate.id]: openToCollaborate,
    [reviewQuestions.respectToAlumni.id]: respectToAlumni,
    [reviewQuestions.attentionToAlumni.id]: attentionToAlumni,
    [reviewQuestions.productivity.id]: productivity,
    [reviewQuestions.projectTimeline.id]: projectTimeline,
    [reviewQuestions.generalComment.id]: generalComment,
    createdAt,
    votes: {
      favor: [],
      against: [],
      flagged: [],
    },
  };

  const newTutorInfo = { ...tutorInfo };
  const newReviews = [...(newTutorInfo.reviews ?? []), reviewData];
  newTutorInfo.reviews = newReviews;


  return upsertTutor(newTutorInfo);
}

export const patch = [sanitizeBody, patchTutorInfo];

export const TUTOR_REVIEW_PATCH_ACTIONS = {
  reviewFavor: "review-favor",
  reviewAgainst: "review-against",
  reviewFlagg: "review-flagg",
};

/** @type {import('@enhance/types').EnhanceApiFn} */
async function patchTutorInfo(req) {
  const { body } = req;


  const { tutorId, userId, action, reviewId } = body;

  const tutorInfo = await getTutor(tutorId);


  const targetReview = tutorInfo.reviews.find(
    (reviewItem) => reviewItem.key === reviewId
    );

  if (!tutorInfo || !action || !reviewId || !targetReview) {
    return Promise.reject(new Error(`patchTutorInfo: missing info: ${JSON.stringify({tutorInfo, action, reviewId, targetReview: !!targetReview})}`));
  }

    const newTutor = { ...tutorInfo };
  const newReview = { ...targetReview };

  const votes = { against: 0, favor: 0, flagged: 0 };


  switch (action) {
    case TUTOR_REVIEW_PATCH_ACTIONS.reviewFavor:
      {
        const againstSet = new Set(
          newReview.votes.against.filter((voterId) => voterId !== userId)
        );

        const favorSet = new Set(newReview.votes.favor);
        if (favorSet.has(userId)){
          favorSet.delete(userId)
        } else {
          favorSet.add(userId)
        }

        newReview.votes = {
          ...newReview.votes,
          against: [...againstSet],
          favor: [...favorSet],
        };

        newTutor.reviews = newTutor.reviews.map((reviewItem) =>
          reviewItem.key === reviewId ? newReview : reviewItem
        );
      }
      break;
    case TUTOR_REVIEW_PATCH_ACTIONS.reviewAgainst:
      {

        const favorSet = new Set(
          newReview.votes.favor.filter((voterId) => voterId !== userId)
        );

        const againstSet = new Set(newReview.votes.against);
        if (againstSet.has(userId)){
          againstSet.delete(userId)
        } else {
          againstSet.add(userId)
        }


        newReview.votes = {
          ...newReview.votes,
          against: [...againstSet],
          favor: [...favorSet],
        };

        newTutor.reviews = newTutor.reviews.map((reviewItem) =>
          reviewItem.key === reviewId ? newReview : reviewItem
        );
      }
      break;
      case TUTOR_REVIEW_PATCH_ACTIONS.reviewFlagg:
        {
  
          const flaggedSet = new Set(newReview.votes.flagged);
          if (flaggedSet.has(userId)){
            flaggedSet.delete(userId)
            
          } else {
            flaggedSet.add(userId)
          }
  
  
          newReview.votes = {
            ...newReview.votes,
            flagged: [...flaggedSet],
          };
  
          newTutor.reviews = newTutor.reviews.map((reviewItem) =>
            reviewItem.key === reviewId ? newReview : reviewItem
          );
        }
        break;
    default:
      return Promise.reject(
        new Error(`patchTutorInfo: Missing or invalid action ${action}`)
      );
  }


  await upsertTutor(newTutor);

  votes.against = newReview.votes.against.length;
  votes.favor = newReview.votes.favor.length;
  votes.flagged = newReview.votes.flagged.length;

  return votes;
}
