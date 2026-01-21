const presentes = [{
        nome: "Conjunto de Panelas",
        imagem: "https://images.unsplash.com/photo-1586201375761-83865001e17b"
    },
    {
        nome: "Air Fryer",
        imagem: "https://images.unsplash.com/photo-1617191519400-38b05b6b8f9f"
    },
    {
        nome: "Cafeteira",
        imagem: "https://images.unsplash.com/photo-1509042239860-f550ce710b93"
    },
    {
        nome: "Jogo de Jantar",
        imagem: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
    },
    {
        nome: "Jogo de Cama",
        imagem: "https://images.unsplash.com/photo-1615874959474-d609969a20ed"
    },
    {
        nome: "Conjunto de Taças",
        imagem: "https://images.unsplash.com/photo-1510627498534-cf7e9002facc"
    },
    {
        nome: "Liquidificador",
        imagem: "https://images.unsplash.com/photo-1586201375761-83865001e17b"
    },
    {
        nome: "Aspirador de Pó",
        imagem: "https://images.unsplash.com/photo-1581578731548-c64695cc6952"
    }
];

const container = document.getElementById("lista-presentes");

presentes.forEach(item => {
    container.innerHTML += `
    <div class="card">
      <img src="${item.imagem}" alt="${item.nome}">
      <p>${item.nome}</p>
      <button class="btn-disabled">Ver presente</button>
    </div>
  `;
});