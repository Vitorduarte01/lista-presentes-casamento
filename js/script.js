// Modelo final: quando ela mandar a lista, você só preenche aqui.
const presentes = [{
        nome: "Conjunto de Panelas",
        preco: "", // ex: "R$ 399,90" (opcional)
        imagem: "https://images.unsplash.com/photo-1586201375761-83865001e17b",
        link: "" // ex: "https://www.mercadolivre.com.br/..."
    },
    {
        nome: "Air Fryer",
        preco: "",
        imagem: "https://images.unsplash.com/photo-1617191519400-38b05b6b8f9f",
        link: ""
    },
    {
        nome: "Jogo de Cama",
        preco: "",
        imagem: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
        link: ""
    }
];

const container = document.getElementById("lista-presentes");

function render() {
    container.innerHTML = "";

    presentes.forEach((item) => {
                const temLink = item.link && item.link.trim().length > 0;

                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" loading="lazy">
      <div class="info">
        <p class="nome">${item.nome}</p>
        ${item.preco ? `<p class="preco">${item.preco}</p>` : ""}
        <button class="btn ${temLink ? "btn-ativo" : "btn-desativado"}" ${temLink ? "" : "disabled"}>
          Ver presente
        </button>
      </div>
    `;

    // Só abre link se existir
    if (temLink) {
      card.querySelector("button").addEventListener("click", () => {
        window.open(item.link, "_blank", "noopener,noreferrer");
      });
    }

    container.appendChild(card);
  });
}

render();