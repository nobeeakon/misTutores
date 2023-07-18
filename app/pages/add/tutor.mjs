/** @type {import('@enhance/types').EnhanceElemFn} */
export default function ({ html, state }) {
  const { store } = state;
  const {
    universityId = "",
    facultyId = "",
    states = {},
    universities = [],
    success, 
    error,
  } = store;

  const titleMessage = Math.random() < 0.5?"Agrega a tu tutor":"Agrega a tu tutora"
  

  return html`
    <style>
        .suggestionsWrapper {
          height: 100%;
            max-height: 500px;
            overflow-y: auto;
        }
    </style>

    <main-layout>
      <h1 class="mis0 mb2 text2">${titleMessage}</h1>
      ${success
        ? `<inline-alert role="alert" type="success" margin="mb2"> ${success}</inline-alert>`
        : ""}
      ${error
        ? `<inline-alert role="alert" type="error" margin="mb2"> ${error}</inline-alert>`
        : ""}

      <div class="grid col-1 col-2-lg gap3">
        <div>
          <div>
            <form method="post">
              <div class="mbe1">
                <div class="mbe-3">
                  <label for="tutor-name"> Nombre </label>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    id="tutor-name"
                    name="tutor-name"
                    class="w100"
                    autofocus
                  />
                </div>
              </div>

              <div class="mb1">
                <div class="mbe-3">
                  <label for="tutor-surname1">
                    Primer Apellido (paterno)
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    id="tutor-surname1"
                    name="tutor-surname1"
                    class="w100"
                  />
                </div>
              </div>

              <div class="mb1">
                <div class="mbe-3">
                  <label for="tutor-surname2">
                    Segundo Apellido (materno)
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    id="tutor-surname2"
                    name="tutor-surname2"
                    class="w100"
                  />
                </div>
              </div>

              <div class="mb1">
                <div class="mbe-3">
                  <label for="university-id"> Universidad </label>
                </div>
                <div>
                  <select
                    id="university-id"
                    name="university-id"
                    value="${universityId}"
                    required
                    class="w100"
                  >
                    <option></option>

                    ${universities
                      .map(
                        (universityItem) =>
                          `<option value="${universityItem.key}">${
                            universityItem.abbreviation
                              ? `${universityItem.abbreviation} - `
                              : ""
                          }${universityItem.name}</option>`
                      )
                      .join("")}
                  </select>
                </div>
              </div>

              <div class="mb1">
                <div class="mbe-3">
                  <label for="faculty-id"> Facultad o Instituto </label>
                </div>

                <div>
                  <select
                    id="faculty-id"
                    name="faculty-id"
                    value="${facultyId}"
                    required
                    class="w100"
                  >
                    <option></option>
                  </select>
                </div>
              </div>

              <div class="text-end">
                <button type="submit" class="primaryButton">Enviar</button>
              </div>
            </form>
          </div>

          <div class="mb1">
            <a href="/add/institution" class="link">
              Click aquí si necesitas agregar una institución</a
            >
          </div>
        </div>

        <div>
          <h2 class="mbe0 text1">Sugerencias</h2>
          <div class="suggestionsWrapper">
            <tutor-suggestions id="tutor-suggestions"></tutor-suggestions>
          </div>
        </div>
      </div>
      <script
      type="module"
      src="/_public/browser/tutor-suggestions.mjs"
    ></script>
<script>
        const university = document.getElementById("university-id");
        const faculty = document.getElementById("faculty-id");
        let currentUniversityId = "${universityId}";

        const universities = ${JSON.stringify(universities)};
        const states = ${JSON.stringify(states)};

        university.onchange = (event) => {
          const newUniversityId = event.target.value;

          if (currentUniversityId === newUniversityId) return;
          currentUniversityId = newUniversityId; // update university id

          faculty.innerHtml = ""; // clear content

          const targetUniversity = universities.find(
            (universityItem) => universityItem.key === newUniversityId
          );

          if (targetUniversity?.faculties) {
            targetUniversity.faculties.forEach((facultyItem) => {
              const newOption = document.createElement("option");
              newOption.value = facultyItem.key;
              const facultyState = states[facultyItem.stateId] ?? "";
              const facultyDisplayName =
                "" + facultyItem.name + " - " + facultyState;
              newOption.innerText = facultyDisplayName;
              faculty.appendChild(newOption);
            });
          }
        };
      </script>
      <script>
        const tutorSuggestionsElement =
          document.getElementById("tutor-suggestions");
        const tutorName = document.getElementById("tutor-name");
        const tutorSurname1 = document.getElementById("tutor-surname1");
        const tutorSurname2 = document.getElementById("tutor-surname2");

        tutorName.addEventListener("keyup", (event) => {
          tutorSuggestionsElement.setAttribute("name", event.target.value);
        });

        tutorSurname1.addEventListener("keyup", (event) => {
          tutorSuggestionsElement.setAttribute("surname1", event.target.value);
        });

        tutorSurname2.addEventListener("keyup", (event) => {
          tutorSuggestionsElement.setAttribute("surname2", event.target.value);
        });
      </script>
 
    </main-layout>
  `;
}
