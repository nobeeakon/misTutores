  /**
   * 
   * @param {string} label 
   * @param {number} value 
   */
 export const getBarchartOption = (label, value) => ({label, value})


  /**
   * @param {string} optionsString 
   * @returns {Array.<{label:string;value:number}>|null}
   */
  const validateOptions = (optionsString) => {
    const optionsArray = JSON.parse(optionsString);

    const isValidInput = Array.isArray(optionsArray) && optionsArray.filter(optionItem => 'label' in optionItem && 'value' in optionItem && typeof optionItem.value === 'number' ).length === optionsArray.length;

    return isValidInput?optionsArray:null;
  }


  /** @type {import('@enhance/types').EnhanceElemFn} */
  export default function ({ html, state }) {
    const { options } = state.attrs;
    const barsInfo = validateOptions(options);  


    if (!barsInfo) {
        throw new Error(`Invalid input for Barchart, please check: ${JSON.stringify(state.attrs.options)}`)
    }


    const maxFrequency = Math.max(...barsInfo.map((optionItem) => optionItem.value));
    /**
     * @param {number} frequency 
     * @returns {number}
     */
    const getPercentage = (frequency) => {
      return maxFrequency < 1 ? 0 : 100 * (frequency / maxFrequency);
    };
  
    const getBar = (label, value) =>
    `
    <div class="flex"> 

    <div class="text-1 likertScaleBarIndex" style="">
      ${label}
      </div> 
      <div class="likertScaleBar" title="${label}" style="height:100%;width: calc(1px + ${getPercentage(value)}%)">
        </div>
        </div>`;
  
  
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
        <div class="likertScaleWrapper">
          ${barsInfo.map((barItem) => getBar(barItem.label, barItem.value)).join("")}
        </div>
      </div>
    `;
  }
  