// Notícias (views/comments iniciam em 0). Comentários do sistema removidos; client-side armazena comentários.
window.newsData = [
  {
    id: 1,
    title: "TERREMOTO DE 7.2 ATINGE COSTA DO CHILE - ALERTA DE TSUNAMI EMITIDO",
    excerpt: "Tremor de magnitude 7.2 foi registrado no norte do Chile. Autoridades emitem alerta de tsunami.",
    fullContent: `<p>Um forte terremoto de magnitude 7.2 atingiu a região norte do Chile, causando pânico entre a população local. O epicentro foi localizado a cerca de 100 km da costa, com profundidade de 35 km.</p>
                 <p>Autoridades chilenas emitiram alerta de tsunami para toda a costa do país. "Recomendamos que a população em áreas costeiras se dirija imediatamente para zonas mais altas", declarou o diretor do Serviço Hidrográfico e Oceanográfico da Armada do Chile.</p>
                 <p>Até o momento, não há relatos de vítimas fatais, mas várias construções sofreram danos estruturais. Equipes de resgate estão sendo mobilizadas para as áreas mais afetadas.</p>
                 <p>Países vizinhos como Peru e Bolívia também emitiram alertas preventivos, embora não tenham registrado tremores significativos.</p>`,
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
    fullContent: `<p>O Ministério da Saúde confirmou que está investigando um caso suspeito de varíola dos macacos (monkeypox) em um paciente de 34 anos internado no Hospital das Clínicas de São Paulo.</p>
                 <p>O paciente apresentou febre, dor de cabeça, dores musculares e lesões na pele. "Ele está em isolamento e recebendo todos os cuidados necessários", afirmou o secretário municipal de Saúde.</p>
                 <p>As amostras coletadas foram enviadas para análise no Instituto Adolfo Lutz e no Laboratório Central de Saúde Pública. O resultado deve sair em até 48 horas.</p>
                 <p>Autoridades de saúde afirmam que o risco de transmissão comunitária no Brasil ainda é baixo, mas reforçaram a importância da vigilância epidemiológica.</p>`,
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
    fullContent: `<p>Um apagão de grandes proporções atingiu cinco estados do Nordeste brasileiro na madrugada desta terça-feira. Cidades na Bahia, Pernambuco, Ceará, Rio Grande do Norte e Paraíba ficaram sem energia elétrica por mais de três horas.</p>
                 <p>De acordo com a Chesf (Companhia Hidroelétrica do São Francisco), o blecaute foi causado por uma falha em uma subestação em Juazeiro, na Bahia. "As equipes técnicas estão trabalhando para normalizar completamente o fornecimento", informou a empresa.</p>
                 <p>O apagão afetou hospitais, semáforos e o funcionamento do metrô em algumas cidades. Muitos estabelecimentos comerciais tiveram que fechar as portas temporariamente.</p>
                 <p>A ANEEL (Agência Nacional de Energia Elétrica) abriu investigação para apurar as causas do incidente e determinar responsabilidades.</p>`,
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
    fullContent: `<p>O dólar comercial fechou esta terça-feira cotado a R$ 4,85, a menor taxa em oito meses. A queda de 2,3% no dia ocorreu após o Federal Reserve (Fed, banco central americano) sinalizar que pode começar a reduzir os juros no primeiro trimestre de 2024.</p>
                 <p>No mercado futuro, a moeda americana também registrou queda expressiva. Analistas atribuem a desvalorização do dólar à melhora nos indicadores econômicos brasileiros e ao fluxo positivo de capitais estrangeiros.</p>
                 <p>"O Brasil tem se beneficiado do cenário global de redução de risco. A inflação controlada e as reformas estruturais têm atraído investidores", comentou o economista-chefe de um grande banco de investimentos.</p>
                 <p>A Bolsa de Valores de São Paulo (B3) também reagiu positivamente, com o Ibovespa fechando em alta de 1,8%.</p>`,
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
    fullContent: `<p>A taxa de desemprego no Brasil caiu para 8,3% no trimestre encerrado em outubro, segundo dados divulgados pelo IBGE. É o menor índice desde dezembro de 2015.</p>
                 <p>No período, foram criadas 1,2 milhão de vagas formais no país. O setor de serviços liderou as contratações, seguido pelo comércio e pela indústria.</p>
                 <p>A renda média do trabalhador brasileiro também apresentou crescimento de 3,2% em relação ao trimestre anterior, chegando a R$ 2.980.</p>
                 <p>Especialistas avaliam que a recuperação do mercado de trabalho tem sido impulsionada pelo aquecimento da economia, com aumento do consumo e dos investimentos.</p>`,
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
    fullContent: `<p>A NASA anunciou hoje a confirmação da presença de água em Europa, uma das luas de Júpiter. A descoberta foi feita pela sonda Europa Clipper, que detectou plumas de vapor d'água saindo da superfície gelada do satélite natural.</p>
                 <p>"Esta é uma descoberta fundamental para a busca por vida extraterrestre", afirmou a diretora da Divisão de Ciências Planetárias da NASA. "O oceano subterrâneo de Europa pode conter até o dobro da água de todos os oceanos da Terra."</p>
                 <p>Os dados coletados indicam que as plumas de água atingem alturas de até 200 km acima da superfície. Análises espectroscópicas confirmaram a presença de moléculas de H2O.</p>
                 <p>A missão Europa Clipper, com lançamento previsto para 2024, terá como objetivo estudar detalhadamente o oceano subterrâneo e avaliar sua habitabilidade.</p>`,
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=1000&q=80",
    category: "ciencia",
    categoryName: "Ciência",
    time: "2 horas atrás",
    views: 0,
    comments: 0
  },
  {
    id: 7,
    title: "PESQUISADORES BRASILEIROS DESCOBREM NOVA ESPÉCIE DE AMAZÔNIA",
    excerpt: "Animal encontrado na Floresta Nacional do Tapajós pode ajudar no desenvolvimento de novos medicamentos.",
    fullContent: `<p>Uma equipe de pesquisadores brasileiros descobriu uma nova espécie na Amazônia. Trata-se de um pequeno anfíbio encontrado na Floresta Nacional do Tapajós, no Pará.</p>
                 <p>O animal, batizado de "Dendropsophus amazonicus", possui características únicas que o diferenciam de outras espécies conhecidas. Mede cerca de 3 cm e apresenta coloração verde com manchas amarelas.</p>
                 <p>"Esta descoberta reforça a importância da preservação da Amazônia", afirmou o biólogo responsável pela pesquisa. "A biodiversidade da região ainda guarda muitos segredos."</p>
                 <p>Estudos preliminares indicam que a pele do anfíbio pode conter substâncias com potencial medicinal, incluindo propriedades antibacterianas.</p>`,
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    category: "ciencia",
    categoryName: "Ciência",
    time: "6 horas atrás",
    views: 0,
    comments: 0
  },
  {
    id: 8,
    title: "ATLETA BRASILEIRA QUEBRA RECORDE MUNDIAL NOS 400m RASOS",
    excerpt: "Mariana Silva marca 47.85 segundos no Meeting de Paris, superando recorde que durava 17 anos.",
    fullContent: `<p>Em uma performance histórica, a atleta brasileira Mariana Silva quebrou o recorde mundial dos 400 metros rasos no Meeting de Paris. Com o tempo de 47.85 segundos, ela superou a marca anterior de 47.99, estabelecida em 2006.</p>
                 <p>"Ainda não acredito. Treinei a vida toda para este momento", disse Mariana, emocionada, após a prova. A atleta de 26 anos já havia conquistado a medalha de ouro nos Jogos Olímpicos anteriores.</p>
                 <p>O presidente da Confederação Brasileira de Atletismo classificou o feito como "o maior momento do atletismo brasileiro em todos os tempos".</p>
                 <p>Mariana Silva se tornou a primeira brasileira a estabelecer um recorde mundial em provas de pista. A próxima competição da atleta será o Campeonato Mundial, no próximo mês.</p>`,
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
    fullContent: `<p>O filme nacional 'Cidade Invisível' bateu recorde de bilheteria em sua estreia mundial, arrecadando R$ 52 milhões apenas no primeiro final de semana. A produção superou a marca anterior, pertencente a 'Tropa de Elite 2'.</p>
                 <p>Dirigido por Fernando Meirelles, o filme mistura drama urbano com elementos de fantasia, contando a história de um entregador que descobre uma cidade paralela sob as ruas de São Paulo.</p>
                 <p>"É uma demonstração de que o público brasileiro está ávido por produções de qualidade que falem da nossa realidade", declarou o diretor em coletiva de imprensa.</p>
                 <p>A crítica especializada tem elogiado a fotografia, o roteiro e as atuações do elenco, que conta com nomes como Wagner Moura, Fernanda Montenegro e Seu Jorge.</p>`,
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
    fullContent: `<p>Uma startup brasileira lançou o LinguaAR, um aplicativo que promete revolucionar o aprendizado de idiomas usando realidade aumentada. O sistema permite que usuários pratiquem conversação em situações reais, como em um restaurante ou aeroporto, através de óculos especiais.</p>
                 <p>"O diferencial é a imersão total. O aluno não apenas ouve e repete, mas interage com ambientes virtuais que simulam situações do dia a dia", explica o CEO da empresa.</p>
                 <p>O aplicativo já está disponível para seis idiomas (inglês, espanhol, francês, alemão, mandarim e japonês) e utiliza inteligência artificial para adaptar o nível de dificuldade às necessidades de cada usuário.</p>
                 <p>Testes realizados com 500 estudantes mostraram que o método é 60% mais eficiente do que os tradicionais para o desenvolvimento da fluência oral.</p>`,
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
    fullContent: `<p>Um novo tratamento desenvolvido por uma startup brasileira apresentou 85% de eficácia em retardar a progressão do Alzheimer em testes clínicos de fase 3. O medicamento, batizado de "NeuroGuard", mostrou resultados promissores em 1.200 pacientes acompanhados por 18 meses.</p>
                 <p>"Esta pode ser a maior descoberta no tratamento do Alzheimer na última década", afirmou o neurologista responsável pelo estudo. "Pacientes que usaram o NeuroGuard apresentaram desaceleração significativa no declínio cognitivo."</p>
                 <p>A fórmula do medicamento combina uma molécula inovadora com substâncias naturais da flora brasileira. A Anvisa já concedeu status de "terapia inovadora" ao tratamento, o que deve acelerar seu processo de aprovação.</p>
                 <p>Se aprovado, o NeuroGuard poderá estar disponível no Sistema Único de Saúde (SUS) até o final do próximo ano.</p>`,
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