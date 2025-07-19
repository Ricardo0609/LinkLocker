const btnAbrirVideo = document.getElementById('agrmasvideos');
const overlayVideo = document.getElementById('overlayVideo');
const inputLink = document.getElementById('linkvideo');
const cancelarVideo = document.getElementById('cancelarVideo');
const guardarVideo = document.getElementById('guardarVideo');
const videosagr = document.getElementById("videosagr");

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

function crearApartado(titulo, id = crypto.randomUUID()) {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = titulo;

  const btnAgregarVideo = document.createElement('div');
  btnAgregarVideo.className = 'btnagrmas';
  btnAgregarVideo.innerHTML = `
    <span>
      <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D33434">
        <path d="M450-450H200v-60h250v-250h60v250h250v60H510v250h-60v-250Z" />
      </svg>
    </span>
  `;

  const contenedorVideos = document.createElement('div');
  contenedorVideos.classList.add('contenedor-videos');
  contenedorVideos.dataset.id = id;

  btnAgregarVideo.addEventListener('click', () => {
    overlayVideo.classList.remove('hidden');
    inputLink.value = '';
    preview.classList.add('hidden');
    overlayVideo.dataset.targetId = id;
  });

  details.appendChild(summary);
  details.appendChild(contenedorVideos);
  details.appendChild(btnAgregarVideo);
  contenedorApartados.appendChild(details);
}

btnAbrir.addEventListener('click', (e) => {
  e.stopPropagation();
  overlay.classList.remove('hidden');
});

cancelar.addEventListener('click', () => {
  overlay.classList.add('hidden');
  input.value = '';
});

guardar.addEventListener('click', () => {
  const titulo = input.value.trim();
  if (titulo !== '') {
    const id = crypto.randomUUID();
    crearApartado(titulo, id);

    let apartados = JSON.parse(localStorage.getItem('apartados')) || [];
    apartados.push({ titulo, id });
    localStorage.setItem('apartados', JSON.stringify(apartados));

    input.value = '';
    overlay.classList.add('hidden');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const apartados = JSON.parse(localStorage.getItem('apartados')) || [];
  apartados.forEach(({ titulo, id }) => crearApartado(titulo, id));

  // Cargar videos guardados en BD
  fetch('http://localhost:3000/api/videos')
    .then(res => {
      if (!res.ok) throw new Error('No se pudieron cargar los videos');
      return res.json();
    })
    .then(videos => {
      videos.forEach(video => {
        const tarjeta = document.createElement('a');
        tarjeta.href = video.link;
        tarjeta.target = "_blank";
        tarjeta.innerHTML = `
          <div class="tarjeta">
            <img src="https://img.youtube.com/vi/${video.id}/maxresdefault.jpg" class="tarjetaimg">
            <div class="texto">
              <span class="titulovideo">${video.titulo}</span>
              <span class="canalvideo">${video.canal}</span>
            </div>
            <div class="btn rojo">Eliminar</div>
          </div>
        `;
        const contenedor = document.querySelector(`.contenedor-videos[data-id="${video.apartadoId}"]`);
        if (contenedor) contenedor.appendChild(tarjeta);
      });
    })
    .catch(err => console.error('Error al cargar videos:', err));
});

cancelarVideo.addEventListener('click', () => {
  overlayVideo.classList.add('hidden');
});

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

guardarVideo.addEventListener('click', () => {
  const link = inputLink.value.trim();
  const idVideo = obtenerID(link);
  if (!idVideo) return;

  const targetId = overlayVideo.dataset.targetId;
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

  const contenedor = document.querySelector(`.contenedor-videos[data-id="${targetId}"]`);
  if (contenedor) contenedor.appendChild(tarjeta);

  fetch('http://localhost:3000/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: idVideo,
      titulo: previewTitulo.textContent,
      canal: previewCanal.textContent,
      link: `https://www.youtube.com/watch?v=${idVideo}`,
      apartadoId: targetId
    })
  })
  .then(async res => {
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        throw new Error(data.error || 'Error desconocido');
      } else {
        const text = await res.text();
        throw new Error(text);
      }
    }
    console.log("✅ Video guardado");
  })
  .catch(err => console.error("❌ Error al guardar:", err));

  overlayVideo.classList.add('hidden');
});

function obtenerID(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}
