const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let livros = [];
let downloads = JSON.parse(localStorage.getItem('downloads')) || {};

async function carregar() {
    const res = await fetch('livros.json');
    livros = await res.json();

    atualizarStats();
    renderCategorias(livros);
}

function atualizarStats() {
    document.getElementById('totalLivros').innerText =
        livros.length + " livros";

    const total = Object.values(downloads).reduce((a,b)=>a+b,0);
    document.getElementById('totalDownloads').innerText =
        total + " downloads";
}

// AGRUPAR POR CATEGORIA
function agrupar(lista) {
    const grupos = {};
    lista.forEach(l => {
        if (!grupos[l.categoria]) grupos[l.categoria] = [];
        grupos[l.categoria].push(l);
    });
    return grupos;
}

function renderCategorias(lista) {
    const container = document.getElementById('catalogo');
    const grupos = agrupar(lista);

    container.innerHTML = Object.keys(grupos).map(cat => {

        const id = cat.replace(/\s/g, '');

        return `
        <div class="categoria">
            <h2>${cat}</h2>

            <div class="carousel-container">
                <button class="nav-btn left" onclick="scrollCar('${id}', -300)">◀</button>

                <div class="carousel" id="${id}">
                    ${grupos[cat].map((l,i)=>card(l,i)).join('')}
                </div>

                <button class="nav-btn right" onclick="scrollCar('${id}', 300)">▶</button>
            </div>
        </div>
        `;
    }).join('');
}

function card(l,i){
    const id = `pdf-${Math.random()}`;

    setTimeout(()=>thumb(l.url,id),100);

    return `
    <div class="card">
        <canvas id="${id}"></canvas>

        <div class="card-content">
            <strong>${l.titulo}</strong><br>
            <small>${l.autor}</small><br>
            <small>⬇ ${downloads[l.url]||0}</small>

            <div class="actions">
                <a href="${l.url}" target="_blank" class="view">Ver</a>
                <a href="${l.url}" onclick="baixar('${l.url}')" class="download">Baixar</a>
            </div>
        </div>
    </div>
    `;
}

// SCROLL
function scrollCar(id, val){
    document.getElementById(id).scrollBy({left: val});
}

// THUMB
async function thumb(url,id){
    const pdf = await pdfjsLib.getDocument(url).promise;
    const page = await pdf.getPage(1);

    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');

    const vp = page.getViewport({scale:0.6});
    canvas.height = vp.height;
    canvas.width = vp.width;

    await page.render({canvasContext:ctx,viewport:vp}).promise;
}

// DOWNLOAD
function baixar(url){
    downloads[url] = (downloads[url]||0)+1;
    localStorage.setItem('downloads', JSON.stringify(downloads));
    atualizarStats();
}

// BUSCA
document.getElementById('search').addEventListener('input', e=>{
    const t = e.target.value.toLowerCase();

    const filtrados = livros.filter(l =>
        l.titulo.toLowerCase().includes(t) ||
        l.descricao.toLowerCase().includes(t)
    );

    renderCategorias(filtrados);
});

// TEMA
document.getElementById('toggleTheme').onclick = ()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',
        document.body.classList.contains('dark')?'dark':'light');
};

window.onload = ()=>{
    if(localStorage.getItem('theme')==='dark'){
        document.body.classList.add('dark');
    }
};

carregar();
// ... (mantenha o resto do código acima)

async function thumb(url, id) {
    try {
        const canvas = document.getElementById(id);
        if (!canvas) return;

        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        const ctx = canvas.getContext('2d');

        // Aumentando um pouco a qualidade da thumb
        const vp = page.getViewport({ scale: 0.8 });
        canvas.height = vp.height;
        canvas.width = vp.width;

        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        
        // Adiciona efeito de fade após carregar
        canvas.style.opacity = "0";
        canvas.style.transition = "opacity 0.5s ease";
        setTimeout(() => canvas.style.opacity = "1", 50);
        
    } catch (e) {
        console.error("Erro ao gerar thumbnail", e);
    }
}

// Melhore a função de renderização para adicionar um delay cascata suave
function renderCategorias(lista) {
    const container = document.getElementById('catalogo');
    const grupos = agrupar(lista);

    container.innerHTML = Object.keys(grupos).map((cat, index) => {
        const id = cat.replace(/\s/g, '');
        return `
        <div class="categoria" style="animation-delay: ${index * 0.1}s">
            <h2>${cat}</h2>
            <div class="carousel-container">
                <button class="nav-btn left" onclick="scrollCar('${id}', -400)"> <i class="fas fa-chevron-left"></i> </button>
                <div class="carousel" id="${id}">
                    ${grupos[cat].map((l, i) => card(l, i)).join('')}
                </div>
                <button class="nav-btn right" onclick="scrollCar('${id}', 400)"> <i class="fas fa-chevron-right"></i> </button>
            </div>
        </div>
        `;
    }).join('');
}