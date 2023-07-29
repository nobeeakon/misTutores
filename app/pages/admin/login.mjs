
/** @type {import('@enhance/types').EnhanceElemFn} */
export default function({html, state}) {

    const authorized = state.store?.authorized;


    const logoutForm = `<form method="POST" >
        <input type="hidden" name="action" value="logout" >
        <button class="primaryButton" type="submit">Log out</button>
    </form>`
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
    <section class="mbs4 text-center">
     ${authorized? logoutForm:loginForm}
    </section>
    </main-layout>`
}
