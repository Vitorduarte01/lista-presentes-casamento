import { db } from "./firebase.js";
import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const container = document.getElementById("lista-presentes");

/* ---------- utils ---------- */
function slugCategoria(nome) {
    return (nome || "Outros")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}

function placeholderSVG() {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420">
      <rect width="100%" height="100%" fill="#f2f2f2"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial" font-size="28" fill="#888">
        Presente
      </text>
    </svg>
  `)}`;
}

/* ---------- render ---------- */
function renderAgrupado(presentes) {
  container.innerHTML = "";

  // agrupa por categoria
  const grupos = {};
  presentes.forEach((p) => {
    const cat = (p.categoria || "Outros").trim();
    if (!grupos[cat]) grupos[cat] = [];
    grupos[cat].push(p);
  });

  // ordena categorias
  const categoriasOrdenadas = Object.keys(grupos).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  categoriasOrdenadas.forEach((cat) => {
    const sec = document.createElement("section");
    sec.className = "categoria";
    sec.id = `cat-${slugCategoria(cat)}`;

    sec.innerHTML = `
      <h2 class="categoria-titulo">${cat}</h2>
      <div class="categoria-grid"></div>
    `;

    const grid = sec.querySelector(".categoria-grid");

    // ordena itens da categoria
    grupos[cat].sort((a, b) =>
      (a.nome || "").localeCompare(b.nome || "", "pt-BR")
    );

    grupos[cat].forEach((item) => {
      const id = item._id;
      const reservado = item.reservado === true;
      const disponivel = !reservado;

      const link = (item.link || "").trim();
      const temLink = link.length > 0;

      const imagemLimpa = (item.imagem || "").replace(/\s+/g, "");
      const temImagem = imagemLimpa.length > 0;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img
          src="${temImagem ? imagemLimpa : placeholderSVG()}"
          alt="${item.nome || "Presente"}"
          loading="lazy"
        >
        <div class="info">
          <p class="nome">${item.nome || ""}</p>

          ${item.especificacoes ? `<p class="voltagem">${item.especificacoes}</p>` : ""}
          ${item.preco ? `<p class="preco">${item.preco}</p>` : ""}

          <button
            class="btn ${disponivel && temLink ? "btn-ativo" : "btn-desativado"}"
            ${disponivel && temLink ? "" : "disabled"}
          >
            ${disponivel ? "Escolher presente" : "Indisponível"}
          </button>
        </div>
      `;

      const botao = card.querySelector("button");

      // clicar: reservar + abrir link
      if (disponivel && temLink) {
        botao.addEventListener("click", async () => {
          await updateDoc(doc(db, "presentes", id), { reservado: true });
          window.open(link, "_blank", "noopener,noreferrer");
          carregarPresentes();
        });
      }

      grid.appendChild(card);
    });

    container.appendChild(sec);
  });
}

/* ---------- load ---------- */
async function carregarPresentes() {
  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "presentes"));

  const presentes = [];
  snapshot.forEach((docSnap) => {
    const item = docSnap.data();
    item._id = docSnap.id;
    presentes.push(item);
  });

  renderAgrupado(presentes);
}

carregarPresentes();