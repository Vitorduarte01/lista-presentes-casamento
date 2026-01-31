import { db } from "./firebase.js";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const container = document.getElementById("lista-presentes");

// ===== 1 presente por sessão =====
const SESSION_KEY = "presente_escolhido_id";

function jaEscolheuNaSessao() {
    return !!sessionStorage.getItem(SESSION_KEY);
}

function setEscolhaSessao(id) {
    sessionStorage.setItem(SESSION_KEY, id);
}

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

function normalizarUrl(url) {
  const u = (url || "").trim().replace(/\s+/g, "");
  if (!u) return "";
  return u.startsWith("http") ? u : `https://${u}`;
}

/* ---------- caixa: ir para a loja ---------- */
function mostrarCaixaCompra(url) {
  // remove se já existir alguma aberta
  const old = document.getElementById("caixa-compra");
  if (old) old.remove();

  const box = document.createElement("div");
  box.id = "caixa-compra";
  box.className = "caixa-compra";

  box.innerHTML = `
    <div class="caixa-compra-box">
      <h3>Presente reservado! 💝</h3>
      <p>Agora é só finalizar a compra na loja:</p>

      <a 
        class="btn btn-confirmar"
        href="${url}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ir para a loja
      </a>
    </div>
  `;

  document.body.classList.add("modal-open");
  document.body.appendChild(box);
}

/* ---------- render ---------- */
function renderAgrupado(presentes) {
  container.innerHTML = "";

  // aviso topo (se já escolheu na sessão)
  if (jaEscolheuNaSessao()) {
    const aviso = document.createElement("div");
    aviso.className = "aviso-sessao";
    aviso.textContent =
      "✅ Você já escolheu um presente nesta sessão. Obrigado! (Se foi sem querer, feche e abra o navegador ou use uma aba anônima.)";
    container.appendChild(aviso);
  }

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

      // padrão final: usa SOMENTE "reservado"
      const reservado = item.reservado === true;
      const disponivel = !reservado;

      const link = normalizarUrl(item.link);
      const temLink = link.length > 0;

      const imagemLimpa = (item.imagem || "").replace(/\s+/g, "");
      const temImagem = imagemLimpa.length > 0;

      const bloqueadoSessao = jaEscolheuNaSessao(); // trava tudo se já escolheu

      const podeClicar = disponivel && temLink && !bloqueadoSessao;

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
            class="btn ${podeClicar ? "btn-ativo" : "btn-desativado"}"
            ${podeClicar ? "" : "disabled"}
          >
            ${
              bloqueadoSessao
                ? "Você já escolheu"
                : (disponivel ? "Escolher presente" : "Indisponível")
            }
          </button>
        </div>
      `;

      const botao = card.querySelector("button");

      if (podeClicar) {
        botao.addEventListener("click", async () => {
          const confirmar = confirm(
            `Você confirma a escolha deste presente?\n\n${item.nome}\n\nDepois disso ele ficará indisponível.`
          );
          if (!confirmar) return;

          try {
            botao.disabled = true;
            botao.textContent = "Reservando...";

            const ref = doc(db, "presentes", id);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
              alert("Esse presente não existe mais.");
              carregarPresentes();
              return;
            }

            const dados = snap.data();
            if (dados.reservado === true) {
              alert("Alguém já escolheu esse presente.");
              carregarPresentes();
              return;
            }

            // reserva no Firebase
            await updateDoc(ref, { reservado: true });

            // trava sessão
            setEscolhaSessao(id);

            // ✅ NÃO abre automaticamente
            // ✅ abre a caixa com o botão
            mostrarCaixaCompra(link);

            // atualiza lista (botões ficam travados)
            carregarPresentes();
          } catch (e) {
            alert("Erro ao reservar. Tente novamente.");
            carregarPresentes();
          }
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