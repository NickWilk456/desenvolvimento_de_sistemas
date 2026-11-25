const PAGINAS = [
  { id: "inicio", arq: "index.html", titulo: "Início" },
  { id: "fundamentos", arq: "paginas/fundamentos.html", titulo: "Ouvido musical" },
  { id: "violao", arq: "paginas/conhecendo-violao.html", titulo: "Conhecendo o violão" },
  { id: "notas", arq: "paginas/notas.html", titulo: "Notas" },
  { id: "intervalos", arq: "paginas/intervalos.html", titulo: "Intervalos" },
  { id: "escalas", arq: "paginas/escalas.html", titulo: "Escalas" },
  { id: "exercicios", arq: "paginas/exercicios.html", titulo: "Primeiros exercícios" },
  { id: "melodias", arq: "paginas/melodias.html", titulo: "Melodias" },
  { id: "ritmo", arq: "paginas/ritmo.html", titulo: "Ritmo" },
  { id: "acordes", arq: "paginas/acordes.html", titulo: "Acordes" },
  { id: "progressoes", arq: "paginas/progressoes.html", titulo: "Progressões" },
  { id: "treino", arq: "paginas/treino.html", titulo: "Treino auditivo" },
  { id: "afinacao", arq: "paginas/afinacao-api.html", titulo: "API de afinação" },
  { id: "musicas", arq: "paginas/musicas-api.html", titulo: "API de músicas" },
  { id: "teoria", arq: "paginas/teoria-api.html", titulo: "API de teoria" }
];

function montarMenu() {
  const nav = document.getElementById("menu");
  if (!nav) return;
  
  const raiz = document.body.dataset.raiz || "";
  const atual = document.body.dataset.pagina;
  
  const botao = document.createElement("button");
  botao.id = "botao-menu";
  botao.textContent = "☰ Menu";
  botao.addEventListener("click", function() {
    nav.classList.toggle("aberto");
  });
  
  const lista = document.createElement("ul");
  PAGINAS.forEach(function(p) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = raiz + p.arq;
    a.textContent = p.titulo;
    if (p.id === atual) a.className = "ativo";
    li.appendChild(a);
    lista.appendChild(li);
  });
  
  nav.appendChild(botao);
  nav.appendChild(lista);
}

document.addEventListener("DOMContentLoaded", montarMenu);