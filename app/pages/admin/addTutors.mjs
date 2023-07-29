/** @type {import('@enhance/types').EnhanceElemFn} */
export default function({html, state}) {
    const {universities} = state.store

    console.log()

    const facultiesByUniversityId = universities.reduce( (acc, currentUniversityItem) => {
        const {key, faculties} = currentUniversityItem
        if (faculties?.length) {
            return {...acc, [key]: faculties };
        }

        return acc;
    }, {})

return html `<main-layout>
    <style>

        td,
        th {
            border: 1px solid var(--grey-100);
            text-align: left;
            padding: 8px;
        }
    </style>
    <section>
        <div>

            <label for="tutors-input">Tutores a buscar</label>
            <p>Campos separados por ','. El órden es:
            <pre>nombre , surname1 , surname2</pre>
            </p>
            <textarea id="tutors-input" class="w100 mbs0" rows="15" autofocus></textarea>
        </div>

        <div class="text-center mb-1">
            <button id="validate-button" class=" primaryButton">Validar</button>
        </div>

        <div>
            <table>
                <thead>
                    <tr>
                        <th>nombre</th>
                        <th>surname1</th>
                        <th>surname2</th>
                    </tr>
                </thead>
                <tbody id="tutors-input-table">

                </tbody>
            </table>
        </div>
        <div class="mb1">
            <h3>Sin similitudes</h3>
            <ul id="tutors-without-similar-in-db" class="mis1">
            </ul>
        </div>
        <div>
            <h3>Con similitudes</h3>

            <ul id="tutors-with-similar-in-db" class="mis1">
            </ul>
        </div>
        <form class="mb1" id="form-addBatch">
            <div class="mbe1">
                <div class="mbe-3">
                    <label for="university-id"> Universidad </label>
                </div>
                <div>
                    <select id="university-id" name="university-id" required class="w100">
                        <option></option>
                        ${universities
                            .map(universityItem => `<option value="${universityItem.key}">${universityItem.name}</option>`)
                            .join('')
                        }
                    </select>
                </div>
            </div>

            <div class="mb1">
                <div class="mbe-3">
                    <label for="faculty-id"> Facultad o Instituto </label>
                </div>

                <div>
                    <select id="faculty-id" name="faculty-id" required class="w100">
                        <option></option>
                    </select>
                </div>
            </div>
            <div class="text-center mb-1">
                <button id="submit-add-batch-button" class=" primaryButton">Enviar</button>
            </div>
            <div class="mb0">
                <pre id="batch-add-results"></pre>
            </div>
        </form>
    </section>

    <script>
        const tutorsInput = document.getElementById('tutors-input');
        const tutorsInputTable = document.getElementById('tutors-input-table');
        const validateButton = document.getElementById('validate-button');
        const ulWith = document.getElementById('tutors-with-similar-in-db');
        const ulWithout = document.getElementById('tutors-without-similar-in-db');
        const sendButton = document.getElementById('send-button');



        let tutorsToValidate = [];

        const FIELD_SEPARATOR = ','
        tutorsInput.addEventListener('change', (event) => {
            tutorsInputTable.innerHTML = ""; // clear
            const tutors = event.target.value.split('\\n').filter( textRow => textRow.trim() )
            .map(tutorItem => tutorItem.split(FIELD_SEPARATOR).map(fieldItem => fieldItem.trim())).filter(tutorItem => tutorItem.length);

            // update the data
            tutorsToValidate = tutors.map(([name, surname1, surname2]) => ({ name, surname1, surname2 }));

            tutors.forEach(tutorItem => {
                const tr = document.createElement('tr');
                const tdName = document.createElement('td');
                const trSurname1 = document.createElement('td');
                const trSurname2 = document.createElement('td');

                const [name, surname1, surname2] = tutorItem


                tdName.innerText = name ?? '';
                trSurname1.innerText = surname1 ?? '';
                trSurname2.innerText = surname2 ?? '';

                tr.appendChild(tdName)
                tr.appendChild(trSurname1)
                tr.appendChild(trSurname2)
                tutorsInputTable.appendChild(tr)
            })

        })

        const buildNameString = (name = '', surname1 = '', surname2 = '') => [name, surname1, surname2].join(' ');

        const tutorsToAdd = new Map();



        const appendLiTutorInfo = (index, tutorInfo, similarTutors = []) => {
            const liItem = document.createElement('li');

            // tutor
            const labelTutorName = document.createElement('label');
            const inputTutor = document.createElement('input');
            const labelText = document.createElement('span');
            labelTutorName.appendChild(inputTutor);
            labelTutorName.appendChild(labelText);

            labelText.classList.add('mis0')

            inputTutor.setAttribute('type', 'checkbox');
            inputTutor.setAttribute('value', index);
            inputTutor.addEventListener('change', (event) => {
                const elementValue = event.target.value;
                if (tutorsToAdd.has(elementValue)) {
                    tutorsToAdd.delete(elementValue)
                } else {
                    tutorsToAdd.set(elementValue, tutorInfo)
                }
            })


            const hasSimilarTutors = similarTutors.length > 0;


            labelText.innerText = buildNameString(tutorInfo.name, tutorInfo.surname1, tutorInfo.surname2);
            liItem.appendChild(labelTutorName);

            if (!hasSimilarTutors) {
                tutorsToAdd.set(index.toString(), tutorInfo);
                inputTutor.setAttribute('checked', 'true');

                ulWithout.appendChild(liItem);

                return;
            }


            const olSimilar = document.createElement('ol');
            olSimilar.classList.add('mis2');
            liItem.appendChild(olSimilar);


            similarTutors.forEach(similarTutorItem => {
                const liSimilarTutor = document.createElement('li');
                const aSimilarTutor = document.createElement('a');

                aSimilarTutor.innerText = buildNameString(similarTutorItem.name, similarTutorItem.surname1, similarTutorItem.surname2);

                if (similarTutorItem?.key) {
                    aSimilarTutor.href = '/' + similarTutorItem.key; 
                    aSimilarTutor.classList.add('linkColor');
                }

                liSimilarTutor.appendChild(aSimilarTutor);
                olSimilar.appendChild(liSimilarTutor);

            })

            ulWith.appendChild(liItem);
        }

        const clearData = () => {
            tutorsToAdd.clear();
            ulWith.innerHTML = ''
            ulWithout.innerHTML = ''
        }

        // validate data
        const validateData = () => {
            clearData()

            fetch('/admin/addTutors', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    action: 'checkExistence',
                    tutors: tutorsToValidate
                })
            })
                .then(res => res.json())
                .then(res => {
                    (res?.data ?? []).forEach(
                        (tutorItem, index) => appendLiTutorInfo(index, tutorItem.tutor, tutorItem.similarTutors)
                    );
                })
        }

        validateButton.addEventListener('click', validateData)



        // form 
        const formElement = document.getElementById('form-addBatch');
        const universitySelect = document.getElementById('university-id');
        const facultySelect = document.getElementById('faculty-id');
        const submitAddBatchButton = document.getElementById('submit-add-batch-button');
        const formSubmitResultsPre = document.getElementById('batch-add-results');



        const facultiesMap = ${JSON.stringify(facultiesByUniversityId)};
        universitySelect.addEventListener('change', (event) => {
            //clear
            facultySelect.innerHTML = '';
            facultySelect.value = '';

            const universityKey = event.target.value;
            const faculties = facultiesMap[universityKey];

            const emptyOption = document.createElement('option')
            facultySelect.appendChild(emptyOption);

            if (!faculties?.length) {
                return;
            }


            faculties.forEach(({ name: facultyName, key: facultyKey, stateId: facultyStateId }) => {
                const facultyOption = document.createElement('option');
                facultyOption.innerText = facultyName + ' - (' +  facultyStateId + ')';
                facultyOption.value = facultyKey;
                facultySelect.appendChild(facultyOption);
            })
        })


        const onSubmit = (event) => {
            event.preventDefault();
            formSubmitResultsPre.innerText = 'Cargando...';

            const formData = new FormData(formElement);
            const universityId = formData.get('university-id');
            const facultyId = formData.get('faculty-id');

            if (!universityId || !facultyId || tutorsToAdd.size === 0) { 
                formSubmitResultsPre.innerText = 'Por favor revisa tu información';
                return;

            }

            const tutorsToAddArray =  Array.from(tutorsToAdd).map(([key, tutorItem]) =>  tutorItem)
            fetch('/admin/addTutors', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    action: 'add',
                    'university-id': universityId,
                    'faculty-id': facultyId,
                    tutors: tutorsToAddArray,
                })
            }).then(async(res) => {
                if (!res.ok) {
                    const errorMessage = await res.text();
                    throw new Error(errorMessage);
                }

                return res.json();
            })
            .then(json => {
                formSubmitResultsPre.innerText = JSON.stringify(json, null, 2);
                
                
            })
            .catch(error => {
                formSubmitResultsPre.innerText = 'Error: ' + error.toString();

                console.error(error);
            }).finally(() => {
                clearData()
            })

        }

        formElement.addEventListener('submit', onSubmit)

    </script>
</main-layout>`
}