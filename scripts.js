const horariosPorDia = {
    '0': [], // Domingo
    '1': ['17:00', '18:00', '19:00', '20:00', '21:00'], // Segunda
    '2': ['17:00', '18:00', '19:00', '20:00', '21:00'], // Terça
    '3': ['17:00', '18:00'], // Quarta
    '4': ['17:00', '18:00'], // Quinta
    '5': ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'], // Sexta
    '6': ['07:00', '08:00', '09:00', '10:00', '12:00', '13:00', '14:00', '15:00'] // Sábado
};

const servicos = {
    corte: { preco: 25, duracao: "45 minutos" },
    barba: { preco: 10, duracao: "20 minutos" },
    pigmentacao: { preco: 15, duracao: "15 minutos" },
    sobrancelha: { preco: 5, duracao: "5 minutos" },
    nevou: { preco: 100, duracao: "2h 30m" },
    reflexo: { preco: 80, duracao: "2h 30m" },
    pezinho: { preco: 10, duracao: "10 minutos" }
};

// Função para calcular o total e a duração
function calcularTotal() {
    let total = 0;
    let duracao = 0;
    const servicosSelecionados = document.querySelectorAll('input[type="checkbox"]:checked');

    servicosSelecionados.forEach(servico => {
        total += servicos[servico.value].preco;

        const duracaoServico = servicos[servico.value].duracao;
        const minutos = converterDuracaoParaMinutos(duracaoServico);

        // Verifica se minutos não é NaN antes de somar
        if (!isNaN(minutos) && minutos > 0) {
            duracao += minutos;
        }
    });

    // Exibe o total
    document.getElementById('total').innerText = `Total: R$ ${total.toFixed(2)}`;
    // Exibe a duração total
    document.getElementById('duracao').innerText = `Duração Total: ${converterMinutosParaDuracao(duracao)}`;
}

// Função para converter a duração para minutos
function converterDuracaoParaMinutos(duracao) {
    let minutos = 0;

    // Usar regex para encontrar horas e minutos
    const regex = /(\d+)\s*(h|m|min)/g;
    let match;

    // Encontrar todas as ocorrências de horas e minutos
    while ((match = regex.exec(duracao)) !== null) {
        const valor = parseInt(match[1]);
        if (match[2].startsWith('h')) {
            minutos += valor * 60; // Converte horas para minutos
        } else {
            minutos += valor; // Adiciona minutos
        }
    }

    return minutos; // Retorna a soma total em minutos
}

// Função para converter minutos de volta para o formato de duração
function converterMinutosParaDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas > 0 ? horas + 'h ' : ''}${mins}m`;
}

// Adicione um evento de mudança aos checkboxes
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', calcularTotal);
    });
});

function mostrarDiaSemana() {
    const dataInput = document.getElementById('data').value;
    const diaSemanaDiv = document.getElementById('diaSemana');

    if (dataInput) {
        // Cria a data no formato correto
        const data = new Date(dataInput + 'T00:00:00'); // Adiciona a parte do tempo para evitar problemas de fuso horário
        const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        diaSemanaDiv.textContent = `Data: ${data.toLocaleDateString('pt-BR')} - Dia da semana: ${diasDaSemana[data.getUTCDay()]}`;
    } else {
        diaSemanaDiv.textContent = '';
    }
}

function mostrarHorarios() {
    const dataInput = document.getElementById('data').value;
    const data = new Date(dataInput + 'T00:00:00');
    const diaDaSemana = data.getUTCDay();

    const horariosDisponiveis = horariosPorDia[diaDaSemana];
    const listaHorarios = document.getElementById('listaHorarios');
    
    listaHorarios.innerHTML = ''; // Limpa horários anteriores

    // Recupera agendamentos do localStorage
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const horariosOcupados = agendamentos
        .filter(agendamento => agendamento.data === dataInput) // Filtra pelos agendamentos do dia
        .flatMap(agendamento => agendamento.horario); // Extrai os horários

    const horariosFiltrados = horariosDisponiveis.filter(horario => !horariosOcupados.includes(horario));

    if (horariosFiltrados.length > 0) {
        horariosFiltrados.forEach(horario => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="checkbox" value="${horario}"> ${horario}`;
            listaHorarios.appendChild(li);
        });

        document.getElementById('horariosDisponiveis').style.display = 'block';
        document.getElementById('confirmarAgendamento').style.display = 'block';
    } else {
        listaHorarios.innerHTML = '<li>Sem horários disponíveis para este dia.</li>';
        document.getElementById('horariosDisponiveis').style.display = 'block';
        document.getElementById('confirmarAgendamento').style.display = 'none';
    }
}

function voltar() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('pagamentoOpcoes').style.display = 'none';
}

function confirmarAgendamento() {
    const nome = document.getElementById('nome').value;
    const data = document.getElementById('data').value;

    // Pega os serviços selecionados
    const servicosSelecionados = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .filter(checkbox => servicos[checkbox.value])
        .map(checkbox => checkbox.parentNode.textContent.trim().split(" (")[0])
        .join(', ');

    // Pega os horários selecionados
    const horariosSelecionados = Array.from(document.querySelectorAll('#listaHorarios input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value)
        .join(', ');

    // Verifica se há serviços e horários selecionados
    if (servicosSelecionados.length === 0) {
        alert("Por favor, selecione pelo menos um serviço.");
        return;
    }
    
    if (horariosSelecionados.length === 0) {
        alert("Por favor, selecione pelo menos um horário.");
        return;
    }

    // Exibe a mensagem de confirmação
    document.getElementById('mensagemConfirmacao').innerText = 
        `Agendamento confirmado para ${nome} no dia ${data} com os serviços: ${servicosSelecionados}. Horários selecionados: ${horariosSelecionados}.`;
    document.getElementById('mensagemConfirmacao').style.display = 'block';


    // Exibe opções de pagamento
    document.getElementById('pagamentoOpcoes').style.display = 'block';
}
function mostrarChavePix() {
    document.getElementById('chavePix').style.display = 'block';
    
    const mensagemDiv = document.getElementById('mensagemPagamento');
    mensagemDiv.innerText = "Obrigado pelo seu agendamento! Você escolheu pagar via PIX.";
    mensagemDiv.style.display = 'block'; // Exibe a mensagem
}
function pagarNoLocal() {
    const mensagemDiv = document.getElementById('mensagemPagamento');
    mensagemDiv.innerText = "Obrigado pelo seu agendamento! Você escolheu pagar no local.";
    mensagemDiv.style.display = 'block'; // Exibe a mensagem
}
// Adiciona o agendamento ao localStorage
const agendamento = {
    nome,
    data,
    servicos: servicosSelecionados.split(', '),
    horario: horariosSelecionados.split(', ') // Armazena como array
};

adicionarAgendamento(agendamento); // Chama a função para armazenar

// Função para adicionar agendamentos ao localStorage
function adicionarAgendamento(agendamento) {
let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
agendamentos.push(agendamento);
localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}
