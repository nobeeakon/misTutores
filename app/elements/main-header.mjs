/** @type {import('@enhance/types').EnhanceElemFn} */
export default function({html, state}) {
    const hidesearch = 'hidesearch' in state.attrs;


    return html`
    <header> 
    <nav class="mbs2 mbe1 flex align-items-baseline  pi4">
    <a href="/" >Inicio</a>
        <ul class="flex flex-grow justify-content-end align-items-baseline  list-none">
            

        
        ${hidesearch?'<div class="flex"> </div>': 
        `
        <li class="flex-grow mi1 hidden block-lg"> 
        <form
        class="flex align-items-baseline flex-wrap searchForm"
        method="get"
        action="/search"
        >

        <input aria-label="Tutor"
        name="text" id="text" type="search" minlength="3"  placeholder="Nombre del tutor..." required />
        <input type="hidden" name="type" value="tutor" />
        <button type="submit" class="primaryButton mis-3">Ir</button>
        </form>
        </li>
        <li class="hidden-lg flex-grow mi1 colorGrey600"> <a href="/search ">Buscar</a></li>
        `}
        
           

            <li class="mi1 colorGrey600"> <a href="/add/tutor">+Tutor</a></li>
            <li class="mi1 colorGrey600"> <a href="/add/institution">+Institución</a></li>
         
        </ul>

    </nav>
    </header>`
}