/* ===== Utilitários ===== */
function textoLimpo(html) {
  // Remove marcações e converte entidades (&quot; etc.) sem executar nada
  return new DOMParser().parseFromString(html, "text/html").body.textContent;
}

/* ===== API de teoria: Wikipédia ===== */
const URL_WIKI_BUSCA = "https://pt.wikipedia.org/w/api.php";
const URL_WIKI_RESUMO = "https://pt.wikipedia.org/api/rest_v1/page/summary/";

const ATALHOS_TEORIA = [
  { rotulo: "Intervalos", termo: "intervalo musical" },
  { rotulo: "Escalas", termo: "escala musical" },
  { rotulo: "Acordes", termo: "acorde musical" },
  { rotulo: "Tonalidade", termo: "tonalidade música" },
  { rotulo: "Andamento", termo: "andamento música" },
  { rotulo: "Compasso", termo: "compasso música" },
  { rotulo: "Violão", termo: "violão" }
];

async function buscarConceitos(termo) {
  const url = URL_WIKI_BUSCA +
    "?action=query&list=search&srlimit=6&format=json&origin=*&srsearch=" +
    encodeURIComponent(termo);
  
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error("A busca falhou (código " + resposta.status + ")");
  }
  const dados = await resposta.json();
  return dados.query.search;
}

async function buscarResumo(titulo) {
  const url = URL_WIKI_RESUMO + encodeURIComponent(titulo.replace(/ /g, "_"));
  
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error("O resumo falhou (código " + resposta.status + ")");
  }
  return await resposta.json();
}

async function mostrarResumo(titulo) {
  const area = document.getElementById("resumo-teoria");
  area.textContent = "Carregando resumo...";
  
  try {
    const dados = await buscarResumo(titulo);
    area.textContent = "";
    
    if (dados.thumbnail && dados.thumbnail.source) {
      const imagem = document.createElement("img");
      imagem.src = dados.thumbnail.source;
      imagem.alt = dados.title;
      imagem.className = "miniatura-wiki";
      area.appendChild(imagem);
    }
    
    const h3 = document.createElement("h3");
    h3.textContent = dados.title;
    area.appendChild(h3);
    
    if (dados.description) {
      const descricao = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = dados.description;
      descricao.appendChild(em);
      area.appendChild(descricao);
    }
    
    const texto = document.createElement("p");
    texto.textContent = dados.extract || "Este artigo não tem resumo disponível.";
    area.appendChild(texto);
    
    const endereco = dados.content_urls && dados.content_urls.desktop ?
      dados.content_urls.desktop.page : "";
    if (endereco.indexOf("https://pt.wikipedia.org/") === 0) {
      const link = document.createElement("a");
      link.href = endereco;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Ler o artigo completo na Wikipédia";
      area.appendChild(link);
    }
    
    const fonte = document.createElement("p");
    const pequeno = document.createElement("small");
    pequeno.textContent = "Fonte: Wikipédia, sob licença CC BY-SA.";
    fonte.appendChild(pequeno);
    area.appendChild(fonte);
  } catch (erro) {
    area.textContent = "Não foi possível carregar o resumo agora. Tente de novo. (" + erro.message + ")";
  }
}

async function pesquisarTeoria() {
  const termo = document.getElementById("campo-teoria").value.trim();
  const status = document.getElementById("status-teoria");
  const lista = document.getElementById("resultados-teoria");
  
  if (termo === "") {
    status.textContent = "Digite um termo para pesquisar.";
    return;
  }
  
  status.textContent = "Buscando...";
  lista.textContent = "";
  
  try {
    const resultados = await buscarConceitos(termo);
    
    if (resultados.length === 0) {
      status.textContent = "Nenhum resultado para \"" + termo + "\".";
      return;
    }
    status.textContent = "Toque em um resultado para ler o resumo.";
    
    resultados.forEach(function(item) {
      const botao = document.createElement("button");
      botao.className = "resultado-wiki";
      
      const titulo = document.createElement("strong");
      titulo.textContent = item.title;
      
      const trecho = document.createElement("small");
      trecho.textContent = textoLimpo(item.snippet) + "...";
      
      botao.appendChild(titulo);
      botao.appendChild(document.createElement("br"));
      botao.appendChild(trecho);
      botao.addEventListener("click", function() {
        mostrarResumo(item.title);
      });
      lista.appendChild(botao);
    });
  } catch (erro) {
    status.textContent = "Não foi possível buscar agora. Verifique a internet e tente de novo. (" + erro.message + ")";
  }
}

function iniciarTeoria() {
  const botao = document.getElementById("btn-buscar-teoria");
  if (!botao) return;
  
  botao.addEventListener("click", pesquisarTeoria);
  
  const campo = document.getElementById("campo-teoria");
  campo.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter") pesquisarTeoria();
  });
  
  const atalhos = document.getElementById("atalhos-teoria");
  ATALHOS_TEORIA.forEach(function(atalho) {
    const b = document.createElement("button");
    b.className = "tecla";
    b.textContent = atalho.rotulo;
    b.addEventListener("click", function() {
      campo.value = atalho.termo;
      pesquisarTeoria();
    });
    atalhos.appendChild(b);
  });
}

/* ===== API de músicas: MusicBrainz ===== */
const URL_MUSICBRAINZ = "https://musicbrainz.org/ws/2/recording";
const CHAVE_ESTUDO = "violao_lista_estudo";

const ATALHOS_MUSICA = [
  "Greensleeves",
  "Over the Rainbow",
  "When the Saints Go Marching In",
  "Frère Jacques",
  "Ode to Joy"
];

function nomeDosArtistas(gravacao) {
  const creditos = gravacao["artist-credit"] || [];
  return creditos.map(function(c) {
    return c.name + (c.joinphrase || "");
  }).join("");
}

function formatarDuracao(ms) {
  if (!ms) return "—";
  const total = Math.round(ms / 1000);
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return minutos + ":" + (segundos < 10 ? "0" : "") + segundos;
}

async function buscarMusicas(termo, tipo) {
  const limpo = termo.replace(/["\\]/g, "");
  const campo = tipo === "artista" ? "artist" : "recording";
  const consulta = campo + ':"' + limpo + '"';
  
  const url = URL_MUSICBRAINZ + "?fmt=json&limit=15&query=" + encodeURIComponent(consulta);
  
  const resposta = await fetch(url);
  if (resposta.status === 503) {
    throw new Error("serviço ocupado (503), espere um pouco");
  }
  if (!resposta.ok) {
    throw new Error("código " + resposta.status);
  }
  const dados = await resposta.json();
  return dados.recordings || [];
}

/* --- Lista de estudo (guardada no navegador) --- */
let listaEstudo = [];

function carregarListaEstudo() {
  try {
    const salvo = localStorage.getItem(CHAVE_ESTUDO);
    const lista = salvo ? JSON.parse(salvo) : [];
    listaEstudo = Array.isArray(lista) ? lista : [];
  } catch (erro) {
    listaEstudo = [];
  }
}

function salvarListaEstudo() {
  try {
    localStorage.setItem(CHAVE_ESTUDO, JSON.stringify(listaEstudo));
  } catch (erro) {
    // sem armazenamento disponível: a lista vale só nesta visita
  }
}

function desenharListaEstudo() {
  const area = document.getElementById("lista-estudo");
  area.textContent = "";
  
  if (listaEstudo.length === 0) {
    area.textContent = "Sua lista está vazia. Pesquise e toque em ⭐ para guardar.";
    return;
  }
  
  listaEstudo.forEach(function(item, indice) {
    const bloco = document.createElement("div");
    bloco.className = "item-intervalo";
    
    const texto = document.createElement("span");
    const titulo = document.createElement("strong");
    titulo.textContent = item.titulo;
    const artista = document.createElement("small");
    artista.textContent = item.artista;
    texto.appendChild(titulo);
    texto.appendChild(document.createElement("br"));
    texto.appendChild(artista);
    
    const remover = document.createElement("button");
    remover.className = "botao";
    remover.textContent = "🗑";
    remover.addEventListener("click", function() {
      listaEstudo.splice(indice, 1);
      salvarListaEstudo();
      desenharListaEstudo();
    });
    
    bloco.appendChild(texto);
    bloco.appendChild(remover);
    area.appendChild(bloco);
  });
}

function adicionarAoEstudo(titulo, artista) {
  const jaTem = listaEstudo.some(function(item) {
    return item.titulo === titulo && item.artista === artista;
  });
  if (jaTem) return;
  
  listaEstudo.push({ titulo: titulo, artista: artista });
  salvarListaEstudo();
  desenharListaEstudo();
}

/* --- Resultados --- */
function mostrarMusicas(gravacoes) {
  const area = document.getElementById("resultados-musica");
  area.textContent = "";
  
  const vistos = {};
  const unicas = gravacoes.filter(function(g) {
    const chave = (g.title + "|" + nomeDosArtistas(g)).toLowerCase();
    if (vistos[chave]) return false;
    vistos[chave] = true;
    return true;
  }).slice(0, 8);
  
  unicas.forEach(function(g) {
    const artista = nomeDosArtistas(g);
    const ano = g["first-release-date"] ? g["first-release-date"].substring(0, 4) : "ano ?";
    
    const bloco = document.createElement("div");
    bloco.className = "item-intervalo";
    
    const texto = document.createElement("span");
    const titulo = document.createElement("strong");
    titulo.textContent = g.title;
    const detalhes = document.createElement("small");
    detalhes.textContent = artista + " · " + ano + " · " + formatarDuracao(g.length);
    texto.appendChild(titulo);
    texto.appendChild(document.createElement("br"));
    texto.appendChild(detalhes);
    
    const acoes = document.createElement("span");
    
    const estrela = document.createElement("button");
    estrela.className = "botao";
    estrela.textContent = "⭐";
    estrela.addEventListener("click", function() {
      adicionarAoEstudo(g.title, artista);
    });
    
    const youtube = document.createElement("a");
    youtube.className = "botao";
    youtube.href = "https://www.youtube.com/results?search_query=" +
      encodeURIComponent(g.title + " " + artista);
    youtube.target = "_blank";
    youtube.rel = "noopener";
    youtube.textContent = "▶ YouTube";
    
    acoes.appendChild(estrela);
    acoes.appendChild(youtube);
    bloco.appendChild(texto);
    bloco.appendChild(acoes);
    area.appendChild(bloco);
  });
}

async function pesquisarMusicas() {
  const termo = document.getElementById("campo-musica").value.trim();
  const tipo = document.getElementById("tipo-musica").value;
  const status = document.getElementById("status-musica");
  const botao = document.getElementById("btn-buscar-musica");
  
  if (termo === "") {
    status.textContent = "Digite o nome de uma música ou de um artista.";
    return;
  }
  
  botao.disabled = true; // respeita o limite de 1 chamada por segundo
  status.textContent = "Buscando...";
  document.getElementById("resultados-musica").textContent = "";
  
  try {
    const gravacoes = await buscarMusicas(termo, tipo);
    
    if (gravacoes.length === 0) {
      status.textContent = "Nenhum resultado para \"" + termo + "\".";
    } else {
      status.textContent = "Toque em ⭐ para guardar na sua lista de estudo.";
      mostrarMusicas(gravacoes);
    }
  } catch (erro) {
    status.textContent = "Não foi possível buscar agora. Verifique a internet e tente de novo. (" + erro.message + ")";
  }
  
  setTimeout(function() {
    botao.disabled = false;
  }, 1100);
}

function iniciarMusicas() {
  const botao = document.getElementById("btn-buscar-musica");
  if (!botao) return;
  
  carregarListaEstudo();
  desenharListaEstudo();
  
  botao.addEventListener("click", pesquisarMusicas);
  
  const campo = document.getElementById("campo-musica");
  campo.addEventListener("keydown", function(evento) {
    if (evento.key === "Enter" && !botao.disabled) pesquisarMusicas();
  });
  
  const atalhos = document.getElementById("atalhos-musica");
  ATALHOS_MUSICA.forEach(function(nome) {
    const b = document.createElement("button");
    b.className = "tecla";
    b.textContent = nome;
    b.addEventListener("click", function() {
      if (botao.disabled) return;
      campo.value = nome;
      document.getElementById("tipo-musica").value = "musica";
      pesquisarMusicas();
    });
    atalhos.appendChild(b);
  });
}

/* ===== API de afinação: Web Audio + microfone ===== */
/* Esta página carrega o exercicios.js antes do api.js: usamos CORDAS,
   NOMES_NOTAS e tocarNota que estão lá. */

let afinadorAtivo = false;
let fluxoMic = null;
let contextoMic = null;
let temporizadorAfinador = null;

function formatarHz(freq) {
  return freq.toFixed(2).replace(".", ",") + " Hz";
}

/* --- Detecção de frequência por autocorrelação --- */
function detectarFrequencia(amostras, taxa) {
  const n = amostras.length;
  
  let energia = 0;
  for (let i = 0; i < n; i++) {
    energia += amostras[i] * amostras[i];
  }
  if (Math.sqrt(energia / n) < 0.01) return -1; // silêncio
  
  const lagMin = Math.floor(taxa / 1000); // até 1000 Hz
  const lagMax = Math.floor(taxa / 70); // a partir de 70 Hz
  const corr = new Float32Array(lagMax + 2);
  
  for (let lag = lagMin; lag <= lagMax; lag++) {
    let soma = 0;
    for (let i = 0; i < n - lag; i++) {
      soma += amostras[i] * amostras[i + lag];
    }
    corr[lag] = soma / (n - lag); // normaliza pelo número de termos
  }
  
  let melhor = lagMin;
  for (let lag = lagMin; lag <= lagMax; lag++) {
    if (corr[lag] > corr[melhor]) melhor = lag;
  }
  
  // Prefere o primeiro pico alto, para não pegar múltiplos do período
  const limiar = corr[melhor] * 0.9;
  for (let lag = lagMin + 1; lag < lagMax; lag++) {
    if (corr[lag] > limiar && corr[lag] >= corr[lag - 1] && corr[lag] >= corr[lag + 1]) {
      melhor = lag;
      break;
    }
  }
  
  // Refina com uma parábola entre os três pontos vizinhos
  let lagFino = melhor;
  if (melhor > lagMin && melhor < lagMax) {
    const y1 = corr[melhor - 1];
    const y2 = corr[melhor];
    const y3 = corr[melhor + 1];
    const denominador = y1 - 2 * y2 + y3;
    if (denominador !== 0) {
      lagFino = melhor + (0.5 * (y1 - y3)) / denominador;
    }
  }
  return taxa / lagFino;
}

/* --- Frequência -> nota e corda mais próxima --- */
function frequenciaParaNota(freq) {
  const midi = 69 + 12 * Math.log2(freq / 440);
  const proximo = Math.round(midi);
  return {
    nome: NOMES_NOTAS[((proximo % 12) + 12) % 12],
    oitava: Math.floor(proximo / 12) - 1
  };
}

function cordaMaisProxima(freq) {
  let melhor = null;
  CORDAS.forEach(function(corda) {
    const cents = 1200 * Math.log2(freq / corda.freq);
    if (melhor === null || Math.abs(cents) < Math.abs(melhor.cents)) {
      melhor = { corda: corda, cents: cents };
    }
  });
  return melhor;
}

/* --- Atualização da tela --- */
function atualizarAfinador(freq) {
  const nota = document.getElementById("nota-detectada");
  const detalhe = document.getElementById("freq-detectada");
  const dica = document.getElementById("dica-afinador");
  const ponteiro = document.getElementById("ponteiro");
  
  if (freq < 0 || freq < 60 || freq > 1200) {
    nota.textContent = "—";
    detalhe.textContent = "";
    dica.textContent = "Toque uma corda solta.";
    ponteiro.style.left = "50%";
    return;
  }
  
  const n = frequenciaParaNota(freq);
  nota.textContent = n.nome + n.oitava;
  detalhe.textContent = formatarHz(freq);
  
  const alvo = cordaMaisProxima(freq);
  if (Math.abs(alvo.cents) > 100) {
    dica.textContent = "Essa nota está longe das cordas soltas. Toque uma corda solta.";
    ponteiro.style.left = "50%";
    return;
  }
  
  const limite = Math.max(-50, Math.min(50, alvo.cents));
  ponteiro.style.left = (50 + limite) + "%";
  
  const nome = alvo.corda.numero + "ª corda (" + alvo.corda.nome + ")";
  const centsInteiro = Math.round(alvo.cents);
  if (Math.abs(alvo.cents) <= 5) {
    dica.textContent = "✔ " + nome + " afinada!";
  } else if (alvo.cents > 0) {
    dica.textContent = nome + ": " + centsInteiro + " cents acima. Afrouxe um pouco.";
  } else {
    dica.textContent = nome + ": " + Math.abs(centsInteiro) + " cents abaixo. Aperte um pouco.";
  }
}

/* --- Ligar e desligar o microfone --- */
function pararAfinador() {
  clearInterval(temporizadorAfinador);
  temporizadorAfinador = null;
  
  if (fluxoMic) {
    fluxoMic.getTracks().forEach(function(faixa) {
      faixa.stop();
    });
    fluxoMic = null;
  }
  if (contextoMic) {
    contextoMic.close();
    contextoMic = null;
  }
  
  afinadorAtivo = false;
  document.getElementById("btn-afinador").textContent = "🎤 Ligar afinador";
  document.getElementById("status-afinador").textContent = "Afinador desligado.";
  atualizarAfinador(-1);
}

async function ligarAfinador() {
  const status = document.getElementById("status-afinador");
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    status.textContent = "Este navegador não permite usar o microfone aqui. Abra o site publicado (https) e tente de novo.";
    return;
  }
  
  try {
    fluxoMic = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    
    contextoMic = new(window.AudioContext || window.webkitAudioContext)();
    if (contextoMic.state === "suspended") {
      await contextoMic.resume();
    }
    
    const fonte = contextoMic.createMediaStreamSource(fluxoMic);
    const analisador = contextoMic.createAnalyser();
    analisador.fftSize = 2048;
    fonte.connect(analisador); // não ligamos ao alto-falante, para evitar microfonia
    
    const amostras = new Float32Array(analisador.fftSize);
    afinadorAtivo = true;
    document.getElementById("btn-afinador").textContent = "⏹ Parar afinador";
    status.textContent = "Ouvindo... toque uma corda solta.";
    
    temporizadorAfinador = setInterval(function() {
      analisador.getFloatTimeDomainData(amostras);
      atualizarAfinador(detectarFrequencia(amostras, contextoMic.sampleRate));
    }, 100);
  } catch (erro) {
    if (erro.name === "NotAllowedError") {
      status.textContent = "Permissão do microfone negada. Libere o acesso nas configurações do navegador.";
    } else if (erro.name === "NotFoundError") {
      status.textContent = "Nenhum microfone encontrado neste aparelho.";
    } else {
      status.textContent = "Não foi possível ligar o microfone. (" + erro.message + ")";
    }
  }
}

function alternarAfinador() {
  if (afinadorAtivo) {
    pararAfinador();
  } else {
    ligarAfinador();
  }
}

/* --- Referências e tabela --- */
function criarTabelaFrequencias() {
  const area = document.getElementById("tabela-frequencias");
  const tabela = document.createElement("table");
  tabela.className = "tabela-freq";
  
  const cabecalho = document.createElement("tr");
  ["Nota", "Frequência"].forEach(function(texto) {
    const th = document.createElement("th");
    th.textContent = texto;
    cabecalho.appendChild(th);
  });
  tabela.appendChild(cabecalho);
  
  NOMES_NOTAS.forEach(function(nome, i) {
    const linha = document.createElement("tr");
    const celulaNota = document.createElement("td");
    celulaNota.textContent = nome + "4";
    const celulaFreq = document.createElement("td");
    celulaFreq.textContent = formatarHz(261.63 * Math.pow(2, i / 12));
    linha.appendChild(celulaNota);
    linha.appendChild(celulaFreq);
    tabela.appendChild(linha);
  });
  area.appendChild(tabela);
}

function iniciarAfinacao() {
  const botao = document.getElementById("btn-afinador");
  if (!botao) return;
  
  const area = document.getElementById("referencias-cordas");
  CORDAS.forEach(function(corda) {
    const b = document.createElement("button");
    b.className = "corda";
    b.textContent = corda.numero + "ª corda — " + corda.nome + " — " + formatarHz(corda.freq);
    b.addEventListener("click", function() {
      tocarNota(corda.freq, 3, 0.3);
    });
    area.appendChild(b);
  });
  
  document.getElementById("btn-diapasao").addEventListener("click", function() {
    tocarNota(440, 3, 0.3);
  });
  
  criarTabelaFrequencias();
  botao.addEventListener("click", alternarAfinador);
}

/* ===== Inicialização ===== */
document.addEventListener("DOMContentLoaded", function() {
  iniciarTeoria();
  iniciarMusicas();
  iniciarAfinacao();
});