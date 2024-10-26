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
        duracao += converterDuracaoParaMinutos(duracaoServico);
    });
    document.getElementById('total').innerText = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById('duracao').innerText = `Duração total: ${converterMinutosParaDuracao(duracao)}`;
}

// Função para converter duração para minutos
function converterDuracaoParaMinutos(duracao) {
    const partes = duracao.split(' ');
    let minutos = 0;
    partes.forEach(parte => {
        if (parte.includes('h')) {
            minutos += parseInt(parte) * 60;
        } else if (parte.includes('m')) {
            minutos += parseInt(parte);
        }
    });
    return minutos;
}

// Função para converter minutos para a string de duração
function converterMinutosParaDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas > 0 ? `${horas}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
}

function mostrarHorarios() {
    const dataSelecionada = document.getElementById("data").value;

    if (!dataSelecionada) {
        alert("Por favor, selecione uma data.");
        return;
    }

    const diaSelecionado = new Date(dataSelecionada);
    const diaSemana = diaSelecionado.getDay();
    const horariosDisponiveis = [...horariosPorDia[diaSemana]]; // Copia os horários disponíveis

    // Atualiza a lista de horários disponíveis
    const listaHorarios = document.getElementById("listaHorarios");
    listaHorarios.innerHTML = ""; // Limpa a lista anterior

    // Adiciona os horários disponíveis à lista
    horariosDisponiveis.forEach(horario => {
        const li = document.createElement("li");
        li.innerHTML = `<input type="checkbox" value="${horario}" onchange="calcularTotal()"> ${horario}`;
        listaHorarios.appendChild(li);
    });


    db.collection("agendamentos")
        .where("data", "==", dataSelecionada)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const agendamento = doc.data();
                const horariosReservados = agendamento.horario.split(', '); // Converte a string de horários para um array

                // Remove os horários reservados
                horariosReservados.forEach((horario) => {
                    const index = horariosDisponiveis.indexOf(horario);
                    if (index > -1) {
                        horariosDisponiveis.splice(index, 1);
                    }
                });
            });

            // Atualiza a lista com horários disponíveis após reservas
            listaHorarios.innerHTML = ""; // Limpa a lista anterior
            horariosDisponiveis.forEach(horario => {
                const li = document.createElement("li");
                li.innerHTML = `<input type="checkbox" value="${horario}" onchange="calcularTotal()"> ${horario}`;
                listaHorarios.appendChild(li);
            });

            document.getElementById("confirmarAgendamento").style.display = "block";
        })
        .catch((error) => {
            console.error("Erro ao buscar agendamentos: ", error);
        });
}


// Adiciona listener para atualizações em tempo real
function inicializarListenerDeAgendamentos() {
    db.collection("agendamentos")
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    mostrarHorarios(); // Atualiza os horários disponíveis quando um novo agendamento é adicionado ou modificado
                }
            });
        });
}

// Chama a função para inicializar o listener
inicializarListenerDeAgendamentos();

// Adicione um evento para chamar a função quando a data for alterada
document.getElementById("data").addEventListener("change", function() {
    mostrarDiaSemana(); // Mostra o dia da semana ao selecionar uma data
    mostrarHorarios(); // Mostra os horários disponíveis ao selecionar uma data
});
