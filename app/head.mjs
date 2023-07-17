import { getStyles }  from '@enhance/arc-plugin-styles'

const { linkTag } = getStyles

export default function Head () {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    

      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap" rel="stylesheet">
     
      <title>Mis Tutores</title>
      <meta name="description" content="Evalúa tu experiencia con tu tutor de tesis y ayuda a otros estudiantes que se encuentran en el delicado proceso de escoger tutor.">

      ${linkTag()}
      <!-- <link rel="icon" href="/_public/favicon.svg"> TODO --!>


      <style>
      body {
        height: 100%;
        display: flex;
        flex-direction:column;
        color: var(--grey-800);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        line-height: 1.1;
      }
    
      
      body > * {
        display: flex;
        flex-direction:column;
        flex-grow:1;
      }


      
      </style>
      
    </head>
`
}
