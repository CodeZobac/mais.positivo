import type { Metadata } from "next";
import Codigo from "@/components/Codigo";

export const metadata: Metadata = {
  title: "Política de privacidade · Lado Positivo",
};

const RESPONSAVEL = "Afonso Caboz (NIF 266829414)";
const CONTACTO = "afonso.caboz@gmail.com";
const ATUALIZADA = "17 de novembro de 2026";
const CONSERVACAO = "90 dias";

export default function Privacidade() {
  return (
    <main className="documento">
      <p>
        <a href="/">← Voltar ao Lado Positivo</a>
      </p>
      <h1>Política de privacidade</h1>
      <p>Última atualização: {ATUALIZADA}</p>

      <h2>1. Quem trata os teus dados</h2>
      <p>
        O responsável pelo tratamento é {RESPONSAVEL}. Para qualquer questão sobre os teus dados,
        escreve para {CONTACTO}.
      </p>

      <h2>2. Que dados tratamos</h2>
      <ul>
        <li>
          <strong>As mensagens que escreves e as respostas que recebes.</strong> Podem incluir
          informação sobre o teu estado emocional ou a tua saúde, que é uma categoria especial de
          dados (art. 9.º do RGPD).
        </li>
        <li>
          <strong>Um código aleatório</strong> criado pelo teu navegador, que liga as tuas conversas
          entre si sem dizer quem és. Não pedimos nome, email, telefone nem conta.
        </li>
        <li>
          <strong>Dados técnicos</strong> necessários para a ligação funcionar (por exemplo, o
          endereço IP), tratados pelos nossos fornecedores de alojamento.
        </li>
      </ul>
      <p>Não partilhes nomes, moradas ou outros dados que te identifiquem a ti ou a outras pessoas.</p>

      <h2>3. Para que usamos e com que base legal</h2>
      <ul>
        <li>
          <strong>Gerar as respostas:</strong> o teu consentimento explícito (arts. 6.º, n.º 1,
          alínea a), e 9.º, n.º 2, alínea a), do RGPD).
        </li>
        <li>
          <strong>Segurança e controlo de custos</strong> (detetar mensagens de risco e abusos):
          o mesmo consentimento explícito.
        </li>
      </ul>
      <p>Não usamos os teus dados para publicidade, não os vendemos e não criamos perfis teus.</p>

      <h2>4. Com quem partilhamos</h2>
      <ul>
        <li>
          <strong>DeepSeek</strong> (fornecedor do modelo de inteligência artificial), com
          servidores na <strong>República Popular da China</strong>. A Comissão Europeia não
          reconheceu a China como tendo um nível de proteção de dados equivalente ao da UE. Isto
          significa que as autoridades chinesas podem ter acesso aos dados e que podes ter mais
          dificuldade em fazer valer os teus direitos. Fazemos esta transferência com base no teu
          consentimento explícito, depois de te informarmos destes riscos (art. 49.º, n.º 1,
          alínea a), do RGPD).
        </li>
        <li>
          <strong>Langfuse</strong> (registo e monitorização das conversas), com servidores na
          União Europeia.
        </li>
        <li>O fornecedor de alojamento da aplicação.</li>
      </ul>

      <h2>5. Durante quanto tempo</h2>
      <ul>
        <li>
          <strong>No nosso registo (Langfuse):</strong> {CONSERVACAO}. Depois disso, as mensagens
          são apagadas.
        </li>
        <li>
          <strong>No teu dispositivo:</strong> a conversa fica guardada no navegador até carregares
          em novo chat. A aceitação dos termos e o código aleatório ficam até limpares os dados do
          site no navegador.
        </li>
        <li>
          <strong>Na DeepSeek:</strong> segundo as regras de conservação da própria DeepSeek, que não
          controlamos.
        </li>
      </ul>

      <h2>6. O que fica guardado no teu navegador</h2>
      <p>
        Não usamos cookies de publicidade nem de análise. Guardamos no armazenamento local do
        navegador apenas o necessário para o serviço que pediste: a aceitação dos termos, a conversa
        em curso e o código aleatório.
      </p>

      <h2>7. Os teus direitos</h2>
      <p>
        Tens direito a aceder aos teus dados, corrigi-los, apagá-los, limitar o tratamento, recebê-los
        num formato portátil e opor-te ao tratamento. Podes <strong>retirar o consentimento</strong>{" "}
        a qualquer momento: basta deixares de usar a aplicação e pedires o apagamento. Retirar o
        consentimento não torna ilegal o que foi feito antes.
      </p>
      <p>
        Como não sabemos quem és, para exercer estes direitos escreve para {CONTACTO} e indica o
        código deste navegador: <Codigo />. Respondemos no prazo de um mês.
      </p>
      <p>
        Tens também direito a apresentar queixa à{" "}
        <a href="https://www.cnpd.pt" target="_blank" rel="noreferrer">
          Comissão Nacional de Proteção de Dados (CNPD)
        </a>
        .
      </p>

      <h2>8. Idade mínima</h2>
      <p>
        O Lado Positivo destina-se a pessoas com <strong>13 anos ou mais</strong> (art. 16.º da Lei
        n.º 58/2019). Se tens menos de 13 anos, só podes usar a aplicação com autorização dos teus
        pais ou de quem tem a tua guarda.
      </p>

      <h2>9. Decisões automáticas</h2>
      <p>
        As respostas são geradas por inteligência artificial, mas não tomamos decisões sobre ti que
        tenham efeitos jurídicos ou que te afetem de forma significativa.
      </p>

      <h2>10. Alterações</h2>
      <p>
        Se mudarmos esta política de forma importante, voltamos a pedir-te que aceites os termos
        antes de continuares.
      </p>
    </main>
  );
}
