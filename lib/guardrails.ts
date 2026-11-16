// Alerta vermelho: mensagens sobre fazer mal a si próprio ou a outros.
// Estas mensagens nunca chegam ao modelo; o servidor responde com RESPOSTA_VERMELHA.
//
// shortcut: lista de expressões, não percebe contexto nem apanha formas indiretas
// ("já não aguento mais"); para esses casos conta a secção "Alerta vermelho" do
// prompt. Trocar por um classificador se a app tiver utilizadores a sério.

// Verbo na primeira pessoa que mostra intenção: "quero", "vou", "apetece-me"...
// Sem isto, "a minha mãe vai matar-me" disparava o alerta.
const EU =
  "(?:quero|queria|vou|ia|devia|tentei|tentar|apetece[- ]me|penso em|pensei em|pensar em|vontade de|preciso de)(?:[- ]me)?";

const EXPRESSOES = [
  "saudades",
  "o tempo",
  "a fome",
  "a sede",
  "o bicho",
  "de vergonha",
  "de fome",
  "de riso",
  "de rir",
  "de sono",
  "de tedio",
  "de calor",
  "de frio",
  "de medo",
  "de saudades",
  "de cansaco",
].join("|");
const NAO_E_EXPRESSAO = `(?!(?:[- ]me)? (?:${EXPRESSOES}))`;

const VERMELHO = [
  // a si próprio
  /suicid/,
  new RegExp(`\\b${EU} (?:matar|morrer|desaparecer)${NAO_E_EXPRESSAO}`),
  /\b(?:mato[- ]me|me mato)\b/,
  /\bnao (?:quero|queria|consigo|vale a pena) (?:mais |continuar a )?viver\b/,
  /\b(?:acabar|terminar) com (?:a minha vida|tudo|isto tudo)\b/,
  /\b(?:por fim a|tirar a) minha vida\b/,
  /\bmelhor sem mim\b/,
  /\bauto[- ]?(?:mutil|lesa|lesoes|agress)/,
  /\b(?:cortar|corto|magoar|magoo|ferir|firo|aleijar|aleijo|queimar|queimo)[- ]me\b/,
  /\bme (?:cortar|corto|magoar|magoo|ferir|aleijar|queimar)\b/,
  /\bcortar os pulsos\b/,
  /\b(?:fazer|faco)[- ]me mal\b/,
  /\b(?:fazer mal a mim|me fazer mal)\b/,
  /\boverdose\b/,
  // a outros
  new RegExp(`\\b${EU} (?:[oa]s? |lhes? )?(?:matar|esfaquear|espancar|envenenar)${NAO_E_EXPRESSAO}`),
  /\b(?:mata|esfaquea|espanca|envenena|magoa)[- ]l[oa]s?\b/,
  new RegExp(`\\b${EU} (?:fazer mal a|fazer[- ]lhes? mal|magoar (?:alguem|ele|ela|eles|elas|[oa]s? ))`),
  /\b(?:dar|dou)[- ]lhes? um tiro\b/,
  /\blevar uma (?:faca|arma|pistola) para a escola\b/,
  // inglês
  /\bkill (?:myself|him|her|them|you|someone)\b/,
  /\b(?:hurt|harm|cut|hurting|harming|cutting) myself\b/,
  /\bself[- ]?harm/,
  /\bwant to die\b/,
  /\bend my life\b/,
];

export function alertaVermelho(texto: string): boolean {
  const limpo = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
  return VERMELHO.some((padrao) => padrao.test(limpo));
}

// Em OpenUI Lang, só com Texto: sem exercícios, memes nem sugestões.
export const RESPOSTA_VERMELHA = `root = Resposta([t1, t2, t3, t4])
t1 = Texto("O que escreveste é sério, e ainda bem que o disseste. Mereces falar já com uma pessoa que te possa ouvir e ajudar de verdade. Eu sou só um programa e não consigo fazer isso por ti.")
t2 = Texto("Se tu ou outra pessoa estiverem em perigo agora, liga 112.")
t3 = Texto("Para falar com alguém: SNS 24, 808 24 24 24 (aconselhamento psicológico, a qualquer hora), ou SOS Voz Amiga, 213 544 545.")
t4 = Texto("Se puderes, conta também a um adulto ou a alguém em quem confies. Não fiques sozinho com isto.")`;
