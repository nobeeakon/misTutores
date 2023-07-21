/** @type {import('@enhance/types').EnhanceElemFn} */
export default function ({html}) {
    return html`
    <footer class=" pageContent mbs2 pbe0 colorGrey600 text-1"> 
    <div class="text-center">Hecho por <a class="linkUnderline colorGrey600" href="https://twitter.com/nobeeakon" rel="noopener noreferrer">Daniel T.</a>, con Enhance js </div>

    <div class="text-2  mbs0">
    <ul class="list-none flex footerLinksWrapper flex-wrap justify-content-evenly">

            <li><a class="footerLink" href="/about">Acerca de</a></li>
            <li><a class="footerLink" href="/terms">Condiciones de uso</a></li>
            <li><a class="footerLink" href="/leavecomment">Dejar un comentario</a></li>
            <li >
            <a class="footerLink" href="https://www.freepik.com/author/stories" rel="noopener noreferrer">Ilustraciones de storyset</a> en Freepik
            </li>
            </ul>
    </div>
    </footer>
    <style>
        .footerLinksWrapper {
            column-gap: var(--space-1)
        }

        .footerLink:hover, .footerLink:active {
            text-decoration: var(--success-500) wavy underline;
        
        }
        </style>
    `
}