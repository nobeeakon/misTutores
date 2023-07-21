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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300&display=swap" rel="stylesheet">
     
      <title>Mis Tutores</title>
      <meta name="description" content="Evalúa tu experiencia con tu tutor de tesis y ayuda a otros estudiantes que se encuentran en el delicado proceso de escoger tutor.">

      ${linkTag()}
      <link rel="icon" href="/_public/bigT.png"> 

      <meta name="google-site-verification" content="7MAL5WdF7qZMA2f7l1g0cStmzJtjYfKxBJiYrBp-Q6s" />
      <style>
      body {
        height: 100%;
        display: flex;
        flex-direction:column;
        color: var(--grey-800);
        font-family: 'Roboto', sans-serif;
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
