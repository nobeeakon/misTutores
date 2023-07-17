import { SEARCH_QUERY_TYPES } from "../api/search.mjs";

const getTutorTableRow = (tutorData) => {
  const { key, name, reviewsCount, institutionNames } = tutorData;

  return `
    <tr>
    <td><a href="/${key}" class="link">${name}</a></td>
    <td class="text-center">${reviewsCount}</td>
    <td>${institutionNames
      .map(
        (institutionItem) =>
          `${institutionItem.universityName ?? ""} - ${
            institutionItem.facultyName ?? ""
          }`
      )
      .join(", ")}</td>
    </tr>
    `;
};

const getInstitutionTableRow = (tutorData) => {
  const { university, universityId, faculty, facultyId } = tutorData;

  const getHref = (includeFacultyId) =>
    `/search?type=${
      SEARCH_QUERY_TYPES.tutorsInInstitution
    }&universityId=${universityId}${
      includeFacultyId ? `&facultyId=${facultyId}` : ""
    }"`;

  return `
    <tr>
    <td> <a href="${getHref(false)}"> ${university} </a> </td>
    <td>
    <a href="${getHref(true)}" class="link">
    ${faculty}</a> </td>
    </tr>
    `;
};


const getPages = (currentPage, pagesLength) => {
  return `<div  class="flex justify-content-between">

  ${currentPage === 0?'<div></div>':`<a id="previous-page-link"  class='flex align-items-center'> <img src='/_public/assets/icons/backwards.svg' width="30">  Anterior </a>`}
  ${currentPage < pagesLength - 1 ?`<a id="next-page-link"  class='flex align-items-center' >Siguiente <img src='/_public/assets/icons/forward.svg' width="30"></a>`:''}
  </div>
  
  <script>
  const previousPageLink = document.getElementById('previous-page-link');
  const nextPageLink = document.getElementById('next-page-link');
  
  const getNewPageHref = (pageNumber) => {
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('page');
    newUrl.searchParams.append('page', pageNumber);

    return newUrl.toString();
  }

  if (previousPageLink) {
    previousPageLink.setAttribute('href', getNewPageHref(${currentPage - 1}));
  }

  if (nextPageLink) {
    nextPageLink.setAttribute('href', getNewPageHref(${currentPage + 1}));
  }
  </script>
  
  `
}

const getTable = (type, data, currentPage, pagesLength) => {
  if (!data) {
    return;
  }


  const noDataMessage = (typeLabel, href) => `<div class="text-center">
    <p class=" text1 colorGrey600 mb2"> No encontramos lo que buscabas :/ </p>
    <p> Si tu ${typeLabel} no está, por favor agrégala  <a href="${href}" class="link">aquí</a>.  </p>
    <div class="mainImage mbs2">
    <img src="/_public/assets/alien.jpg" alt="No encontramos lo que buscabas"/>
    </div> 
    </div>`;

  switch (type) {
    case SEARCH_QUERY_TYPES.tutor:
    case SEARCH_QUERY_TYPES.tutorsInInstitution:
      if (!data.length) {
        return noDataMessage("tutora", "/add/tutor");
      }

      return `
            <table class="w100">
            <thead>
            <tr>
            <th>Nombre</th>
            <th class="text-center">Reseñas</th>
            <th>Instituciones</th>
            </tr>
            </thead>
            <tbody>
            ${data.map((tutorItem) => getTutorTableRow(tutorItem)).join("")}
            </tbody>
            </table>
            <div class="mbs0">
            ${getPages(currentPage, pagesLength)}
            </div>
            `;
    case SEARCH_QUERY_TYPES.institutionName:
      if (!data.length) {
        return noDataMessage("institución", "/add/institution");
      }

      return `
            <table class="w100">

            <thead>
            <tr>
            <th>Universidad</th>
            <th>Facultad o Instituto</th>
            </tr>
            </thead>
            <tbody>
            ${data
              .map((universityItem) => getInstitutionTableRow(universityItem))
              .join("")}
            </tbody>
            </table>
            <div  class="mbs0">
            ${getPages(currentPage, pagesLength)}
            </div>
            `;
    default:
      return ``;
  }
};

export default function ({ html, state }) {
  const { data, type, error, currentPage,pagesLength  } = state.store;

  return html`
    <style>
      td,
      th {
        border: 1px solid var(--grey-100);
        text-align: left;
        padding: 8px;
      }

      .searchForm {
        row-gap: var(--space-0);
      }

      .mainImage {
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }
    </style>
    <main-layout hide-navsearch>
      <section>
        <form
          class="mbe3 flex align-items-baseline flex-wrap searchForm"
          method="get"
        >
          <label for="text" class="mie-3">Texto</label>
          <input
            name="text"
            id="text"
            type="search"
            minlength="3"
            required
            autofocus
          />

          <div class="mi1 flex">
            <label>
              <input type="radio" name="type" value="tutor" checked />
              Tutor
            </label>

            <label class="mis-2">
              <input type="radio" name="type" value="institutionName" />
              Institución
            </label>
          </div>

          <button type="submit" class="primaryButton">Buscar</button>
        </form>
      </section>

      ${error
        ? `<inline-alert role="alert" type="error" margin="mb1">${error}</inline-alert>`
        : ""}
      ${!type && !error
        ? '<div class="mainImage"><img src="/_public/assets/flying.jpg" /></div>'
        : getTable(type, data, currentPage, pagesLength)}
    </main-layout>
  `;
}
