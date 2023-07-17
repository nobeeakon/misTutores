/** @type {import('@enhance/types').EnhanceElemFn} */
export default function ({ html, state }) {
  const { attrs } = state;

  const { message = "", role = "", type = "", margin = "" } = attrs;

  let backgroundClass = "";
  switch (type) {
    case "error":
      backgroundClass = "errorInlineAlertBackground";
      break;
    case "success":
    default:
      backgroundClass = "successInlineAlertBackground";
  }

  return html`
    <style>
      .successInlineAlertBackground {
        background-color: var(--success-100);
      }
      .errorInlineAlertBackground {
        background-color: var(--error-100);
      }
    </style>
    <div class="p0 ${margin} ${backgroundClass}" role="${role}">
      ${message}
      <slot> </slot>
    </div>
  `;
}
