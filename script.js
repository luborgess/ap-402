// Configuração das escalas
const escalas = {
    banheiroEsquerdo: ['Lucas', 'Bruno', 'Kelvin', 'Robson'],
    banheiroDireito: ['Luiz', 'Gabriel', 'Natan', 'Fulano'],
    salaCozinha: [
        ['Bruno', 'Fulano'],
        ['Luiz', 'Lucas'],
        ['Gabriel', 'Natan'],
        ['Kelvin', 'Robson']
    ]
};

// Função para obter a data atual formatada
function getFormattedDate(addDays = 0) {
    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return date.toLocaleDateString('pt-BR');
}

// Função para criar uma linha da escala
function createEscalaRow(responsavel, data, isCurrentWeek = false) {
    return `
        <div class="row mb-2 ${isCurrentWeek ? 'current-week' : ''}">
            <div class="col-6">
                <strong>${responsavel}</strong>
            </div>
            <div class="col-6">
                ${data}
            </div>
        </div>
    `;
}

// Função para criar uma linha da escala de duplas
function createDuplaRow(dupla, data, isCurrentWeek = false) {
    return `
        <div class="row mb-2 ${isCurrentWeek ? 'current-week' : ''}">
            <div class="col-6">
                <strong>${dupla[0]} e ${dupla[1]}</strong>
            </div>
            <div class="col-6">
                ${data}
            </div>
        </div>
    `;
}

// Função para renderizar as escalas
function renderizarEscalas() {
    // Banheiro Esquerdo
    const banheiroEsquerdoElement = document.getElementById('banheiro-esquerdo');
    let htmlBanheiroEsquerdo = '';
    
    escalas.banheiroEsquerdo.forEach((responsavel, index) => {
        htmlBanheiroEsquerdo += createEscalaRow(
            responsavel,
            getFormattedDate(index * 7),
            index === 0
        );
    });
    
    banheiroEsquerdoElement.innerHTML = htmlBanheiroEsquerdo;

    // Banheiro Direito
    const banheiroDireitoElement = document.getElementById('banheiro-direito');
    let htmlBanheiroDireito = '';
    
    escalas.banheiroDireito.forEach((responsavel, index) => {
        htmlBanheiroDireito += createEscalaRow(
            responsavel,
            getFormattedDate(index * 7),
            index === 0
        );
    });
    
    banheiroDireitoElement.innerHTML = htmlBanheiroDireito;

    // Sala e Cozinha
    const salaCozinhaElement = document.getElementById('sala-cozinha');
    let htmlSalaCozinha = '';
    
    escalas.salaCozinha.forEach((dupla, index) => {
        htmlSalaCozinha += createDuplaRow(
            dupla,
            getFormattedDate(index * 7),
            index === 0
        );
    });
    
    salaCozinhaElement.innerHTML = htmlSalaCozinha;
}

// Inicializar o dashboard
document.addEventListener('DOMContentLoaded', renderizarEscalas);
