export default function({html, state}) {
    const hideMainNavSearch = 'hide-navsearch' in  state.attrs;

    return html` <style>



        :host {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .pageContent {
          width: 100%;
          max-width: 1200px;
          padding-inline-start:var(--space-2); 
          padding-inline-end:var(--space-2); 
          margin:auto
        }

        .primaryButton {
          background-color: var(--primary-400);
          color: white;
          padding: var(--space--3) var(--space-1);
          border-radius: 8px;
          display:inline-block;
          font-weight: 900;
        }

        .primaryButton:hover {
          background-color: var(--primary-500);
        }

        input,
        textarea,
        select {
          background: transparent;
          border: 1px solid var(--primary-500);
          padding: var(--space--5) var(--space--1);
          border-radius: 4px;
        }

        .link {
          color: var(--grey-800);
          text-decoration: var(--primary-400) wavy underline;
        }

        .w100 {
          width: 100%;
        }

        .tailwind-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }


        .colorGrey600 {
        color: var(--grey-600);
    }

    .colorGrey700 {
        color: var(--grey-700);
    }

    .colorGrey800 {
        color: var(--grey-800);
    }

      </style>

      <main class="flex flex-col flex-grow ">
        <main-header ${hideMainNavSearch ? "hidesearch" : ""}></main-header>
        <div class="flex-grow pageContent mbs2 mbe2 flex flex-col">
          <slot></slot>
        </div>
        <main-footer class="footer"></main-footer>
      </main>`;
}