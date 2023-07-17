
/** @type {import('@enhance/types').EnhanceElemFn} */
export default function ({ html }) { 

  return html`
  <style>
  .mainImage {
    max-width: 350px;
    margin-left: auto;
    margin-right: auto;
  }
  .subText {
    column-count: 2;
    column-gap: var(--space-1);
    column-width: 300px;
  }
  </style>
  <main-layout>
  <section class="flex align-items-center flex-grow mbs3 mbe4">
    <div>
      <div class="grid col-1 col-2-lg gap3">
        <div class="flex align-items-center">
          <div>
            <h1 class="text2 mbe1">
              Evalúa tu experiencia con tu tutor de tesis
            </h1>
            <p class="leading1 colorGrey600">
              Deja una evaluación <em>anónima</em> sobre tu tutor y ayuda a
              otros estudiantes que se encuentran en el delicado proceso de
              escoger tutor.
            </p>
            <div class="mbs1">
              <a class="primaryButton" href="/search">Buscar</a>
            </div>
          </div>
        </div>
        <div>
          <div class="mainImage">
            <img src="/_public/assets/flying.jpg" width="350px" height="350px" alt="volando por tus sueños"/>
          </div>
        </div>
      </div>
      <section class="leading1 mbs4 colorGrey600 subText mi5">
        <p class="mbe1">
          La tesis requiere mucho tiempo y esfuerzo, elegir al tutor adecuado no
          es algo trivial, es la persona con la que vas a trabajar, colaborar y
          convivir durante ese proceso. Prácticamente un jefe.
        </p>
        <p>
          Hay quien dice que el tutor representa el 50% del proyecto. Más allá
          de un porcentaje, el tutor es pieza clave de la tesis y puede ser
          <em>una</em> de las diferencias entre aprender y disfrutar el proceso,
          o sufrir por meses.
        </p>
      </section>
    </div>
  </section>
  </main-layout>
  `;
}

