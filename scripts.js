const horariosPorDia = {
    '0': [], // Domingo
    '1': ['17:00', '18:00', '19:00', '20:00', '21:00'], // Segunda
    '2': ['17:00', '18:00', '19:00', '20:00', '21:00'], // Terça
    '3': ['17:00', '18:00'], // Quarta
    '4': ['17:00', '18:00'], // Quinta
    '5': ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'], // Sexta
    '6': ['07:00', '08:00', '09:00', '10:00', '12:00', '13:00', '14:00', '15:00'] // Sábado
};

const duracoesServicos = {
    'corte': 45,
    'barba': 20,
    'pigmentacao': 15,
    'sobrancelha': 5,
    'nevou': 150,
    'reflexo': 150,
    'pezinho': 10
};

function atualizarDuracao() {
    const servicoSelect = document.getElementById('servico');
    const duracaoDiv = document.getElementById('duracao');
    const servico = servicoSelect.value;

    if (servico) {
        const duracao = duracoesServicos[servico];
        duracaoDiv.textContent = `Duração: ${duracao} minutos`;
        duracaoDiv.style.display = 'block';
    } else {
        duracaoDiv.style.display = 'none';
    }
}

function mostrarDiaSemana() {
    const dataInput = document.getElementById('data').value;
    const diaSemanaDiv = document.getElementById('diaSemana');

    if (dataInput) {
        const data = new Date(dataInput + 'T00:00:00');
        const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const diaSemana = diasDaSemana[data.getUTCDay()];
        const dataFormatada = data.toLocaleDateString('pt-BR');
        diaSemanaDiv.textContent = `Data: ${dataFormatada} - Dia da semana: ${diaSemana}`;
    } else {
        diaSemanaDiv.textContent = '';
    }
}

function mostrarHorarios() {
    const listaHorarios = document.getElementById('listaHorarios');
    const horariosDisponiveis = document.getElementById('horariosDisponiveis');
    const selectedDate = document.getElementById('data').value;
    const servicoSelect = document.getElementById('servico');
    const servico = servicoSelect.value;

    listaHorarios.innerHTML = '';
    document.getElementById('mensagemConfirmacao').style.display = 'none';
    document.getElementById('confirmarAgendamento').style.display = 'none';

    if (!selectedDate) {
        alert('Por favor, selecione uma data.');
        return;
    }

    if (!servico) {
        alert('Por favor, selecione um serviço.');
        return;
    }

    const data = new Date(selectedDate + 'T00:00:00');
    const diaDaSemana = data.getUTCDay().toString();
    const duracaoServico = duracoesServicos[servico];

    const horarios = [...horariosPorDia[diaDaSemana]];

    const horariosFiltrados = horarios.filter(horario => {
        const [horas, minutos] = horario.split(':').map(Number);
        const horaInicio = new Date(data);
        horaInicio.setHours(horas, minutos);
        const horaFim = new Date(horaInicio);
        horaFim.setMinutes(horaFim.getMinutes() + duracaoServico);
        return horaFim.getHours() < 24;
    });

    if (!horariosFiltrados.length) {
        listaHorarios.innerHTML = '<li>Nenhum horário disponível neste dia.</li>';
        horariosDisponiveis.style.display = 'block';
        return;
    }

    horariosFiltrados.forEach(horario => {
        const li = document.createElement('li');
        li.textContent = horario;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = horario;
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                mostrarMensagemConfirmacao(horario, selectedDate);
            } else {
                document.getElementById('mensagemConfirmacao').style.display = 'none';
                document.getElementById('confirmarAgendamento').style.display = 'none';
            }
        });

        li.prepend(checkbox);
        listaHorarios.appendChild(li);
    });

    horariosDisponiveis.style.display = 'block';
}

function mostrarMensagemConfirmacao(horario, data) {
    const nome = document.getElementById('nome').value;
    const diaSemana = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' });
    const dataFormatada = new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    const mensagem = document.getElementById('mensagemConfirmacao');
    mensagem.textContent = `Confirmar agendamento para ${nome} no dia ${dataFormatada} (${diaSemana}) às ${horario}?`;
    mensagem.style.display = 'block';
    document.getElementById('confirmarAgendamento').style.display = 'block';
}

function confirmarAgendamento() {
    const nome = document.getElementById('nome').value;
    const dataInput = document.getElementById('data').value;
    const horarioSelecionado = document.querySelector('input[type="checkbox"]:checked');

    if (horarioSelecionado) {
        const horario = horarioSelecionado.id;
        alert(`Agendamento confirmado para ${nome} no dia ${dataInput} às ${horario}.`);
    } else {
        alert('Por favor, selecione um horário.');
    }
}

function voltar() {
    window.history.back();
}
