const btnAbrirVideo = document.getElementById('agrmasvideos');
const overlayVideo = document.getElementById('overlayVideo');
const inputLink = document.getElementById('linkvideo');
const cancelarVideo = document.getElementById('cancelarVideo');
const guardarVideo = document.getElementById('guardarVideo');
const videosagr= document.getElementById("videosagr")

const preview = document.getElementById('previewTarjeta');
const previewImg = document.getElementById('previewImg');
const previewTitulo = document.getElementById('titvideo');
const previewCanal = document.getElementById('canalvideo');

const btnAbrir = document.getElementById('agrmasapartados');
const overlay = document.getElementById('overlay');
const cancelar = document.getElementById('cancelar');
const guardar = document.getElementById('guardar');
const input = document.getElementById('inpapartado');
const contenedorApartados = document.getElementById('contenedorApartados');







// Función para crear y mostrar un apartado
function crearApartado(titulo) {
  const details = document.createElement('details');


  const summary = document.createElement('summary');
  summary.textContent = titulo;

  // Botón para agregar videos
  const btnAgregarVideo = document.createElement('div');
  btnAgregarVideo.className = 'btnagrmas';
  btnAgregarVideo.innerHTML = `
    <span>
      <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D33434">
        <path d="M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z" />
      </svg>
    </span>
  `;

  // Contenedor donde irán los videos dentro del apartado
  const contenedorVideos = document.createElement('div');
contenedorVideos.classList.add('contenedor-videos');
contenedorVideos.dataset.id = crypto.randomUUID(); // ID único

  // Evento: al hacer click en el botón, abre overlay y guarda a este apartado
btnAgregarVideo.addEventListener('click', () => {
  overlayVideo.classList.remove('hidden');
  inputLink.value = '';
  preview.classList.add('hidden');

  // Guardar referencia directa al contenedor real
  overlayVideo.dataset.targetId = contenedorVideos.dataset.id;
});

  details.appendChild(summary);
  details.appendChild(contenedorVideos);
    details.appendChild(btnAgregarVideo);
  contenedorApartados.appendChild(details);
}


// Abrir overlay al dar click en el botón
btnAbrir.addEventListener('click', (e) => {
  e.stopPropagation();
  overlay.classList.remove('hidden');
});

// Cerrar overlay al cancelar
cancelar.addEventListener('click', () => {
  overlay.classList.add('hidden');
  input.value = '';
});

// Guardar apartado y en localStorage
guardar.addEventListener('click', () => {
  const titulo = input.value.trim();
  if (titulo !== '') {
    crearApartado(titulo);

    // Guardar en localStorage
    let apartados = JSON.parse(localStorage.getItem('apartados')) || [];
    apartados.push(titulo);
    localStorage.setItem('apartados', JSON.stringify(apartados));

    input.value = '';
    overlay.classList.add('hidden');
  }
});

// Cargar apartados guardados al iniciar
window.addEventListener('DOMContentLoaded', () => {
  const apartados = JSON.parse(localStorage.getItem('apartados')) || [];
  apartados.forEach(titulo => crearApartado(titulo));
});










// Abrir overlay

// Cancelar
cancelarVideo.addEventListener('click', () => {
  overlayVideo.classList.add('hidden');
});

// Detectar cambios en el input y mostrar preview
inputLink.addEventListener('input', () => {
  const link = inputLink.value.trim();
  const idVideo = obtenerID(link);
  if (idVideo) {
    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${idVideo}`)
      .then(res => res.json())
      .then(data => {
        previewImg.src = `https://img.youtube.com/vi/${idVideo}/maxresdefault.jpg`;
        previewTitulo.textContent = data.title;
        previewCanal.textContent = data.author_name;
        preview.classList.remove('hidden');
      })
      .catch(() => {
        preview.classList.add('hidden');
      });
  } else {
    preview.classList.add('hidden');
  }
});

// Guardar video como tarjeta
guardarVideo.addEventListener('click', () => {
  const link = inputLink.value.trim();
  const idVideo = obtenerID(link);
  if (!idVideo) return;

  const tarjeta = document.createElement('a');
  tarjeta.href = `https://www.youtube.com/watch?v=${idVideo}`;
  tarjeta.target = "_blank";
  tarjeta.innerHTML = `
    <div class="tarjeta">
      <img src="https://img.youtube.com/vi/${idVideo}/maxresdefault.jpg" class="tarjetaimg">
      <div class="texto">
        <span class="titulovideo">${previewTitulo.textContent}</span>
        <span class="canalvideo">${previewCanal.textContent}</span>
      </div>
      <div class="btn rojo">Eliminar</div>
    </div>
  `;

  // Buscar contenedor por ID único guardado en el dataset
  const targetId = overlayVideo.dataset.targetId;
  const contenedor = document.querySelector(`.contenedor-videos[data-id="${targetId}"]`);

  if (contenedor) {
    contenedor.appendChild(tarjeta);
  }

  overlayVideo.classList.add('hidden');
});



// Extrae ID del video de cualquier link
function obtenerID(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}












