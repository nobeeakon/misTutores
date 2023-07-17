class TutorSuggestions extends HTMLElement {

  #defaultMessage = "Lista de tutores con un nombre similar.";

  #fetchTutors() {
    // clean before doing anything else
    this.ulElement.innerHTML = '';

    const oldTimeOut = this.timeOutKey;

    if (oldTimeOut) {
      clearTimeout(oldTimeOut);
    }

    if (this.abortController) {
      this.abortController.abort(); // stop promise
    }

    this.abortController = new AbortController();


    if (this.name.length < 2 || this.surname1.length < 2) {
      this.message.innerText = this.#defaultMessage
      return;
    }
      
    this.message.innerText = 'Cargando...'

      this.timeOutKey = setTimeout(() => {
        const queryParams = new URLSearchParams();

          queryParams.set('tutorName', this.name)
          queryParams.set('tutorSurname1', this.surname1)
          queryParams.set('tutorSurname2', this.surname2)

        const url = `/searchByName?${queryParams.toString()}`;

        fetch(
          url,
          { signal: this.abortController.signal },
          {
            headers: {
              "Content-type": "application/json",
            },
          }
        )
          .then(async (response) => {
            if (!response.ok) {
              const errorMessage = await response.text();
              return Promise.reject(new Error(errorMessage));
            }

            return response.json();
          })
          .then(({ data }) =>  {
            this.message.innerHTML = '';
            const tutors = data??[]
            tutors.forEach(tutorItem => {
                const liElement = document.createElement('li')
                const aElement = document.createElement('a')
                const spanElement = document.createElement('span')

                liElement.classList.add('mis2', 'tutorListItem',  "mbe-2", "leading1");
                aElement.classList.add('link');
                spanElement.classList.add('university')

                aElement.href = `/${tutorItem.key}`;
                aElement.innerText = tutorItem.name;
                const university = !tutorItem.institutionNames?.length?'':tutorItem.institutionNames.map(({universityName, facultyName}) => `${universityName} - ${facultyName}`).join(', ')
                spanElement.innerHTML = ` (${university})`;

                liElement.appendChild(aElement);
                liElement.appendChild(spanElement);
                this.ulElement.appendChild(liElement);
            });
        
            if (!tutors.length)  {
              this.message.innerText = "No encontramos sugerencias.";
            }

        }).catch(error=> {

          if (!(error instanceof DOMException)){
            // DOMException is thrown by abort()
            this.message.innerText = 'Algo salió mal, por favor intenta de nuevo.'
            console.error('Error fetching info', error)
          } 
        });
      }, 500);
  }

  constructor() {
    super();
    this.name = "";
    this.surname1 = "";
    this.surname2 = "";
    this.timeOutKey = "";
    this.linkClass = "";
    this.abortController = null;

    const cssStyleSheet = document.createElement("link");
    this.message =  document.createElement("p");
    cssStyleSheet.setAttribute("rel", "stylesheet");
    cssStyleSheet.setAttribute("href", "/enhance-styles.css");
    const styleTag = document.createElement('style')
    styleTag.textContent = `
    .link {
      color: var(--grey-800);
      text-decoration: var(--primary-500) wavy underline;
  }
  .university {
    display: none;
    color: var(--grey-500);
  }
  .tutorListItem:hover  .university {

   display: initial; 
  }
    `

    this.message.innerText = this.#defaultMessage;


    this.ulElement = document.createElement("ul");
    const shadow = this.attachShadow({ mode: "open" });


    shadow.appendChild(cssStyleSheet)
    shadow.appendChild(styleTag)
    shadow.appendChild(this.ulElement);
    shadow.appendChild(this.message);
  }

  static get observedAttributes() {
    return ["name", "surname1", "surname2", ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "name":
        this.name = newValue;
        break;
      case "surname1":
        this.surname1 = newValue;
        break;

      case "surname2":
        this.surname2 = newValue;
        break;
      default:
        return;
    }

      this.#fetchTutors();
  }
}

customElements.define("tutor-suggestions", TutorSuggestions);
