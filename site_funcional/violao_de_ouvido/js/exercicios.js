/* ===== Motor de som ===== */
let contextoAudio = null;

function tocarNota(frequencia, duracao, volume) {
  if (!contextoAudio) {
    contextoAudio = new(window.AudioContext || window.webkitAudioContext)();
  }
  duracao = duracao || 1;
  volume = volume || 0.4;
  
  const oscilador = contextoAudio.createOscillator();
  const ganho = contextoAudio.createGain();
  const agora = contextoAudio.currentTime;
  
  oscilador.type = "triangle";
  oscilador.frequency.value = frequencia;
  
  ganho.gain.setValueAtTime(volume, agora);
  ganho.gain.exponentialRampToValueAtTime(0.001, agora + duracao);
  
  oscilador.connect(ganho);
  ganho.connect(contextoAudio.destination);
  
  oscilador.start(agora);
  oscilador.stop(agora + duracao);
}

/* ===== Dados: notas e frequências (Hz) ===== */
const NOTAS = [
  { nome: "Dó", freq: 261.63 },
  { nome: "Ré", freq: 293.66 },
  { nome: "Mi", freq: 329.63 },
  { nome: "Fá", freq: 349.23 },
  { nome: "Sol", freq: 392.00 },
  { nome: "Lá", freq: 440.00 },
  { nome: "Si", freq: 493.88 }
];

/* ===== Teclado de notas ===== */
function criarTeclado() {
  const area = document.getElementById("teclado");
  if (!area) return;
  
  NOTAS.forEach(function(nota) {
    const botao = document.createElement("button");
    botao.className = "tecla";
    botao.textContent = nota.nome;
    botao.addEventListener("click", function() {
      tocarNota(nota.freq, 1);
    });
    area.appendChild(botao);
  });
}

/* ===== Exercício: subiu ou desceu? ===== */
let rodada = null;
let acertos = 0;
let tentativas = 0;

function sortearNota() {
  return NOTAS[Math.floor(Math.random() * NOTAS.length)];
}

function ouvirRodada() {
  if (!rodada) {
    let a = sortearNota();
    let b = sortearNota();
    while (b === a) {
      b = sortearNota();
    }
    rodada = { primeira: a, segunda: b };
  }
  tocarNota(rodada.primeira.freq, 0.8);
  setTimeout(function() {
    tocarNota(rodada.segunda.freq, 0.8);
  }, 900);
}

function responder(palpite) {
  const resultado = document.getElementById("resultado");
  if (!rodada) {
    resultado.textContent = "Toque em Ouvir primeiro.";
    return;
  }
  
  const subiu = rodada.segunda.freq > rodada.primeira.freq;
  const correto = (palpite === "sobe") === subiu;
  
  tentativas++;
  if (correto) acertos++;
  
  resultado.textContent = (correto ? "✔ Acertou! " : "✘ Errou. ") +
    rodada.primeira.nome + " → " + rodada.segunda.nome;
  document.getElementById("placar").textContent = acertos + " / " + tentativas;
  
  rodada = null;
}

function iniciarExercicioSubiuDesceu() {
  const ouvir = document.getElementById("btn-ouvir");
  if (!ouvir) return;
  
  ouvir.addEventListener("click", ouvirRodada);
  document.getElementById("btn-sobe").addEventListener("click", function() {
    responder("sobe");
  });
  document.getElementById("btn-desce").addEventListener("click", function() {
    responder("desce");
  });
}

/* ===== Cordas do violão (afinação padrão, Hz) ===== */
const CORDAS = [
  { numero: 6, nome: "Mi", freq: 82.41 },
  { numero: 5, nome: "Lá", freq: 110.00 },
  { numero: 4, nome: "Ré", freq: 146.83 },
  { numero: 3, nome: "Sol", freq: 196.00 },
  { numero: 2, nome: "Si", freq: 246.94 },
  { numero: 1, nome: "Mi", freq: 329.63 }
];

function criarCordas() {
  const area = document.getElementById("cordas");
  if (!area) return;
  
  const info = document.getElementById("info-corda");
  
  CORDAS.forEach(function(corda) {
    const botao = document.createElement("button");
    botao.className = "corda";
    botao.textContent = corda.numero + "ª corda — " + corda.nome;
    botao.addEventListener("click", function() {
      tocarNota(corda.freq, 2);
      info.textContent = corda.numero + "ª corda: " + corda.nome +
        " (" + corda.freq + " Hz)";
    });
    area.appendChild(botao);
  });
}

/* ===== Exercício: qual corda é essa? ===== */
let cordaSorteada = null;
let acertosCorda = 0;
let tentativasCorda = 0;

function ouvirCorda() {
  if (!cordaSorteada) {
    cordaSorteada = CORDAS[Math.floor(Math.random() * CORDAS.length)];
  }
  tocarNota(cordaSorteada.freq, 2);
}

function responderCorda(numero) {
  const resultado = document.getElementById("resultado-corda");
  if (!cordaSorteada) {
    resultado.textContent = "Toque em Ouvir corda primeiro.";
    return;
  }
  
  tentativasCorda++;
  if (numero === cordaSorteada.numero) {
    acertosCorda++;
    resultado.textContent = "✔ Acertou! Era a " + cordaSorteada.numero + "ª corda.";
  } else {
    resultado.textContent = "✘ Errou. Era a " + cordaSorteada.numero + "ª corda (" + cordaSorteada.nome + ").";
  }
  document.getElementById("placar-corda").textContent = acertosCorda + " / " + tentativasCorda;
  cordaSorteada = null;
}

function iniciarExercicioCordas() {
  const ouvir = document.getElementById("btn-ouvir-corda");
  if (!ouvir) return;
  
  ouvir.addEventListener("click", ouvirCorda);
  
  const opcoes = document.getElementById("opcoes-corda");
  CORDAS.forEach(function(corda) {
    const b = document.createElement("button");
    b.className = "botao";
    b.textContent = corda.numero + "ª";
    b.addEventListener("click", function() {
      responderCorda(corda.numero);
    });
    opcoes.appendChild(b);
  });
}
/* ===== Braço do violão ===== */
const NOMES_NOTAS = ["Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá", "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si"];
const SEMITOM_CORDA = { 6: 4, 5: 9, 4: 2, 3: 7, 2: 11, 1: 4 };
const TOTAL_CASAS = 5;

function notaNaCasa(corda, casa) {
  return {
    nome: NOMES_NOTAS[(SEMITOM_CORDA[corda.numero] + casa) % 12],
    freq: corda.freq * Math.pow(2, casa / 12)
  };
}

let alvoNota = null;
let acertosNota = 0;
let tentativasNota = 0;

function cliqueCasa(corda, casa) {
  const nota = notaNaCasa(corda, casa);
  tocarNota(nota.freq, 1.5);
  
  document.getElementById("info-casa").textContent =
    corda.numero + "ª corda, casa " + casa + ": " + nota.nome;
  
  if (aoClicarCasa) aoClicarCasa(corda, casa, nota);
  
  if (!alvoNota) return;
  
  const resultado = document.getElementById("resultado-nota");
  tentativasNota++;
  
  if (nota.nome === alvoNota) {
    acertosNota++;
    resultado.textContent = "✔ Isso! " + alvoNota + " está na " + corda.numero + "ª corda, casa " + casa + ".";
    alvoNota = null;
    document.getElementById("alvo-nota").textContent = "—";
  } else {
    resultado.textContent = "✘ Essa é " + nota.nome + ". Tente de novo!";
  }
  document.getElementById("placar-nota").textContent = acertosNota + " / " + tentativasNota;
}

function criarBraco() {
  const area = document.getElementById("braco");
  if (!area) return;
  
  const tabela = document.createElement("table");
  tabela.className = "braco";
  
  // Cabeçalho com o número das casas
  const cabecalho = document.createElement("tr");
  cabecalho.appendChild(document.createElement("th"));
  for (let casa = 0; casa <= TOTAL_CASAS; casa++) {
    const th = document.createElement("th");
    th.textContent = casa === 0 ? "Solta" : casa;
    cabecalho.appendChild(th);
  }
  tabela.appendChild(cabecalho);
  
  // Uma linha por corda (da 1ª, de cima, até a 6ª)
  CORDAS.slice().reverse().forEach(function(corda) {
    const linha = document.createElement("tr");
    
    const rotulo = document.createElement("th");
    rotulo.textContent = corda.numero + "ª";
    linha.appendChild(rotulo);
    
    for (let casa = 0; casa <= TOTAL_CASAS; casa++) {
      const td = document.createElement("td");
      const botao = document.createElement("button");
      botao.className = "casa";
      botao.textContent = notaNaCasa(corda, casa).nome;
      botao.addEventListener("click", function() {
        cliqueCasa(corda, casa);
      });
      td.appendChild(botao);
      linha.appendChild(td);
    }
    tabela.appendChild(linha);
  });
  
  area.appendChild(tabela);
}

function novoAlvoNota() {
  const sorteada = NOMES_NOTAS[Math.floor(Math.random() * NOMES_NOTAS.length)];
  alvoNota = sorteada;
  document.getElementById("alvo-nota").textContent = sorteada;
  document.getElementById("resultado-nota").textContent = "";
}

function iniciarExercicioBraco() {
  const botaoNova = document.getElementById("btn-nova-nota");
  if (!botaoNova) return;
  botaoNova.addEventListener("click", novoAlvoNota);
}

/* ===== Intervalos ===== */
const INTERVALOS = [
  { nome: "2ª maior", semitons: 2, dica: 'Começo de "Frère Jacques"' },
  { nome: "3ª menor", semitons: 3, dica: 'Começo de "Greensleeves"' },
  { nome: "3ª maior", semitons: 4, dica: 'Começo de "When the Saints Go Marching In"' },
  { nome: "4ª justa", semitons: 5, dica: 'Começo da Marcha Nupcial ("Aí vem a noiva")' },
  { nome: "5ª justa", semitons: 7, dica: "Começo do tema de Star Wars" },
  { nome: "Oitava", semitons: 12, dica: 'Começo de "Over the Rainbow"' }
];

function tocarIntervalo(freqBase, semitons) {
  tocarNota(freqBase, 0.8);
  setTimeout(function() {
    tocarNota(freqBase * Math.pow(2, semitons / 12), 0.8);
  }, 900);
}

function criarReferenciaIntervalos() {
  const area = document.getElementById("lista-intervalos");
  if (!area) return;
  
  INTERVALOS.forEach(function(item) {
    const bloco = document.createElement("div");
    bloco.className = "item-intervalo";
    
    const texto = document.createElement("span");
    texto.innerHTML = "<strong>" + item.nome + "</strong> (" + item.semitons +
      " semitons)<br><small>" + item.dica + "</small>";
    
    const botao = document.createElement("button");
    botao.className = "botao";
    botao.textContent = "▶";
    botao.addEventListener("click", function() {
      tocarIntervalo(NOTAS[0].freq, item.semitons); // exemplo sempre a partir do Dó
    });
    
    bloco.appendChild(texto);
    bloco.appendChild(botao);
    area.appendChild(bloco);
  });
}

/* ===== Exercício: que intervalo é esse? ===== */
let intervaloAtual = null;
let acertosIntervalo = 0;
let tentativasIntervalo = 0;

function ouvirIntervalo() {
  if (!intervaloAtual) {
    const item = INTERVALOS[Math.floor(Math.random() * INTERVALOS.length)];
    const base = NOTAS[Math.floor(Math.random() * NOTAS.length)];
    intervaloAtual = { item: item, freqBase: base.freq };
  }
  tocarIntervalo(intervaloAtual.freqBase, intervaloAtual.item.semitons);
}

function responderIntervalo(nome) {
  const resultado = document.getElementById("resultado-intervalo");
  if (!intervaloAtual) {
    resultado.textContent = "Toque em Ouvir intervalo primeiro.";
    return;
  }
  
  tentativasIntervalo++;
  if (nome === intervaloAtual.item.nome) {
    acertosIntervalo++;
    resultado.textContent = "✔ Acertou! Era uma " + intervaloAtual.item.nome + ".";
  } else {
    resultado.textContent = "✘ Errou. Era uma " + intervaloAtual.item.nome + ".";
  }
  document.getElementById("placar-intervalo").textContent =
    acertosIntervalo + " / " + tentativasIntervalo;
  intervaloAtual = null;
}

function iniciarExercicioIntervalos() {
  const ouvir = document.getElementById("btn-ouvir-intervalo");
  if (!ouvir) return;
  
  ouvir.addEventListener("click", ouvirIntervalo);
  
  const opcoes = document.getElementById("opcoes-intervalo");
  INTERVALOS.forEach(function(item) {
    const b = document.createElement("button");
    b.className = "botao";
    b.textContent = item.nome;
    b.addEventListener("click", function() {
      responderIntervalo(item.nome);
    });
    opcoes.appendChild(b);
  });
}

/* ===== Escala de Mi maior ===== */
const FREQ_MI = 329.63;
const ESCALA_MI = [
  { grau: 1, nome: "Mi", semitons: 0 },
  { grau: 2, nome: "Fá#", semitons: 2 },
  { grau: 3, nome: "Sol#", semitons: 4 },
  { grau: 4, nome: "Lá", semitons: 5 },
  { grau: 5, nome: "Si", semitons: 7 },
  { grau: 6, nome: "Dó#", semitons: 9 },
  { grau: 7, nome: "Ré#", semitons: 11 },
  { grau: 8, nome: "Mi", semitons: 12 }
];

function freqEscala(item) {
  return FREQ_MI * Math.pow(2, item.semitons / 12);
}

function tocarEscala(subindo) {
  const sequencia = subindo ? ESCALA_MI : ESCALA_MI.slice().reverse();
  sequencia.forEach(function(item, i) {
    setTimeout(function() {
      tocarNota(freqEscala(item), 0.6);
    }, i * 500);
  });
}

function criarNotasEscala() {
  const area = document.getElementById("escala-mi");
  if (!area) return;
  
  ESCALA_MI.forEach(function(item) {
    const botao = document.createElement("button");
    botao.className = "tecla";
    botao.textContent = item.grau + " · " + item.nome;
    botao.addEventListener("click", function() {
      tocarNota(freqEscala(item), 1);
    });
    area.appendChild(botao);
  });
  
  document.getElementById("btn-subir").addEventListener("click", function() {
    tocarEscala(true);
  });
  document.getElementById("btn-descer").addEventListener("click", function() {
    tocarEscala(false);
  });
  document.getElementById("btn-marcar").addEventListener("click", alternarMarcacaoEscala);
}

function alternarMarcacaoEscala() {
  const nomes = ESCALA_MI.map(function(item) {
    return item.nome;
  });
  document.querySelectorAll("#braco .casa").forEach(function(casa) {
    if (nomes.indexOf(casa.textContent) !== -1) {
      casa.classList.toggle("na-escala");
    }
  });
}

/* ===== Exercício: qual grau é esse? ===== */
let grauAtual = null;
let acertosGrau = 0;
let tentativasGrau = 0;

function ouvirGrau() {
  if (!grauAtual) {
    grauAtual = ESCALA_MI[Math.floor(Math.random() * 7)]; // graus 1 a 7
  }
  tocarNota(FREQ_MI, 0.8); // referência: Mi
  setTimeout(function() {
    tocarNota(freqEscala(grauAtual), 0.8);
  }, 900);
}

function responderGrau(numero) {
  const resultado = document.getElementById("resultado-grau");
  if (!grauAtual) {
    resultado.textContent = "Toque em Ouvir nota primeiro.";
    return;
  }
  
  tentativasGrau++;
  if (numero === grauAtual.grau) {
    acertosGrau++;
    resultado.textContent = "✔ Acertou! Era o grau " + grauAtual.grau + " (" + grauAtual.nome + ").";
  } else {
    resultado.textContent = "✘ Errou. Era o grau " + grauAtual.grau + " (" + grauAtual.nome + ").";
  }
  document.getElementById("placar-grau").textContent = acertosGrau + " / " + tentativasGrau;
  grauAtual = null;
}

function iniciarExercicioGrau() {
  const ouvir = document.getElementById("btn-ouvir-grau");
  if (!ouvir) return;
  
  ouvir.addEventListener("click", ouvirGrau);
  
  const opcoes = document.getElementById("opcoes-grau");
  for (let g = 1; g <= 7; g++) {
    const b = document.createElement("button");
    b.className = "botao";
    b.textContent = g;
    b.addEventListener("click", function() {
      responderGrau(g);
    });
    opcoes.appendChild(b);
  }
}

/* ===== Primeiros exercícios ===== */
let aoClicarCasa = null;

/* --- Exercício 1: nota misteriosa --- */
let notaMisteriosa = null;
let acertosMist = 0;
let tentativasMist = 0;

function ouvirMisteriosa() {
  if (!notaMisteriosa) {
    const corda = CORDAS[Math.floor(Math.random() * CORDAS.length)];
    const casa = Math.floor(Math.random() * (TOTAL_CASAS + 1));
    notaMisteriosa = notaNaCasa(corda, casa);
  }
  tocarNota(notaMisteriosa.freq, 1.5);
  document.getElementById("resultado-misteriosa").textContent =
    "Agora procure essa nota no braço.";
}

function verificarMisteriosa(corda, casa, nota) {
  if (!notaMisteriosa) return;
  
  const resultado = document.getElementById("resultado-misteriosa");
  tentativasMist++;
  
  if (nota.nome === notaMisteriosa.nome) {
    acertosMist++;
    resultado.textContent = "✔ Achou! Era " + notaMisteriosa.nome + ".";
    notaMisteriosa = null;
  } else if (nota.freq > notaMisteriosa.freq) {
    resultado.textContent = "✘ Essa é mais AGUDA que a nota misteriosa. Tente mais grave.";
  } else {
    resultado.textContent = "✘ Essa é mais GRAVE que a nota misteriosa. Tente mais aguda.";
  }
  document.getElementById("placar-misteriosa").textContent =
    acertosMist + " / " + tentativasMist;
}

function mostrarDicaMisteriosa() {
  const resultado = document.getElementById("resultado-misteriosa");
  if (!notaMisteriosa) {
    resultado.textContent = "Toque em Ouvir nota primeiro.";
    return;
  }
  resultado.textContent = "Dica: a nota é " + notaMisteriosa.nome + ".";
}

function alternarNomesBraco() {
  document.getElementById("braco").classList.toggle("braco-oculto");
}

function iniciarExercicioMisteriosa() {
  const ouvir = document.getElementById("btn-ouvir-misteriosa");
  if (!ouvir) return;
  
  aoClicarCasa = verificarMisteriosa;
  ouvir.addEventListener("click", ouvirMisteriosa);
  document.getElementById("btn-dica-misteriosa").addEventListener("click", mostrarDicaMisteriosa);
  document.getElementById("btn-nomes").addEventListener("click", alternarNomesBraco);
}

/* --- Exercício 2: repita a sequência --- */
let sequenciaAlvo = [];
let posicaoSequencia = 0;
let acertosSequencia = 0;
let rodadasSequencia = 0;

function ouvirSequencia() {
  if (sequenciaAlvo.length === 0) {
    for (let i = 0; i < 3; i++) {
      sequenciaAlvo.push(NOTAS[Math.floor(Math.random() * NOTAS.length)]);
    }
  }
  posicaoSequencia = 0;
  sequenciaAlvo.forEach(function(nota, i) {
    setTimeout(function() {
      tocarNota(nota.freq, 0.7);
    }, i * 800);
  });
  document.getElementById("resultado-sequencia").textContent =
    "Agora repita no teclado, na mesma ordem.";
}

function clicarTeclaSequencia(nota) {
  tocarNota(nota.freq, 0.7);
  
  const resultado = document.getElementById("resultado-sequencia");
  if (sequenciaAlvo.length === 0) {
    resultado.textContent = "Toque em Ouvir sequência primeiro.";
    return;
  }
  
  if (nota.nome === sequenciaAlvo[posicaoSequencia].nome) {
    posicaoSequencia++;
    if (posicaoSequencia === sequenciaAlvo.length) {
      acertosSequencia++;
      rodadasSequencia++;
      resultado.textContent = "✔ Perfeito! Você repetiu a sequência toda.";
      sequenciaAlvo = [];
    }
  } else {
    rodadasSequencia++;
    const nomes = sequenciaAlvo.map(function(n) {
      return n.nome;
    });
    resultado.textContent = "✘ Errou. A sequência era: " + nomes.join(" – ");
    sequenciaAlvo = [];
  }
  document.getElementById("placar-sequencia").textContent =
    acertosSequencia + " / " + rodadasSequencia;
}

function iniciarExercicioSequencia() {
  const ouvir = document.getElementById("btn-ouvir-sequencia");
  if (!ouvir) return;
  
  ouvir.addEventListener("click", ouvirSequencia);
  
  const area = document.getElementById("teclado-sequencia");
  NOTAS.forEach(function(nota) {
    const botao = document.createElement("button");
    botao.className = "tecla";
    botao.textContent = nota.nome;
    botao.addEventListener("click", function() {
      clicarTeclaSequencia(nota);
    });
    area.appendChild(botao);
  });
}

/* ===== Melodias ===== */
const MELODIAS = [
  { nome: "Frère Jacques", graus: [1, 2, 3, 1, 1, 2, 3, 1, 3, 4, 5, 3, 4, 5] },
  { nome: "Brilha, brilha, estrelinha", graus: [1, 1, 5, 5, 6, 6, 5, 4, 4, 3, 3, 2, 2, 1] },
  { nome: "Ode à Alegria", graus: [3, 3, 4, 5, 5, 4, 3, 2, 1, 1, 2, 3, 3, 2, 2] }
];

function intervaloEntreNotas() {
  const bpm = Number(document.getElementById("andamento").value);
  return 60000 / bpm; // milissegundos por nota
}

function tocarMelodia(melodia, limite) {
  const passo = intervaloEntreNotas();
  const graus = melodia.graus.slice(0, limite || melodia.graus.length);
  
  graus.forEach(function(grau, i) {
    setTimeout(function() {
      tocarNota(freqEscala(ESCALA_MI[grau - 1]), (passo / 1000) * 0.9);
    }, i * passo);
  });
}

/* --- Biblioteca e andamento --- */
let melodiaPasso = null;
let indicePasso = 0;

function escolherPasso(melodia) {
  melodiaPasso = melodia;
  indicePasso = 0;
  document.getElementById("titulo-passo").textContent = melodia.nome;
  document.getElementById("info-passo").textContent = "Toque em Próxima nota para começar.";
}

function criarBibliotecaMelodias() {
  const area = document.getElementById("lista-melodias");
  if (!area) return;
  
  const slider = document.getElementById("andamento");
  const rotulo = document.getElementById("valor-andamento");
  slider.addEventListener("input", function() {
    rotulo.textContent = slider.value + " bpm";
  });
  
  MELODIAS.forEach(function(melodia) {
    const bloco = document.createElement("div");
    bloco.className = "item-intervalo";
    
    const texto = document.createElement("span");
    texto.innerHTML = "<strong>" + melodia.nome + "</strong><br><small>Graus: " +
      melodia.graus.join(" ") + "</small>";
    
    const acoes = document.createElement("span");
    
    const ouvir = document.createElement("button");
    ouvir.className = "botao";
    ouvir.textContent = "▶";
    ouvir.addEventListener("click", function() {
      tocarMelodia(melodia);
    });
    
    const passo = document.createElement("button");
    passo.className = "botao";
    passo.textContent = "👣";
    passo.addEventListener("click", function() {
      escolherPasso(melodia);
    });
    
    acoes.appendChild(ouvir);
    acoes.appendChild(passo);
    bloco.appendChild(texto);
    bloco.appendChild(acoes);
    area.appendChild(bloco);
  });
}

/* --- Passo a passo --- */
function proximaNota() {
  const info = document.getElementById("info-passo");
  if (!melodiaPasso) {
    info.textContent = "Escolha uma melodia na lista (botão 👣) primeiro.";
    return;
  }
  if (indicePasso >= melodiaPasso.graus.length) {
    info.textContent = "Fim da melodia! Toque em Reiniciar para repetir.";
    return;
  }
  
  const item = ESCALA_MI[melodiaPasso.graus[indicePasso] - 1];
  tocarNota(freqEscala(item), 1);
  
  const casa = item.semitons === 0 ? "corda solta" : "casa " + item.semitons;
  info.textContent = "Nota " + (indicePasso + 1) + " de " + melodiaPasso.graus.length +
    ": " + item.nome + " — 1ª corda, " + casa;
  indicePasso++;
}

function reiniciarPasso() {
  indicePasso = 0;
  if (melodiaPasso) {
    document.getElementById("info-passo").textContent = "Reiniciado. Toque em Próxima nota.";
  }
}

/* --- Exercício: que melodia é essa? --- */
let melodiaSorteada = null;
let acertosMelodia = 0;
let tentativasMelodia = 0;

function ouvirMelodiaSorteada() {
  if (!melodiaSorteada) {
    melodiaSorteada = MELODIAS[Math.floor(Math.random() * MELODIAS.length)];
  }
  tocarMelodia(melodiaSorteada, 6); // só o começo
}

function responderMelodia(nome) {
  const resultado = document.getElementById("resultado-melodia");
  if (!melodiaSorteada) {
    resultado.textContent = "Toque em Ouvir trecho primeiro.";
    return;
  }
  
  tentativasMelodia++;
  if (nome === melodiaSorteada.nome) {
    acertosMelodia++;
    resultado.textContent = "✔ Acertou! Era " + melodiaSorteada.nome + ".";
  } else {
    resultado.textContent = "✘ Errou. Era " + melodiaSorteada.nome + ".";
  }
  document.getElementById("placar-melodia").textContent =
    acertosMelodia + " / " + tentativasMelodia;
  melodiaSorteada = null;
}

function iniciarMelodias() {
  const proxima = document.getElementById("btn-proxima");
  if (!proxima) return;
  
  proxima.addEventListener("click", proximaNota);
  document.getElementById("btn-reiniciar-passo").addEventListener("click", reiniciarPasso);
  document.getElementById("btn-ouvir-melodia").addEventListener("click", ouvirMelodiaSorteada);
  
  const opcoes = document.getElementById("opcoes-melodia");
  MELODIAS.forEach(function(melodia) {
    const b = document.createElement("button");
    b.className = "botao";
    b.textContent = melodia.nome;
    b.addEventListener("click", function() {
      responderMelodia(melodia.nome);
    });
    opcoes.appendChild(b);
  });
}

/* ===== Ritmo ===== */

/* --- Metrônomo --- */
let metronomoId = null;
let batidaAtual = 0;

function bpmMetronomo() {
  return Number(document.getElementById("bpm-metronomo").value);
}

function tempoPorCompasso() {
  return Number(document.getElementById("compasso").value);
}

function montarBolinhas() {
  const area = document.getElementById("bolinhas");
  area.innerHTML = "";
  for (let i = 0; i < tempoPorCompasso(); i++) {
    const bolinha = document.createElement("span");
    bolinha.className = "bolinha";
    area.appendChild(bolinha);
  }
}

function darBatida() {
  const bolinhas = document.querySelectorAll("#bolinhas .bolinha");
  bolinhas.forEach(function(b) {
    b.classList.remove("ativa");
  });
  if (bolinhas[batidaAtual]) bolinhas[batidaAtual].classList.add("ativa");
  
  tocarNota(batidaAtual === 0 ? 1200 : 800, 0.08); // 1ª batida mais aguda
  batidaAtual = (batidaAtual + 1) % tempoPorCompasso();
}

function pararMetronomo() {
  clearInterval(metronomoId);
  metronomoId = null;
  document.getElementById("btn-metronomo").textContent = "▶ Iniciar";
  document.querySelectorAll("#bolinhas .bolinha").forEach(function(b) {
    b.classList.remove("ativa");
  });
}

function iniciarMetronomo() {
  clearInterval(metronomoId);
  batidaAtual = 0;
  darBatida();
  metronomoId = setInterval(darBatida, 60000 / bpmMetronomo());
  document.getElementById("btn-metronomo").textContent = "⏹ Parar";
}

function alternarMetronomo() {
  if (metronomoId) {
    pararMetronomo();
  } else {
    iniciarMetronomo();
  }
}

/* --- Padrões rítmicos (8 passos = colcheias em 4/4) --- */
const PADROES = [
  { nome: "Pulso", passos: [1, 0, 1, 0, 1, 0, 1, 0] },
  { nome: "Contínuo", passos: [1, 1, 1, 1, 1, 1, 1, 1] },
  { nome: "Com pausas", passos: [1, 0, 1, 1, 1, 0, 1, 1] },
  { nome: "Tresillo (3+3+2)", passos: [1, 0, 0, 1, 0, 0, 1, 0] }
];

function desenharPadrao(padrao) {
  return padrao.passos.map(function(p) {
    return p ? "●" : "·";
  }).join(" ");
}

function tocarPadrao(padrao) {
  const passo = 60000 / bpmMetronomo() / 2; // duração de uma colcheia
  padrao.passos.forEach(function(ativo, i) {
    if (ativo) {
      setTimeout(function() {
        tocarNota(i === 0 ? 1200 : 800, 0.1);
      }, i * passo);
    }
  });
}

function criarListaPadroes() {
  const area = document.getElementById("lista-padroes");
  if (!area) return;
  
  PADROES.forEach(function(padrao) {
    const bloco = document.createElement("div");
    bloco.className = "item-intervalo";
    
    const texto = document.createElement("span");
    texto.innerHTML = "<strong>" + padrao.nome + "</strong><br><span class=\"desenho\">" +
      desenharPadrao(padrao) + "</span>";
    
    const botao = document.createElement("button");
    botao.className = "botao";
    botao.textContent = "▶";
    botao.addEventListener("click", function() {
      tocarPadrao(padrao);
    });
    
    bloco.appendChild(texto);
    bloco.appendChild(botao);
    area.appendChild(bloco);
  });
}

/* --- Exercício: que padrão é esse? --- */
let padraoSorteado = null;
let acertosPadrao = 0;
let tentativasPadrao = 0;

function ouvirPadraoSorteado() {
  if (!padraoSorteado) {
    padraoSorteado = PADROES[Math.floor(Math.random() * PADROES.length)];
  }
  tocarPadrao(padraoSorteado);
}

function responderPadrao(nome) {
  const resultado = document.getElementById("resultado-padrao");
  if (!padraoSorteado) {
    resultado.textContent = "Toque em Ouvir padrão primeiro.";
    return;
  }
  
  tentativasPadrao++;
  if (nome === padraoSorteado.nome) {
    acertosPadrao++;
    resultado.textContent = "✔ Acertou! Era " + padraoSorteado.nome + ".";
  } else {
    resultado.textContent = "✘ Errou. Era " + padraoSorteado.nome + ": " +
      desenharPadrao(padraoSorteado);
  }
  document.getElementById("placar-padrao").textContent =
    acertosPadrao + " / " + tentativasPadrao;
  padraoSorteado = null;
}

/* --- Tap tempo --- */
let toques = [];

function registrarToque() {
  const agora = Date.now();
  if (toques.length > 0 && agora - toques[toques.length - 1] > 2000) {
    toques = []; // pausa longa: recomeça
  }
  toques.push(agora);
  if (toques.length > 6) toques.shift();
  
  tocarNota(800, 0.05);
  
  const info = document.getElementById("info-tap");
  if (toques.length < 2) {
    info.textContent = "Continue batendo...";
    return;
  }
  const media = (toques[toques.length - 1] - toques[0]) / (toques.length - 1);
  info.textContent = "Seu andamento: " + Math.round(60000 / media) + " bpm";
}

/* --- Ligações da página --- */
function iniciarRitmo() {
  const botao = document.getElementById("btn-metronomo");
  if (!botao) return;
  
  const slider = document.getElementById("bpm-metronomo");
  const rotulo = document.getElementById("valor-bpm");
  
  montarBolinhas();
  botao.addEventListener("click", alternarMetronomo);
  
  slider.addEventListener("input", function() {
    rotulo.textContent = slider.value + " bpm";
    if (metronomoId) iniciarMetronomo(); // aplica o novo andamento na hora
  });
  
  document.getElementById("compasso").addEventListener("change", function() {
    montarBolinhas();
    batidaAtual = 0;
    if (metronomoId) iniciarMetronomo();
  });
  
  document.getElementById("btn-ouvir-padrao").addEventListener("click", ouvirPadraoSorteado);
  const opcoes = document.getElementById("opcoes-padrao");
  PADROES.forEach(function(padrao) {
    const b = document.createElement("button");
    b.className = "botao";
    b.textContent = padrao.nome;
    b.addEventListener("click", function() {
      responderPadrao(padrao.nome);
    });
    opcoes.appendChild(b);
  });
  
  document.getElementById("btn-tap").addEventListener("click", registrarToque);
}

/* ===== Acordes ===== */

/* casas: da 6ª para a 1ª corda; null = corda abafada (não tocar) */
const ACORDES = [
  { nome: "Mi maior", cifra: "E", casas: [0, 2, 2, 1, 0, 0] },
  { nome: "Lá maior", cifra: "A", casas: [null, 0, 2, 2, 2, 0] },
  { nome: "Ré maior", cifra: "D", casas: [null, null, 0, 2, 3, 2] },
  { nome: "Sol maior", cifra: "G", casas: [3, 2, 0, 0, 0, 3] },
  { nome: "Dó maior", cifra: "C", casas: [null, 3, 2, 0, 1, 0] },
  { nome: "Mi menor", cifra: "Em", casas: [0, 2, 2, 0, 0, 0] },
  { nome: "Lá menor", cifra: "Am", casas: [null, 0, 2, 2, 1, 0] },
  { nome: "Ré menor", cifra: "Dm", casas: [null, null, 0, 2, 3, 1] },
  { nome: "Si com sétima", cifra: "B7", casas: [null, 2, 1, 2, 0, 2] }
];

function tocarAcorde(acorde) {
  acorde.casas.forEach(function(casa, i) {
    if (casa === null) return;
    const freq = CORDAS[i].freq * Math.pow(2, casa / 12);
    setTimeout(function() {
      tocarNota(freq, 2, 0.15);
    }, i * 90); // dedilhado da 6ª para a 1ª corda
  });
}

function mostrarAcorde(acorde) {
  document.getElementById("detalhe-acorde").textContent =
    acorde.nome + " (" + acorde.cifra + ")";
  
  document.getElementById("cifra-acorde").textContent = acorde.casas.map(function(c) {
    return c === null ? "x" : c;
  }).join(" ");
  
  const partes = acorde.casas.map(function(casa, i) {
    const numero = CORDAS[i].numero + "ª";
    if (casa === null) return numero + ": abafada";
    return numero + ": " + (casa === 0 ? "solta" : "casa " + casa);
  });
  document.getElementById("detalhe-casas").textContent = partes.join(" · ");
}

/* --- Construa um acorde --- */
function notasDoAcorde(indiceRaiz, menor) {
  const terca = menor ? 3 : 4;
  return [0, terca, 7].map(function(semitons) {
    return {
      nome: NOMES_NOTAS[(indiceRaiz + semitons) % 12],
      freq: 261.63 * Math.pow(2, (indiceRaiz + semitons) / 12)
    };
  });
}

function tocarTriade(notas, arpejo) {
  notas.forEach(function(nota, i) {
    setTimeout(function() {
      tocarNota(nota.freq, 1.8, 0.2);
    }, arpejo ? i * 400 : 0);
  });
}

function tocarAcordeConstruido(arpejo) {
  const raiz = Number(document.getElementById("raiz-acorde").value);
  const menor = document.getElementById("qualidade-acorde").value === "menor";
  const notas = notasDoAcorde(raiz, menor);
  
  document.getElementById("notas-acorde").textContent =
    NOMES_NOTAS[raiz] + (menor ? " menor" : " maior") + ": " +
    notas.map(function(n) { return n.nome; }).join(" + ");
  
  tocarTriade(notas, arpejo);
}

/* --- Exercício: maior ou menor? --- */
let triadeAtual = null;
let acertosTriade = 0;
let tentativasTriade = 0;

function ouvirTriade() {
  if (!triadeAtual) {
    triadeAtual = {
      raiz: Math.floor(Math.random() * 12),
      menor: Math.random() < 0.5
    };
  }
  tocarTriade(notasDoAcorde(triadeAtual.raiz, triadeAtual.menor), false);
}

function responderTriade(palpiteMenor) {
  const resultado = document.getElementById("resultado-triade");
  if (!triadeAtual) {
    resultado.textContent = "Toque em Ouvir acorde primeiro.";
    return;
  }
  
  tentativasTriade++;
  const nome = NOMES_NOTAS[triadeAtual.raiz] + (triadeAtual.menor ? " menor" : " maior");
  if (palpiteMenor === triadeAtual.menor) {
    acertosTriade++;
    resultado.textContent = "✔ Acertou! Era " + nome + ".";
  } else {
    resultado.textContent = "✘ Errou. Era " + nome + ".";
  }
  document.getElementById("placar-triade").textContent =
    acertosTriade + " / " + tentativasTriade;
  triadeAtual = null;
}

/* --- Ligações da página --- */
function iniciarAcordes() {
  const lista = document.getElementById("lista-acordes");
  if (!lista) return;
  
  ACORDES.forEach(function(acorde) {
    const botao = document.createElement("button");
    botao.className = "tecla";
    botao.textContent = acorde.cifra;
    botao.addEventListener("click", function() {
      tocarAcorde(acorde);
      mostrarAcorde(acorde);
    });
    lista.appendChild(botao);
  });
  
  const seletor = document.getElementById("raiz-acorde");
  NOMES_NOTAS.forEach(function(nome, i) {
    const opcao = document.createElement("option");
    opcao.value = i;
    opcao.textContent = nome;
    seletor.appendChild(opcao);
  });
  
  document.getElementById("btn-junto").addEventListener("click", function() {
    tocarAcordeConstruido(false);
  });
  document.getElementById("btn-arpejo").addEventListener("click", function() {
    tocarAcordeConstruido(true);
  });
  
  document.getElementById("btn-ouvir-triade").addEventListener("click", ouvirTriade);
  document.getElementById("btn-maior").addEventListener("click", function() {
    responderTriade(false);
  });
  document.getElementById("btn-menor").addEventListener("click", function() {
    responderTriade(true);
  });
}

/* ===== Progressões ===== */
const PROGRESSOES = [
  { nome: "I – IV – V – I", acordes: ["E", "A", "B7", "E"],
    descricao: "A sequência mais clássica: sai de casa (I), passa pelo IV e pelo V e volta." },
  { nome: "I – V – IV – I", acordes: ["E", "B7", "A", "E"],
    descricao: "O V vem antes do IV, e o caminho de volta soa diferente." },
  { nome: "I – IV – I – V", acordes: ["E", "A", "E", "B7"],
    descricao: "Termina no V, o que dá sensação de pergunta sem resposta." },
  { nome: "i – iv – V – i", acordes: ["Em", "Am", "B7", "Em"],
    descricao: "Versão em Mi menor, de clima mais sombrio." },
  { nome: "Blues de 12 compassos",
    acordes: ["E", "E", "E", "E", "A", "A", "E", "E", "B7", "A", "E", "B7"],
    descricao: "A estrutura do blues tradicional, em Mi.",
    exercicio: false }
];

const PROGRESSOES_EX = PROGRESSOES.filter(function (p) {
  return p.exercicio !== false;
});

function acordePorCifra(cifra) {
  return ACORDES.find(function (a) {
    return a.cifra === cifra;
  });
}

/* --- Faixa que mostra os acordes --- */
function montarPalco(acordes) {
  const palco = document.getElementById("palco-progressao");
  palco.innerHTML = "";
  acordes.forEach(function (cifra) {
    const caixa = document.createElement("span");
    caixa.className = "caixa-acorde";
    caixa.textContent = cifra;
    palco.appendChild(caixa);
  });
}

function destacarAcorde(indice) {
  document.querySelectorAll("#palco-progressao .caixa-acorde").forEach(function (caixa, i) {
    caixa.classList.toggle("ativa", i === indice);
  });
}

/* --- Tocar uma progressão --- */
let temporizadoresProg = [];

function pararProgressao() {
  temporizadoresProg.forEach(function (id) {
    clearTimeout(id);
  });
  temporizadoresProg = [];
  destacarAcorde(-1);
}

function tocarProgressao(acordes, mostrarPalco) {
  pararProgressao();
  if (mostrarPalco) montarPalco(acordes);

  const bpm = Number(document.getElementById("bpm-prog").value);
  const intervalo = (2 * 60000) / bpm; // 2 batidas por acorde

  acordes.forEach(function (cifra, i) {
    const id = setTimeout(function () {
      tocarAcorde(acordePorCifra(cifra));
      if (mostrarPalco) destacarAcorde(i);
    }, i * intervalo);
    temporizadoresProg.push(id);
  });

  if (mostrarPalco) {
    temporizadoresProg.push(setTimeout(function () {
      destacarAcorde(-1);
    }, acordes.length * intervalo));
  }
}

/* --- Exercício: qual progressão é essa? --- */
let progSorteada = null;
let acertosProg = 0;
let tentativasProg = 0;

function ouvirProgSorteada() {
  if (!progSorteada) {
    progSorteada = PROGRESSOES_EX[Math.floor(Math.random() * PROGRESSOES_EX.length)];
  }
  tocarProgressao(progSorteada.acordes, false);
}

function responderProg(nome) {
  const resultado = document.getElementById("resultado-prog");
  if (!progSorteada) {
    resultado.textContent = "Toque em Ouvir progressão primeiro.";
    return;
  }

  tentativasProg++;
  if (nome === progSorteada.nome) {
    acertosProg++;
    resultado.textContent = "✔ Acertou! Era " + progSorteada.nome + " (" +
      progSorteada.acordes.join(" – ") + ").";
  } else {
    resultado.textContent = "✘ Errou. Era " + progSorteada.nome + " (" +
      progSorteada.acordes.join(" – ") + ").";
  }
  document.getElementById("placar-prog").textContent = acertosProg + " / " + tentativasProg;
  progSorteada = null;
}

/* --- Monte a sua --- */
let minhaProg = [];

function atualizarMinhaProg() {
  document.getElementById("minha-prog").textContent =
    minhaProg.length > 0 ? minhaProg.join(" – ") : "Nenhum acorde ainda.";
}

/* --- Ligações da página --- */
function iniciarProgressoes() {
  const lista = document.getElementById("lista-progressoes");
  if (!lista) return;

  const slider = document.getElementById("bpm-prog");
  const rotulo = document.getElementById("valor-bpm-prog");
  slider.addEventListener("input", function () {
    rotulo.textContent = slider.value + " bpm";
  });

  PROGRESSOES.forEach(function (prog) {
    const bloco = document.createElement("div");
    bloco.className = "item-intervalo";

    const texto = document.createElement("span");
    texto.innerHTML = "<strong>" + prog.nome + "</strong><br><small>" +
      prog.acordes.join(" · ") + "<br>" + prog.descricao + "</small>";

    const botao = document.createElement("button");
    botao.className = "botao";
    botao.textContent = "▶";
    botao.addEventListener("click", function () {
      tocarProgressao(prog.acordes, true);
    });

    bloco.appendChild(texto);
    bloco.appendChild(botao);
    lista.appendChild(bloco);
  });

  document.getElementById("btn-ouvir-prog").addEventListener("click", ouvirProgSorteada);
  const opcoes = document.getElementById("opcoes-prog");
  PROGRESSOES_EX.forEach(function (prog) {
    const b = document.createElement("button");
    b.className = "botao";
    b.textContent = prog.nome;
    b.addEventListener("click", function () {
      responderProg(prog.nome);
    });
    opcoes.appendChild(b);
  });

  const botoes = document.getElementById("botoes-acordes");
  ACORDES.forEach(function (acorde) {
    const b = document.createElement("button");
    b.className = "tecla";
    b.textContent = acorde.cifra;
    b.addEventListener("click", function () {
      if (minhaProg.length >= 8) return;
      minhaProg.push(acorde.cifra);
      atualizarMinhaProg();
    });
    botoes.appendChild(b);
  });

  document.getElementById("btn-tocar-minha").addEventListener("click", function () {
    if (minhaProg.length === 0) return;
    tocarProgressao(minhaProg, false);
  });
  document.getElementById("btn-limpar-minha").addEventListener("click", function () {
    minhaProg = [];
    atualizarMinhaProg();
    pararProgressao();
  });
}

/* ===== Treino auditivo ===== */
const TOTAL_PERGUNTAS = 10;
const CHAVE_MELHOR = "violao_melhor_treino";

function sortearIndice(tamanho) {
  return Math.floor(Math.random() * tamanho);
}

/* Cada tipo sabe gerar uma pergunta no mesmo formato */
const TIPOS_TREINO = {
  intervalo: {
    rotulo: "Intervalos",
    pagina: "intervalos.html",
    gerar: function() {
      const item = INTERVALOS[sortearIndice(INTERVALOS.length)];
      const base = NOTAS[sortearIndice(NOTAS.length)];
      return {
        enunciado: "Que intervalo é esse?",
        opcoes: INTERVALOS.map(function(i) { return i.nome; }),
        correta: item.nome,
        tocar: function() { tocarIntervalo(base.freq, item.semitons); }
      };
    }
  },
  
  triade: {
    rotulo: "Acordes maiores e menores",
    pagina: "acordes.html",
    gerar: function() {
      const raiz = sortearIndice(12);
      const menor = Math.random() < 0.5;
      const notas = notasDoAcorde(raiz, menor);
      return {
        enunciado: "Esse acorde é maior ou menor?",
        opcoes: ["Maior", "Menor"],
        correta: menor ? "Menor" : "Maior",
        tocar: function() { tocarTriade(notas, false); }
      };
    }
  },
  
  grau: {
    rotulo: "Graus da escala",
    pagina: "escalas.html",
    gerar: function() {
      const item = ESCALA_MI[sortearIndice(7)];
      return {
        enunciado: "Qual grau da escala de Mi é essa nota? (O Mi toca primeiro, como referência.)",
        opcoes: ["1", "2", "3", "4", "5", "6", "7"],
        correta: String(item.grau),
        tocar: function() {
          tocarNota(FREQ_MI, 0.8);
          setTimeout(function() {
            tocarNota(freqEscala(item), 0.8);
          }, 900);
        }
      };
    }
  },
  
  direcao: {
    rotulo: "Notas agudas e graves",
    pagina: "fundamentos.html",
    gerar: function() {
      const a = NOTAS[sortearIndice(NOTAS.length)];
      let b = NOTAS[sortearIndice(NOTAS.length)];
      while (b === a) {
        b = NOTAS[sortearIndice(NOTAS.length)];
      }
      return {
        enunciado: "A segunda nota subiu ou desceu?",
        opcoes: ["Subiu", "Desceu"],
        correta: b.freq > a.freq ? "Subiu" : "Desceu",
        tocar: function() {
          tocarNota(a.freq, 0.8);
          setTimeout(function() {
            tocarNota(b.freq, 0.8);
          }, 900);
        }
      };
    }
  }
};

/* --- Estado da sessão --- */
let treino = null;

function mostrarMelhorTreino() {
  let melhor = null;
  try {
    melhor = localStorage.getItem(CHAVE_MELHOR);
  } catch (erro) {
    melhor = null;
  }
  document.getElementById("melhor-treino").textContent =
    melhor === null ? "—" : melhor + " / " + TOTAL_PERGUNTAS;
}

function atualizarStatusTreino() {
  document.getElementById("status-treino").textContent =
    "Pergunta " + treino.numero + " de " + TOTAL_PERGUNTAS +
    " · Acertos: " + treino.acertos +
    " · Sequência: " + treino.sequencia;
}

function proximaPerguntaTreino() {
  if (treino.numero >= TOTAL_PERGUNTAS) {
    terminarTreino();
    return;
  }
  
  const categoria = document.getElementById("categoria-treino").value;
  const chaves = categoria === "misto" ? Object.keys(TIPOS_TREINO) : [categoria];
  const chave = chaves[sortearIndice(chaves.length)];
  
  const pergunta = TIPOS_TREINO[chave].gerar();
  pergunta.tipo = chave;
  treino.pergunta = pergunta;
  treino.numero++;
  treino.respondida = false;
  
  document.getElementById("enunciado-treino").textContent = pergunta.enunciado;
  document.getElementById("feedback-treino").textContent = "";
  document.getElementById("btn-proxima-treino").classList.add("oculto");
  
  const area = document.getElementById("opcoes-treino");
  area.innerHTML = "";
  pergunta.opcoes.forEach(function(texto) {
    const b = document.createElement("button");
    b.className = "botao";
    b.textContent = texto;
    b.addEventListener("click", function() {
      responderTreino(texto, b);
    });
    area.appendChild(b);
  });
  
  atualizarStatusTreino();
  pergunta.tocar();
}

function responderTreino(texto, botaoClicado) {
  if (!treino.pergunta || treino.respondida) return;
  treino.respondida = true;
  
  const certo = texto === treino.pergunta.correta;
  const tipo = treino.pergunta.tipo;
  
  const estatistica = treino.porTipo[tipo] || { acertos: 0, total: 0 };
  estatistica.total++;
  
  if (certo) {
    treino.acertos++;
    treino.sequencia++;
    estatistica.acertos++;
    if (treino.sequencia > treino.melhorSequencia) {
      treino.melhorSequencia = treino.sequencia;
    }
  } else {
    treino.sequencia = 0;
  }
  treino.porTipo[tipo] = estatistica;
  
  document.querySelectorAll("#opcoes-treino button").forEach(function(b) {
    b.disabled = true;
    if (b.textContent === treino.pergunta.correta) b.classList.add("certa");
  });
  if (!certo) botaoClicado.classList.add("errada");
  
  const feedback = document.getElementById("feedback-treino");
  if (certo) {
    feedback.textContent = treino.sequencia >= 3 ?
      "✔ Correto! 🔥 Sequência de " + treino.sequencia + "!" :
      "✔ Correto!";
  } else {
    feedback.textContent = "✘ A resposta era: " + treino.pergunta.correta;
  }
  
  const proxima = document.getElementById("btn-proxima-treino");
  proxima.textContent = treino.numero >= TOTAL_PERGUNTAS ? "Ver resultado" : "Próxima pergunta";
  proxima.classList.remove("oculto");
  atualizarStatusTreino();
}

function terminarTreino() {
  document.getElementById("jogo-treino").classList.add("oculto");
  document.getElementById("final-treino").classList.remove("oculto");
  
  const percentual = Math.round((treino.acertos / TOTAL_PERGUNTAS) * 100);
  let mensagem;
  if (percentual >= 90) {
    mensagem = "Ouvido afiado! Você está pronto para tirar músicas de ouvido.";
  } else if (percentual >= 70) {
    mensagem = "Muito bom! Mais um pouco de treino e fica excelente.";
  } else if (percentual >= 50) {
    mensagem = "Bom caminho! Repita as páginas de estudo e tente de novo.";
  } else {
    mensagem = "Continue treinando! O ouvido se desenvolve com repetição.";
  }
  
  let melhor = 0;
  let recorde = false;
  try {
    melhor = Number(localStorage.getItem(CHAVE_MELHOR)) || 0;
    if (treino.acertos > melhor) {
      localStorage.setItem(CHAVE_MELHOR, String(treino.acertos));
      melhor = treino.acertos;
      recorde = true;
    }
  } catch (erro) {
    melhor = treino.acertos;
  }
  
  document.getElementById("resumo-treino").textContent =
    "Você acertou " + treino.acertos + " de " + TOTAL_PERGUNTAS + " (" + percentual +
    "%). Melhor sequência: " + treino.melhorSequencia + ". Melhor pontuação: " +
    melhor + " / " + TOTAL_PERGUNTAS + (recorde ? " 🏆 novo recorde!" : ".");
  document.getElementById("mensagem-treino").textContent = mensagem;
  
  // Descobre o ponto mais fraco
  let pior = null;
  let menorTaxa = 1;
  Object.keys(treino.porTipo).forEach(function(chave) {
    const e = treino.porTipo[chave];
    const taxa = e.acertos / e.total;
    if (taxa < menorTaxa) {
      menorTaxa = taxa;
      pior = chave;
    }
  });
  
  const sugestao = document.getElementById("sugestao-treino");
  sugestao.textContent = "";
  if (pior === null) {
    sugestao.textContent = "Nenhum ponto fraco desta vez. Parabéns!";
  } else {
    sugestao.textContent = "Ponto a revisar: " + TIPOS_TREINO[pior].rotulo + ". ";
    const link = document.createElement("a");
    link.href = TIPOS_TREINO[pior].pagina;
    link.textContent = "Ir para a página";
    sugestao.appendChild(link);
  }
}

function comecarTreino() {
  treino = {
    pergunta: null,
    numero: 0,
    acertos: 0,
    sequencia: 0,
    melhorSequencia: 0,
    respondida: false,
    porTipo: {}
  };
  document.getElementById("config-treino").classList.add("oculto");
  document.getElementById("final-treino").classList.add("oculto");
  document.getElementById("jogo-treino").classList.remove("oculto");
  proximaPerguntaTreino();
}

function voltarConfigTreino() {
  document.getElementById("final-treino").classList.add("oculto");
  document.getElementById("config-treino").classList.remove("oculto");
  mostrarMelhorTreino();
}

function iniciarPaginaTreino() {
  const iniciar = document.getElementById("btn-iniciar-treino");
  if (!iniciar) return;
  
  mostrarMelhorTreino();
  iniciar.addEventListener("click", comecarTreino);
  document.getElementById("btn-repetir-treino").addEventListener("click", function() {
    if (treino && treino.pergunta) treino.pergunta.tocar();
  });
  document.getElementById("btn-proxima-treino").addEventListener("click", proximaPerguntaTreino);
  document.getElementById("btn-novo-treino").addEventListener("click", voltarConfigTreino);
}

/* ===== Inicialização ===== */
document.addEventListener("DOMContentLoaded", function() {
  criarTeclado();
  iniciarExercicioSubiuDesceu();
  criarCordas();
  iniciarExercicioCordas();
  criarBraco();
  iniciarExercicioBraco();
  criarReferenciaIntervalos();
  iniciarExercicioIntervalos();
  criarNotasEscala();
  iniciarExercicioGrau();
  iniciarExercicioMisteriosa();
  iniciarExercicioSequencia();
  criarBibliotecaMelodias();
  iniciarMelodias();
  criarListaPadroes();
  iniciarRitmo();
  iniciarAcordes();
  iniciarProgressoes();
  iniciarPaginaTreino()
});