/** @type {import('@enhance/types').EnhanceElemFn} */
export default function({html}) {

   return html`<main-layout>
   <section class="mbs4">
   
       <form id="delete-faculty-form">
           <div>

               <label for="university-id">University Id</label>
           </div>
           <div>
               <input name="university-id" id="university-id" type="text" required>
           </div>
           <div>

               <label for="faculty-id">Faculty Id</label>
           </div>
           <div>
               <input  name="faculty-id" id="faculty-id" type="text" required>
           </div>
           <button type="submit" class="primaryButton">Eliminar Facultad</button>
       </form>
       <pre id="delete-faculty-response"></pre>
   </section>
   <script>
       const deleteFacultyForm = document.getElementById("delete-faculty-form");
       const deleteFacultyResponse = document.getElementById("delete-faculty-response");

       const deleteFaculty = () => {
        deleteFacultyResponse.innerText = ""
           const formData = new FormData(deleteFacultyForm);

           const universityId = formData.get('university-id')
           const facultyId = formData.get('faculty-id')

           fetch('/admin/clean', {
               method: "POST",
               headers: {
                   "Content-type": "application/json",
               },
               body: JSON.stringify({'university-id':universityId,'faculty-id': facultyId, action: "deleteFaculty"})

           }).then(async (response) => {
               if (!response.ok) {
                   const errorMessage =  await response.text();

                   return Promise.reject(new Error(errorMessage));
               }

               return response.json();
           }).then(json => {
               deleteFacultyResponse.innerText = JSON.stringify(json, null, 2);
           }).catch((error) => {
               deleteFacultyResponse.innerText = "Error:" + error.toString();
           })
       }


       deleteFacultyForm.addEventListener('submit', (event) =>{
           event.preventDefault();
           deleteFaculty()
       })
   </script>
   </main-layout>
   `
}
