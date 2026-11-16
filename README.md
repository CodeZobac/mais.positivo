# Lado Positivo

Chatbot de inteligência artificial que responde sempre com positividade e ajuda a olhar para as situações de outras perspetivas. Microprojeto da Academia de Novos Líderes.

Aplicação Next.js (App Router) numa só página. A rota `/api/chat` fala com o DeepSeek no servidor, por isso a chave nunca chega ao browser.

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
| `app/api/chat/route.ts` | Ligação ao DeepSeek, com resposta em streaming |
| `components/Chat.tsx` | A interface da conversa |
| `components/Logo.tsx` | O logótipo (a moeda com o lado positivo) |
| `app/globals.css` | Cores e estilos |

## Respostas com componentes

O chatbot responde em [OpenUI Lang](https://www.openui.com) e a página desenha a resposta com os componentes de `lib/openui-library.tsx`: `Texto`, `OutroLado`, `Exercicio`, `Meme` e `Sugestoes`. Os memes são desenhados pela própria aplicação (duas frases e uma expressão), sem imagens externas.

A lista de componentes está escrita em dois sítios: na biblioteca e no fim de `lib/system-prompt.ts`. Se mudares um, muda o outro.

## Publicar

Depois de fazeres push para o GitHub, podes importar o repositório na Vercel e definir `DEEPSEEK_API_KEY` nas variáveis de ambiente do projeto.

A rota `/api/chat` limita o tamanho e o número de mensagens por pedido, mas não limita pedidos por pessoa. Antes de divulgares o endereço a muita gente, define um limite de gastos na conta do DeepSeek ou acrescenta rate limiting.
