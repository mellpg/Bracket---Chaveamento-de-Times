// Array contendo uma lista fixa de 16 países com nomes e URLs de bandeiras como plano de fundo
const selecoesReserva = [
    { nome: 'Brasil', bandeira: 'https://flagcdn.com/w320/br.png' },
    { nome: 'Argentina', bandeira: 'https://flagcdn.com/w320/ar.png' },
    { nome: 'França', bandeira: 'https://flagcdn.com/w320/fr.png' },
    { nome: 'Espanha', bandeira: 'https://flagcdn.com/w320/es.png' },
    { nome: 'Alemanha', bandeira: 'https://flagcdn.com/w320/de.png' },
    { nome: 'Inglaterra', bandeira: 'https://flagcdn.com/w320/gb-eng.png' },
    { nome: 'Portugal', bandeira: 'https://flagcdn.com/w320/pt.png' },
    { nome: 'Holanda', bandeira: 'https://flagcdn.com/w320/nl.png' },
    { nome: 'Itália', bandeira: 'https://flagcdn.com/w320/it.png' },
    { nome: 'Uruguai', bandeira: 'https://flagcdn.com/w320/uy.png' },
    { nome: 'Bélgica', bandeira: 'https://flagcdn.com/w320/be.png' },
    { nome: 'Japão', bandeira: 'https://flagcdn.com/w320/jp.png' },
    { nome: 'Croácia', bandeira: 'https://flagcdn.com/w320/hr.png' },
    { nome: 'Marrocos', bandeira: 'https://flagcdn.com/w320/ma.png' },
    { nome: 'México', bandeira: 'https://flagcdn.com/w320/mx.png' },
    { nome: 'Estados Unidos', bandeira: 'https://flagcdn.com/w320/us.png' }
];

// Função principal assíncrona responsável por buscar os dados, simular o torneio e renderizar a tela
async function gerarTorneio() {
    // Exibe uma mensagem no console do navegador confirmando a execução da função
    console.log("Botão clicado! Gerando chaveamento...");
    
    // Captura o elemento HTML onde a chave do torneio será desenhada
    const container = document.getElementById('bracket-container');
    
    // Interrompe a função caso a div 'bracket-container' não exista no HTML
    if (!container) return;

    // Define uma mensagem temporária de carregamento dentro do container
    container.innerHTML = '<p class="text-center w-100 text-muted">Carregando seleções e sorteando jogos...</p>';

    // Cria uma variável vazia para armazenar a lista final de países
    let listaPaises = [];

    try {
        // Tenta fazer a requisição HTTP direta para a API pública REST Countries
        let response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');

        // Se a resposta HTTP falhar (por exemplo, erro 404, 500 ou CORS)
        if (!response.ok) {
            // Emite um aviso no console e tenta a requisição novamente usando um serviço de proxy CORS
            console.warn("API direta indisponível. Tentando via Proxy...");
            response = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://restcountries.com/v3.1/all?fields=name,flags'));
        }

        // Converte o corpo da resposta em um objeto JSON manipulável no JS
        const dados = await response.json();
        
        // Filtra a lista da API garantindo que o país tem nome e bandeira válidos,
        // e em seguida mapeia o array para um formato padronizado { nome, bandeira }
        listaPaises = dados
            .filter(p => p.name && p.name.common && p.flags && p.flags.png)
            .map(p => ({ nome: p.name.common, bandeira: p.flags.png }));

        // Força um erro no bloco 'catch' caso a API traga menos de 16 países
        if (listaPaises.length < 16) throw new Error("Dados insuficientes retornados da API.");

    } catch (erro) {
        // Caso ocorra qualquer exceção na API, exibe um alerta no console e carrega a lista local de reserva
        console.warn("Usando lista local de contingência devido a erro de API/CORS:", erro);
        listaPaises = selecoesReserva;
    }

    // Cria uma cópia da lista de países, embaralha aleatoriamente e recorta apenas os primeiros 16 itens
    const paisesSorteados = [...listaPaises]
        .sort(() => 0.5 - Math.random())
        .slice(0, 16);

    // Gera o confronto das Oitavas de Final usando os 16 times sorteados
    const oitavas = criarFase(paisesSorteados);
    
    // Extrai os vencedores das oitavas e cria os confrontos das Quartas de Final (8 times)
    const quartas = criarFase(oitavas.map(j => j.vencedor));
    
    // Extrai os vencedores das quartas e cria a Semifinal (4 times)
    const semifinal = criarFase(quartas.map(j => j.vencedor));
    
    // Extrai os vencedores da semifinal e cria o confronto da Grande Final (2 times)
    const final = criarFase(semifinal.map(j => j.vencedor));
    
    // Captura o país vencedor do jogo da grande final
    const campeao = final[0].vencedor;

    // Injeta o HTML completo na página, renderizando as colunas de cada fase e o card do campeão
    container.innerHTML = `
        ${renderizarColuna('Oitavas de Final', oitavas)}
        ${renderizarColuna('Quartas de Final', quartas)}
        ${renderizarColuna('Semifinal', semifinal)}
        ${renderizarColuna('Final', final)}
        
        <div class="d-flex flex-column align-items-center justify-content-center p-3 border rounded bg-white shadow-sm" style="min-width: 160px; height: 120px;">
            <h6 class="text-success fw-bold mb-2">CAMPEÃO</h6>
            <img src="${campeao.bandeira}" alt="${campeao.nome}" style="width: 45px; height: 30px; object-fit: cover;" class="rounded border mb-1">
            <span class="fw-bold text-dark text-center small">${campeao.nome}</span>
        </div>
    `;
}

// Função auxiliar que agrupa os times de dois em dois e calcula o placar de cada partida
function criarFase(listaTimes) {
    // Array para guardar a lista de confrontos da fase atual
    const confrontos = [];

    // Percorre a lista de times de 2 em 2 (i += 2)
    for (let i = 0; i < listaTimes.length; i += 2) {
        // Define o primeiro time do duelo
        const timeA = listaTimes[i];
        // Define o segundo time do duelo
        const timeB = listaTimes[i + 1];

        // Sorteia um placar de 0 a 3 gols para o Time A
        let placarA = Math.floor(Math.random() * 4);
        // Sorteia um placar de 0 a 3 gols para o Time B
        let placarB = Math.floor(Math.random() * 4);
        
        // Garante que não haja empates: se os placares forem iguais, adiciona +1 gol ao Time A
        if (placarA === placarB) placarA += 1;

        // Compara os placares e define a equipe vencedora
        const vencedor = placarA > placarB ? timeA : timeB;

        // Adiciona o objeto do confronto resolvido ao array de resultados da fase
        confrontos.push({ timeA, timeB, placarA, placarB, vencedor });
    }
    
    // Retorna a lista de jogos com placares e vencedores definidos
    return confrontos;
}

// Função auxiliar responsável por gerar o código HTML de uma coluna da chave (ex: Oitavas, Quartas)
function renderizarColuna(titulo, jogos) {
    // Mapeia a lista de jogos criando um card do Bootstrap para cada partida
    const cards = jogos.map(j => `
        <div class="card mb-3 shadow-sm border-0" style="min-width: 190px;">
            <div class="list-group list-group-flush rounded border">
                <!-- Linha do Time A (destaca com fundo verde se for o vencedor) -->
                <div class="list-group-item d-flex justify-content-between align-items-center ${j.vencedor === j.timeA ? 'fw-bold bg-success-subtle text-dark' : 'text-muted'} py-1 px-2">
                    <div class="d-flex align-items-center gap-2">
                        <img src="${j.timeA.bandeira}" style="width: 20px; height: 14px; object-fit: cover;" class="rounded-square">
                        <small class="text-truncate" style="max-width: 110px;">${j.timeA.nome}</small>
                    </div>
                    <span class="badge bg-secondary-subtle text-dark">${j.placarA}</span>
                </div>
                <!-- Linha do Time B (destaca com fundo verde se for o vencedor) -->
                <div class="list-group-item d-flex justify-content-between align-items-center ${j.vencedor === j.timeB ? 'fw-bold bg-success-subtle text-dark' : 'text-muted'} py-1 px-2">
                    <div class="d-flex align-items-center gap-2">
                        <img src="${j.timeB.bandeira}" style="width: 20px; height: 14px; object-fit: cover;" class="rounded-square">
                        <small class="text-truncate" style="max-width: 110px;">${j.timeB.nome}</small>
                    </div>
                    <span class="badge bg-secondary-subtle text-dark">${j.placarB}</span>
                </div>
            </div>
        </div>
    `).join(''); // Converte a array de elementos HTML formatados em uma única string continuous

    // Retorna o invólucro completo da coluna contendo o título da fase e os cards organizados verticalmente
    return `
        <div class="d-flex flex-column align-items-center me-3">
            <h6 class="fw-bold mb-3 text-secondary border-bottom pb-1">${titulo}</h6>
            <div class="d-flex flex-column justify-content-around h-100">
                ${cards}
            </div>
        </div>
    `;
}