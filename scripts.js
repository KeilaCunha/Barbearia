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
    'nevou': 150, // 2h 30m em minutos
    'reflexo': 150, // 2h 30m em minutos
    'pezinho': 10
};

const precosServicos = {
    'corte': 25,
    'barba': 10,
    'pigmentacao': 15,
    'sobrancelha': 5,
    'nevou': 100,
    'reflexo': 80,
    'pezinho': 10
};

document.getElementById('btnSelecionarServicos').addEventListener('click', function() {
    const servicosContainer = document.getElementById('servicosContainer');
    servicosContainer.style.display = servicosContainer.style.display === 'none' ? 'block' : 'none';
});

document.querySelectorAll('#servicos input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', atualizarDuracao);
});

function atualizarDuracao() {
    const duracaoDiv = document.getElementById('duracao');
    const totalDiv = document.getElementById('total');
    const servicosSelecionados = Array.from(document.querySelectorAll('#servicos input[type="checkbox"]:checked'));

    let duracaoTotal = 0;
    let totalPreco = 0;

    servicosSelecionados.forEach(servico => {
        const servicoValue = servico.value;
        duracaoTotal += duracoesServicos[servicoValue];
        totalPreco += precosServicos[servicoValue];
    });

    duracaoDiv.textContent = duracaoTotal > 0 ? `Duração total: ${duracaoTotal} minutos` : '';
    duracaoDiv.style.display = duracaoTotal > 0 ? 'block' : 'none';
    totalDiv.textContent = `Total: R$ ${totalPreco.toFixed(2)}`;
}

function mostrarDiaSemana() {
    const dataInput = document.getElementById('data').value;
    const diaSemanaDiv = document.getElementById('diaSemana');

    if (dataInput) {
        const data = new Date(dataInput + 'T00:00:00');
        const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        diaSemanaDiv.textContent = `Data: ${data.toLocaleDateString('pt-BR')} - Dia da semana: ${diasDaSemana[data.getUTCDay()]}`;
    } else {
        diaSemanaDiv.textContent = '';
    }
}

function mostrarHorarios() {
    const listaHorarios = document.getElementById('listaHorarios');
    const horariosDisponiveis = document.getElementById('horariosDisponiveis');
    const selectedDate = document.getElementById('data').value;

    listaHorarios.innerHTML = '';
    document.getElementById('mensagemConfirmacao').style.display = 'none';
    document.getElementById('confirmarAgendamento').style.display = 'none';

    const servicosSelecionados = Array.from(document.querySelectorAll('#servicos input[type="checkbox"]:checked'));

    if (servicosSelecionados.length === 0) {
        alert('Por favor, selecione pelo menos um serviço.');
        return;
    }

    const diaDaSemana = new Date(selectedDate + 'T00:00:00').getUTCDay();
    const duracaoTotal = servicosSelecionados.reduce((total, servico) => total + duracoesServicos[servico.value], 0);
    const horarios = [...horariosPorDia[diaDaSemana]];

    // Verificar horários ocupados
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const horariosOcupados = agendamentos
        .filter(agendamento => agendamento.data === selectedDate)
        .flatMap(agendamento => {
            const horariosIndisponiveis = [agendamento.horario];
            const [horas, minutos] = agendamento.horario.split(':').map(Number);
            const horaInicio = new Date(selectedDate);
            horaInicio.setHours(horas, minutos);
            const duracao = duracoesServicos[agendamento.servicos[0]]; // Assume que a primeira serviço é a duração
            const horaFim = new Date(horaInicio);
            horaFim.setMinutes(horaFim.getMinutes() + duracao);

            // Adiciona todos os horários ocupados durante a duração do serviço
            for (let h = horaInicio.getHours(); h <= horaFim.getHours(); h++) {
                const novoHorario = new Date(horaInicio);
                novoHorario.setHours(h);
                horariosIndisponiveis.push(novoHorario.toTimeString().slice(0, 5)); // Formato HH:MM
            }
            return horariosIndisponiveis;
        });

    const horariosDisponiveisFinal = horarios.filter(horario => {
        const [horas, minutos] = horario.split(':').map(Number);
        const horaInicio = new Date(selectedDate);
        horaInicio.setHours(horas, minutos);
        const horaFim = new Date(horaInicio);
        horaFim.setMinutes(horaFim.getMinutes() + duracaoTotal);
        return horaFim.getHours() < 24 && !horariosOcupados.includes(horario);
    });

    if (!horariosDisponiveisFinal.length) {
        listaHorarios.innerHTML = '<li>Nenhum horário disponível neste dia.</li>';
        horariosDisponiveis.style.display = 'block';
        return;
    }

    horariosDisponiveisFinal.forEach(horario => {
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
    const horariosSelecionados = Array.from(document.querySelectorAll('#listaHorarios input[type="checkbox"]:checked'));

    if (horariosSelecionados.length === 0) {
        alert('Por favor, selecione um horário.');
        return;
    }

    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    horariosSelecionados.forEach(horarioSelecionado => {
        const horario = horarioSelecionado.id;

        // Verificar se o horário já está ocupado
        const horarioOcupado = agendamentos.some(agendamento => 
            agendamento.data === dataInput && agendamento.horario === horario
        );

        if (horarioOcupado) {
            alert('O horário selecionado já está ocupado. Por favor, escolha outro horário.');
            return; // Para a função se o horário estiver ocupado
        }

        const servicosSelecionados = Array.from(document.querySelectorAll('#servicos input[type="checkbox"]:checked')).map(servico => servico.value);
        
        const agendamento = {
            nome: nome,
            servicos: servicosSelecionados,
            data: dataInput,
            horario: horario
        };

        // Adiciona o novo agendamento
        agendamentos.push(agendamento);
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        
        // Mensagem de confirmação
        const totalPreco = servicosSelecionados.reduce((total, servico) => total + precosServicos[servico], 0);
        const mensagemConfirmacao = document.getElementById('mensagemConfirmacao');
        const dataFormatada = new Date(dataInput).toLocaleDateString('pt-BR'); 
        mensagemConfirmacao.textContent = `Agendamento realizado com sucesso para ${nome} no dia ${dataInput} às ${horario}. Seu serviço ficou em R$ ${totalPreco.toFixed(2)}. Deseja pagar agora através de PIX ou no local?`;
        mensagemConfirmacao.style.display = 'block';

        // Mostrar opções de pagamento
        document.getElementById('pagamentoOpcoes').style.display = 'block';
    });
}

function exibirAgendamentos() {
    const listaAgendamentos = document.getElementById('listaAgendamentos');
    listaAgendamentos.innerHTML = ''; // Limpa a lista antes de exibir

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || []; // Recupera os agendamentos

    agendamentos.forEach((agendamento, index) => {
        const li = document.createElement('li');
        li.textContent = `${agendamento.nome} - ${agendamento.servicos.join(', ')} - ${agendamento.data} às ${agendamento.horario}`;
        
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => editarAgendamento(index);
        
        const btnDeletar = document.createElement('button');
        btnDeletar.textContent = 'Deletar';
        btnDeletar.onclick = () => deletarAgendamento(index);

        li.appendChild(btnEditar);
        li.appendChild(btnDeletar);
        listaAgendamentos.appendChild(li);
    });
}

function editarAgendamento(index) {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const agendamento = agendamentos[index];
    document.getElementById('nome').value = agendamento.nome;
    document.getElementById('data').value = agendamento.data;

    const servicosSelecionados = Array.from(document.querySelectorAll('#servicos input[type="checkbox"]'));
    servicosSelecionados.forEach(servico => {
        servico.checked = agendamento.servicos.includes(servico.value);
    });

    mostrarHorarios(); // Mostra os horários disponíveis novamente

    const horarioSelecionado = document.querySelector(`input[id="${agendamento.horario}"]`);
    if (horarioSelecionado) {
        horarioSelecionado.checked = true;
    }
    
    deletarAgendamento(index); // Remove o agendamento antigo para evitar duplicados
}

function deletarAgendamento(index) {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.splice(index, 1); // Remove o agendamento do array
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos)); // Atualiza o localStorage
    exibirAgendamentos(); // Atualiza a exibição
}

function voltar() {
    window.history.back();
}

document.getElementById('pagamentoPix').addEventListener('click', function() {
    document.getElementById('chavePix').style.display = 'block';
    alert('A chave PIX foi exibida abaixo. Obrigado! Agradeço pela preferência.');
});

document.getElementById('pagamentoLocal').addEventListener('click', function() {
    alert('Você escolheu pagar no local. Obrigado! Agradeço pela preferência.');
});
