
/** @type {import('@enhance/types').EnhanceElemFn} */
export default function({html, state}) {

    const authorized = state.store?.authorized;


    const logoutForm = `<form method="POST"  class="text-end">
        <input type="hidden" name="action" value="logout" >
        <button class="primaryButton" type="submit">Log out</button>
    </form>
    
    <div>
    <ul>
        <li>
            <a href="/admin/counts" class="linkColor">Cuentas</a>
        </li>
        <li>
            <a href="/admin/addTutors" class="linkColor">Batch add tutors</a>
        </li>
        <li>
        <a href="/admin/clean" class="linkColor">Clean</a>
    </li>
    </ul>
    </div>
    `
    const loginForm = `
    <form method="POST" >
        <input type="hidden" name="action" value="login" >

        <div>
            <label for="username">Usuario</label>
            <input name="username" id="username" type="text" required>
        </div>

        <div class="mb0">
            <label for="password">Contraseña</label>
            <input name="password" id="password" type="password" required>
        </div>
        <button class="primaryButton" type="submit">Log in</button>
    </form>`    ;

  return html`<main-layout>
    <section class="mbs4">
     ${authorized? logoutForm:loginForm}
    </section>
    </main-layout>`
}
