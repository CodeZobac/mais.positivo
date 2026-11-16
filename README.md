# Lado Positivo

Chatbot de inteligência artificial que responde sempre com positividade e ajuda a olhar para as situações de outras perspetivas. Microprojeto da Academia de Novos Líderes.

Aplicação Next.js (App Router) numa só página. A rota `/api/chat` fala com o DeepSeek no servidor, por isso a chave nunca chega ao browser.

A app abre com um ecrã de entrada (um círculo com um +), pede a aceitação dos termos na primeira visita e não guarda conversas nem pede dados pessoais. Funciona em telemóvel.

## Correr localmente

Precisas do Node.js 20.9 ou superior.

```bash
npm install
cp .env.example .env.local   # e preenche DEEPSEEK_API_KEY
npm run dev
```

Abre http://localhost:3000.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DEEPSEEK_API_KEY` | Sim | Chave criada em https://platform.deepseek.com |
| `DEEPSEEK_MODEL` | Não | Modelo a usar. Por omissão, `deepseek-flash`. |

## Onde mexer

| Ficheiro | O que tem |
|---|---|
| `lib/system-prompt.ts` | A personalidade, as regras do chatbot e o formato das respostas |
| `lib/openui-library.tsx` | Os componentes que o chatbot pode usar nas respostas (OpenUI) |
| `lib/guardrails.ts` | O alerta vermelho: deteta mensagens sobre fazer mal a si ou a outros e define a resposta fixa |
| `app/api/chat/route.ts` | Ligação ao DeepSeek, com resposta em streaming |
| `components/Chat.tsx` | A interface da conversa, o topo com o logótipo e o easter egg da moeda |
| `components/Intro.tsx` | O ecrã de entrada animado |
| `components/Termos.tsx` | O pop-up de termos e condições (aceitação guardada no `localStorage`) |
| `components/Logo.tsx` | O logótipo (a moeda azul com o +) |
| `app/globals.css` | Cores e estilos |

## Segurança das conversas

- **Alerta amarelo** (a pessoa fala mal de si própria): tratado no prompt, em `lib/system-prompt.ts`. O chatbot não concorda com o rótulo, separa a pessoa do que aconteceu e mantém a positividade.
- **Alerta vermelho** (automutilação, suicídio, violência contra outros): `lib/guardrails.ts` deteta a mensagem antes de ela chegar ao modelo e a rota responde sempre com o mesmo texto, com o 112, o SNS 24 e o SOS Voz Amiga.

A deteção é uma lista de expressões: não percebe contexto nem apanha formas indiretas. Para uso com um público grande ou jovem, o passo seguinte é um classificador. Confirma os números de apoio em fontes oficiais antes de publicares.

```bash
npm test
```

## Respostas com componentes

O chatbot responde em [OpenUI Lang](https://www.openui.com) e a página desenha a resposta com os componentes de `lib/openui-library.tsx`: `Texto`, `OutroLado`, `Exercicio`, `Meme` e `Sugestoes`. Os memes são desenhados pela própria aplicação (duas frases e uma expressão), sem imagens externas.

A lista de componentes está escrita em dois sítios: na biblioteca e no fim de `lib/system-prompt.ts`. Se mudares um, muda o outro.

## Privacidade

A app não grava conversas. O texto que a pessoa escreve é enviado ao DeepSeek apenas para gerar a resposta, e os termos dizem isto. Confirma que o teu alojamento não guarda o corpo dos pedidos nos logs.

## Publicar

Depois de fazeres push para o GitHub, podes importar o repositório na Vercel e definir `DEEPSEEK_API_KEY` nas variáveis de ambiente do projeto.

A rota `/api/chat` limita o tamanho e o número de mensagens por pedido, mas não limita pedidos por pessoa. Antes de divulgares o endereço a muita gente, define um limite de gastos na conta do DeepSeek ou acrescenta rate limiting.
