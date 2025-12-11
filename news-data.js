// Notícias (views/comments iniciam em 0). Comentários do sistema removidos; client-side armazena comentários.
window.newsData = [
  {
    id: 1,
    title: "TERREMOTO DE 7.2 ATINGE COSTA DO CHILE - ALERTA DE TSUNAMI EMITIDO",
    excerpt: "Tremor de magnitude 7.2 foi registrado no norte do Chile. Autoridades emitem alerta de tsunami.",
    fullContent: `<p>Um forte terremoto de magnitude 7.2 atingiu a região norte do Chile...</p>`,
    image: "https://images.unsplash.com/photo-1506252374453-ef5237294c74?auto=format&fit=crop&w=1000&q=80",
    category: "urgentes",
    categoryName: "URGENTE",
    time: "15 minutos atrás",
    views: 0,
    comments: 0
  },
  {
    id: 2,
    title: "SUSPEITA DE VARÍOLA DOS MACACOS EM SÃO PAULO - MINISTÉRIO DA SAÚDE INVESTIGA",
    excerpt: "Paciente com sintomas compatíveis com monkeypox está isolado no Hospital das Clínicas.",
    fullContent: `<p>O Ministério da Saúde confirmou que está investigando um caso suspeito...</p>`,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1000&q=80",
    category: "urgentes",
    categoryName: "URGENTE",
    time: "1 hora atrás",
    views: 0,
    comments: 0
  },
  {
    id: 3,
    title: "APAGÃO AFETA 5 ESTADOS DO NORDESTE - ENERGIA AINDA NÃO FOI TOTALMENTE RESTABELECIDA",
    excerpt: "Falta de energia atinge milhões de consumidores. Equipes trabalham para restaurar o fornecimento.",
    fullContent: `<p>Um apagão de grandes proporções atingiu cinco estados do Nordeste...</p>`,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80",
    category: "urgentes",
    categoryName: "URGENTE",
    time: "3 horas atrás",
    views: 0,
    comments: 0
  },
  {
    id: 4,
    title: "DÓLAR CAI PARA R$ 4,85 - MENOR VALOR EM 8 MESES",
    excerpt: "Moeda americana recua 2,3% após anúncio do Fed sobre possível redução nos juros.",
    fullContent: `<p>O dólar comercial fechou esta terça-feira cotado a R$ 4,85...</p>`,
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80",
    category: "economia",
    categoryName: "Economia",
    time: "5 horas atrás",
    views: 0,
    comments: 0
  },
  {
    id: 5,
    title: "DESEMPREGO CAI PARA 8,3% - MENOR TAXA DESDE 2015",
    excerpt: "Pesquisa do IBGE mostra criação de 1,2 milhão de vagas formais no trimestre.",
    fullContent: `<p>A taxa de desemprego no Brasil caiu para 8,3%...</p>`,
    image: "https://images.unsplash.com/photo-1586769852044-692eb51d3d6e?auto=format&fit=crop&w=1000&q=80",
    category: "economia",
    categoryName: "Economia",
    time: "1 dia atrás",
    views: 0,
    comments: 0
  },
  {
    id: 6,
    title: "NASA CONFIRMA PRESENÇA DE ÁGUA EM EUROPA, LUA DE JÚPITER",
    excerpt: "Missão Europa Clipper detecta plumas de água saindo da superfície gelada.",
    fullContent: `<p>A NASA anunciou hoje a confirmação da presença de água em Europa...</p>`,
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=1000&q=80",
    category: "ciencia",
    categoryName: "Ciência",
    time: "2 horas atrás",
    views: 0,
    comments: 0
  },
  {
    id: 8,
    title: "ATLETA BRASILEIRA QUEBRA RECORDE MUNDIAL NOS 400m RASOS",
    excerpt: "Mariana Silva marca 47.85 segundos no Meeting de Paris, superando recorde que durava 17 anos.",
    fullContent: `<p>Em uma performance histórica, a atleta brasileira Mariana Silva quebrou o recorde mundial...</p>`,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd8facb5?auto=format&fit=crop&w=1000&q=80",
    category: "esportes",
    categoryName: "Esportes",
    time: "3 horas atrás",
    views: 0,
    comments: 0
  },
  {
    id: 9,
    title: "FILME NACIONAL BATE RECORDE DE BILHETERIA EM ESTREIA MUNDIAL",
    excerpt: "Produção brasileira 'Cidade Invisível' arrecada R$ 52 milhões no primeiro final de semana.",
    fullContent: `<p>O filme nacional 'Cidade Invisível' bateu recorde de bilheteria em sua estreia mundial...</p>`,
    image: "https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?auto=format&fit=crop&w=1000&q=80",
    category: "cultura",
    categoryName: "Cultura",
    time: "2 dias atrás",
    views: 0,
    comments: 0
  },
  {
    id: 10,
    title: "APLICATIVO REVOLUCIONA APRENDIZADO DE IDIOMAS COM REALIDADE AUMENTADA",
    excerpt: "Startup cria sistema que permite conversação imersiva em qualquer língua usando óculos de realidade aumentada.",
    fullContent: `<p>Uma startup lançou o LinguaAR, que permite conversações imersivas...</p>`,
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1000&q=80",
    category: "tecnologia",
    categoryName: "Tecnologia",
    time: "1 dia atrás",
    views: 0,
    comments: 0
  },
  {
    id: 11,
    title: "NOVO TRATAMENTO PARA ALZHEIMER MOSTRA 85% DE EFICÁCIA EM ESTUDO",
    excerpt: "Medicamento desenvolvido por startup brasileira reduz progressão da doença em testes clínicos de fase 3.",
    fullContent: `<p>Um novo tratamento apresentou 85% de eficácia em retardar a progressão do Alzheimer...</p>`,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1000&q=80",
    category: "saude",
    categoryName: "Saúde",
    time: "8 horas atrás",
    views: 0,
    comments: 0
  },
  {
  id: 12,
  title: "UCRÂNIA INTENSIFICA ATAQUES A INFRAESTRUTURA ENERGÉTICA RUSSA",
  excerpt: "Drones ucranianos atingem plataforma petrolífera no Mar Cáspio em nova fase da campanha para cortar receitas de guerra russas.",
  fullContent: `<p>A Ucrânia anunciou que atingiu uma plataforma petrolífera no Mar Cáspio, expandindo sua campanha contra a infraestrutura energética russa. O ataque à plataforma Filanovsky, da Lukoil, marca a primeira vez que Kiev atinge instalações russas de produção de petróleo na região do Cáspio.</p>
                <p>A campanha ucraniana contra alvos energéticos russos intensificou-se desde agosto, com pelo menos 77 instalações atacadas. Novembro registrou o maior número de ataques mensais, incluindo refinarias, terminais de exportação e oleodutos. A estratégia visa reduzir as receitas que financiam a guerra russa.</p>
                <p>Os ataques coincidem com novas sanções americanas às principais petrolíferas russas e com queda nos preços do petróleo Urals. Analistas apontam que a capacidade de refino russa caiu 6% em relação ao ano passado, levando a exportações proibidas de gasolina para equilibrar o mercado interno.</p>
                <p>O governo americano aumentou o compartilhamento de inteligência com a Ucrânia para alvos energéticos, enquanto países europeus também apoiam a estratégia. Especialistas questionam quanto tempo a Rússia pode suportar a pressão sobre seu setor energético.</p>`,
  image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80",
  category: "urgentes",
  categoryName: "URGENTE",
  time: "4 horas atrás",
  views: 0,
  comments: 0
}
  
];