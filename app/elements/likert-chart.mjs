import {
  stringToInt,
  getLikertScaleArray,
} from "../utils/utils.mjs";

/** @type {import('@enhance/types').EnhanceElemFn} */
export default function ({ html, state }) {
  const { min, max, length: lengthString, title } = state.attrs;

  const lengthNumeric = stringToInt(lengthString);

  if (!lengthNumeric) throw new Error("length not defined"); // nothing to show

  const likertIndices = getLikertScaleArray(lengthNumeric);

  const getAnswer = (likertIndex) => {
    const votesString = state.attrs?.[likertIndex];
    return stringToInt(votesString) ?? 0;
  };

  const maxVotes = Math.max(...likertIndices.map((index) => getAnswer(index)));
  const getPercentage = (likertIndex) => {
    const votes = getAnswer(likertIndex);
    return maxVotes < 1 ? 0 : 100 * (votes / maxVotes);
  };

  const getBar = (likertIndex) =>
    `<span class="likertScaleBar relative" title="${getAnswer(
      likertIndex
    )}" style="height: calc(1px + ${getPercentage(likertIndex)}%)">
      <span class="text-1 absolute likertScaleBarIndex" style="">
        ${likertIndex}</span> 
      </span>`;


  return html`
    <style>
      :host {
        display: flex;
        max-width: 550px;
      }
      .likertWrapper {
        display: flex;
        flex-direction: column;
      }

      .likertScaleWrapper {
        height: 30px;
        display: flex;
        flex-wrap: nowrap;
        align-items: end;
      }
      .likertScaleMainTitle {
        flex-grow: 1;
      }
      .likertScaleMinTitle {
        margin-right: 3px;
      }
      .likertScaleMaxTitle {
        margin-left: 3px;
      }
      .likertScaleBar {
        display: inline-block;
        background-color: var(--primary-400);
        width: 40px;
      }
      .likertScaleBar .likertScaleBarIndex {
        bottom:-1.3em;
        padding-left:15px;
        color:var(--grey-600)
      }
    </style>

    <div class="likertWrapper">
      <div class="mbe-1 likertScaleMainTitle">${title}</div>

      <div class="likertScaleWrapper">
        <span class=" text-1 likertScaleMinTitle"> ${min} </span>

        ${likertIndices.map((index) => getBar(index)).join("")}

        <span class=" text-1 likertScaleMaxTitle"> ${max} </span>
      </div>
    </div>
  `;
}
