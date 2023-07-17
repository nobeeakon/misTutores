import {
  reviewQuestions,
  questionsToDisplay,
  questionTypes,
} from "../data/reviewQuestions.mjs";
import { getLikertScaleArray } from "../utils/utils.mjs";

const createLikertScale = (questionId) => `
<div class="mbe-2">${reviewQuestions[questionId].label}</div>
<div class="flex colorGrey600" >
${reviewQuestions[questionId].maxMinOptions.min}
<div class="flex justify-content-between  flex-grow" >
${getLikertScaleArray(reviewQuestions[questionId].scaleSize)
  .map(
    (index) =>
      `<div class="mie-2 " >
      <label class=" text-center inline-block pis-3 pie-3">
      <div>
      <input  required name="${reviewQuestions[questionId].id}" type="radio" value="${index}"/>
      </div>
      <div class="text-center ">${index}</div>
      </label></div>`
  )
  .join("")}
  </div>
  ${reviewQuestions[questionId].maxMinOptions.max}
  </div>
  `;

const createSelectOptions = (questionId) => `
  <div>${reviewQuestions[questionId].label}
  <select  name="${reviewQuestions[questionId].id}" class="mis-1" required>
  <option ></option>
  ${reviewQuestions[questionId].options
    .map(
      (optionItem) =>
        `<option value="${optionItem.value}">${optionItem.label}</option>`
    )
    .join("")}
      </select>
      </div>
  `;

const createTextArea = (questionId) => `
<label for="${reviewQuestions[questionId].id}">${reviewQuestions[questionId].label} </label>
          <div>
          <textarea
          class="mbs-1 w100"
          name="${reviewQuestions[questionId].id}" id="${reviewQuestions[questionId].id}" 
          maxLength="${reviewQuestions[questionId].maxLength}"
          ></textarea >
         </div>`;

const getInput = (questionId) => {
  const questionType = reviewQuestions[questionId].type;
  switch (questionType) {
    case questionTypes.selectOption:
      return createSelectOptions(questionId);
    case questionTypes.likert:
      return createLikertScale(questionId);
    case questionTypes.textarea:
      return createTextArea(questionId);
    default:
      throw new Error(
        `Unhandled question type: ${questionType}, in questionId: ${questionId}`
      );
  }
};

/**
 * @param {{questionText: string; answers: Array.<{label: string; frequency: number}>}} param0 
 */
const getSelectOptionsResults = ({questionText, answers}) => {
  const filteredAnswers = answers.filter(answerItem => answerItem.frequency > 0);
  const sortedAnswers = [...filteredAnswers].sort((a,b) => a.frequency - b.frequency);


  return `
    <div>
    <div>${questionText}</div>
    <div class="colorGrey600">
    ${sortedAnswers.length === 0?'Aún no hay respuestas':sortedAnswers.map(answerItem => `${answerItem.label}: ${answerItem.frequency} voto`).join(', ')}.
    </div>
    </div>
  `

}


const getLikertChart = ({
  questionText,
  scaleSize,
  minTitle,
  maxTitle,
  ...answers
}) => {
  const likertAnswers = Object.entries(answers)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  return `     <div ">     <likert-chart
  min="${minTitle}"
  max="${maxTitle}"
  length="${scaleSize}"
  title="${questionText}"
  ${likertAnswers}
></likert-chart></div>`;
};

/** @type {import('@enhance/types').EnhanceElemFn} */
export default function ({ html, state }) {
  const { store } = state;
  const { userId, userHasAlreadyReviewed, tutorData, reviews, error } = store;
  const selectOptionQuestions = reviews?.selectOptionQuestions ?? [];
  const likertQuestions = reviews?.likertQuestions ?? [];
  const generalComments = reviews?.generalComments ?? [];

  if (!tutorData)
    return html`
      <main-layout>
        <div>No encontramos a quien buscabas</div>
      </main-layout>
    `;

  return html`
      <main-layout>

        <h1 class="text-center text2"> ${tutorData.name} </h1>
        <h2 class="text1 mb0">
           Trabaja en: ${
             tutorData.institutions.length === 0
               ? `<span class="colorGrey600">Aún no hay información sobre su lugar de trabajo</span>` // this should not happen
               : tutorData.institutions
                   .map(
                     ({
                       universityId,
                       universityName,
                       universityAbbreviation,
                       facultyId,
                       facultyName,
                     }) =>
                       `<a href='/search?type=tutor&universityId=${universityId}'>${
                         universityAbbreviation || universityName
                       }</a> - <a href='/search?type=tutor&universityId=${universityId}&facultyId=${facultyId}'>${facultyName}</a>`
                   )
                   .join(", ")
           }
        </h2>
        
        ${
          error
            ? `<inline-alert role="alert" type="error" margin="mb1">${error}</inline-alert>`
            : ""
        }


        ${
          userHasAlreadyReviewed
            ? ""
            : `
        <form method='post' >
        ${questionsToDisplay
          .map(
            (questionIdItem) =>
              `<div class="mbs-2">${getInput(questionIdItem)}</div>`
          )
          .join("")}
          <input type="hidden" value="${tutorData.key}" name='tutor-id'/>
          
          <div class="mb2 text-center">
            <button type='submit' class="primaryButton"> Enviar </button>
          </div>
          </form>
          `
        }

        <div class="mbs4">
        <h3 class="text1 mbe1 text-center">Opiniones ${
          reviews.amountOfReviews === 0
            ? ""
            : `(gráficas basadas en ${reviews.amountOfReviews} ${
                reviews.amountOfReviews === 1 ? "opinión" : "opiniones"
              })`
        }</h3>
        
        ${
          reviews.amountOfReviews === 0
            ? `<p class="text-center colorGrey600">Aún no hay opiniones sobre este tutor.</p>`
            : `
            <div class="mbe1">
            ${selectOptionQuestions
              .map((selectOptionQuestion) => getSelectOptionsResults(selectOptionQuestion))
              .join("")}
            </div>
            <div class="likertScales">
        ${likertQuestions
          .map((likertItem) => getLikertChart(likertItem))
          .join("")}
      </div>
      `
        }
      </div>
  
      <div class="mb4">
      <h3 class="text1 mbe1 text-center">Comentarios </h3>

      ${
        generalComments.length === 0
          ? `<p class="text-center colorGrey600">Aún no hay comentarios sobre este tutor.</p>`
          : `${generalComments
              .map(
                (commentItem) => `<div class="mb2"><review-card
                user-id="${userId}"
                tutor-id="${tutorData.key}"
                review-id="${commentItem.reviewId}"
     message="${commentItem.comment}"
     thumbs-up="${commentItem.favor}"
     thumbs-down="${commentItem.against}"
     flagged="${commentItem.flagged}"
     user-id="aaaa"
     date-iso-string="${commentItem.createdAt}"
   ></my-message></div>`
              )
              .join("")}`
      }

      </div>
      <script type="module" src="/_public/browser/review-card.mjs"></script>
  
      <style>
        .likertScales {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--space-3) var(--space-5);
        }


      </style>
      </main-layout>
      `;
}
