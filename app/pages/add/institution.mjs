/** @type {import('@enhance/types').EnhanceElemFn} */
export default function ({ html, state }) {
  const { store } = state;
  const {
    universityName = "",
    universityId = "",
    universityAbbreviation = "",
    states = [],
    universities = [],
    success, 
    error,
  } = store;


  return html`
  <style>
    .mainImage {
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
  </style>
  <main-layout>
  <h1 class="mis0 mb2 text2">Agrega una institución</h1>

  ${
  success
  ? `<inline-alert role="alert" type="success" margin="mb2"> ${success}</inline-alert>`
  : ""
  }
  ${error
  ? `<inline-alert role="alert" type="error" margin="mb2"> ${error}</inline-alert>`
  : ""
  }

  <div  class="grid col-1 col-2-lg gap3">
      <div>
          <form method='post'>

              <input name='university-id' id='university-id' hidden value=${universityId} />

              <div class="mb1">
                  <div class="mbe-3">
                      <label for='university-name'>
                          Universidad
                      </label>
                  </div>

                  <input type='text' id='university-name' list='university-name-list' name='university-name'
                      value="${universityName}" autocomplete="off" required class="w100" />

                  <datalist id='university-name-list'>
                      ${universities
                      .map(
                      (universityItem) =>
                      `<option value="${universityItem.name}">${universityItem.abbreviation
                          ? `${universityItem.abbreviation} - `
                          : ""
                          }${universityItem.name}</option>`
                      )
                      .join("")}
                  </datalist>
              </div>

              <div class="mb1">
                  <div class="mbe-3">
                      <label for='university-abbreviation'>
                          Abreviación
                      </label>
                  </div>
                  <input type='text' id='university-abbreviation' name='university-abbreviation'
                      value="${universityAbbreviation}" class="w100" />
                  </label>
              </div>

              <div class="mb1">
                  <div class="mbe-3">
                      <label required for='faculty-name'>
                          Facultad o Instituto
                      </label>
                  </div>
                  <input type='text' id='faculty-name' name='faculty-name' class="w100" />
              </div>


              <div class="mb1">
                  <div class="mbe-3">
                      <label for='faculty-abbreviation'>
                          Abreviación de la Facultad o Instituto
                      </label>
                  </div>
                  <input type='text' id='faculty-abbreviation' name='faculty-abbreviation' class="w100" />
              </div>

              <div class="mb1">
                  <div class="mbe-3">
                      <label required for='faculty-geographic-state'>
                          Estado
                      </label>
                  </div>
                  <select required id='faculty-geographic-state' name='faculty-geographic-state' class="w100">
                      <option> </option>
                      ${Object.entries(states)
                      .map(
                      ([stateId, stateDisplayName]) =>
                      `<option value="${stateId}"> ${stateDisplayName} </option>`
                      )
                      .join("")}
                  </select>
              </div>

              <div class="text-end">
                  <button type='submit' class="primaryButton"> Enviar </button>
              </div>
          </form>
          <div class="mb1">
              <a href="/add/tutor" class="link"> Click aquí si quieres agregar un tutor</a>
          </div>
      </div>
      <div>
      <div class="mainImage">
      <img  src="/_public/assets/girl_writing.jpg">
  </div>
      </div>
  </div>
  <script>
      let prevUniversityValueExist = false;

      const universityName = document.getElementById('university-name')
      const universityAbbreviation = document.getElementById('university-abbreviation');
      const universityId = document.getElementById('university-id')

      const universities = ${ JSON.stringify(universities)};

      universityName.onchange = (event) => {
          const newUniversityName = event.target.value;

          const foundUniversity = universities.find(universityItem => universityItem.name === newUniversityName)
          if (foundUniversity) {
              universityAbbreviation.value = foundUniversity.abbreviation;
              universityId.value = foundUniversity.id;

              universityAbbreviation.disabled = true;
              prevUniversityValueExist = true;
          } else {
              universityAbbreviation.disabled = false;
              universityId.value = '';

              if (prevUniversityValueExist) {
                  universityAbbreviation.value = '';
                  prevUniversityValueExist = false;

              }
          }
      }


  </script>
</main-layout>
      
      `;
}
