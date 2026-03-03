/**
 * Analisa se a data e hora atual está dentro do horário de funcionamento.
 * Regras:
 * - Seg a Qui: 08:00 às 20:00
 * - Sex: 08:00 às 19:00
 * - Finais de semana e feriados: Fechado
 */

async function estaNoHorarioComercial(entradaData = new Date()) {
    const data = typeof entradaData === 'string' ? new Date(entradaData) : entradaData;
    const ano = data.getFullYear();
    
    // Obtém o dia da semana (0 = Domingo, 1 = Segunda ... 6 = Sábado)
    const diaSemana = data.getDay();
    
    // 1. Verifica final de semana
    if (diaSemana === 0 || diaSemana === 6) {
        return `Entrada: ${formatarData(data)} - Resultado: Fora do horário de funcionamento (Final de semana)`;
    }

    // 2. Busca feriados na BrasilAPI
    try {
        const resposta = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        if (resposta.ok) {
            const feriados = await resposta.json();
            // Formata a data atual para YYYY-MM-DD para comparar com a API
            const dataTexto = data.toISOString().split('T')[0];
            const ehFeriado = feriados.some(feriado => feriado.date === dataTexto);
            
            if (ehFeriado) {
                return `Entrada: ${formatarData(data)} - Resultado: Fora do horário de funcionamento (Feriado)`;
            }
        }
    } catch (erro) {
        console.error("Erro ao consultar a BrasilAPI:", erro);
    }

    // 3. Verifica regras de horário
    const hora = data.getHours();
    const minutos = data.getMinutes();
    const tempoTotalEmMinutos = (hora * 60) + minutos;
    
    const inicioExpediente = 8 * 60; // 08:00
    let fimExpediente;

    if (diaSemana >= 1 && diaSemana <= 4) {
        // Segunda a Quinta-feira (08:00 às 20:00)
        fimExpediente = 20 * 60;
    } else if (diaSemana === 5) {
        // Sexta-feira (08:00 às 19:00)
        fimExpediente = 19 * 60;
    }

    if (tempoTotalEmMinutos >= inicioExpediente && tempoTotalEmMinutos < fimExpediente) {
        return `Entrada: ${formatarData(data)} - Resultado: Dentro do horário de funcionamento`;
    } else {
        return `Entrada: ${formatarData(data)} - Resultado: Fora do horário de funcionamento`;
    }
}

// Função auxiliar para formatar a saída
function formatarData(dataObjeto) {
    const nomesDias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const preencherZero = (numero) => String(numero).padStart(2, '0');
    
    const ano = dataObjeto.getFullYear();
    const mes = preencherZero(dataObjeto.getMonth() + 1);
    const dia = preencherZero(dataObjeto.getDate());
    const hora = preencherZero(dataObjeto.getHours());
    const min = preencherZero(dataObjeto.getMinutes());
    const nomeDia = nomesDias[dataObjeto.getDay()];

    return `${ano}-${mes}-${dia} ${hora}:${min} (${nomeDia})`;
}

// Executando os testes
async function rodarTestes() {
    console.log("=== INICIANDO TESTES ===");
    
    // Cenário 1: Terça-feira de manhã
    console.log(await estaNoHorarioComercial("2025-12-30T10:15:00-03:00")); 
    
    // Cenário 2: Terça-feira à noite
    console.log(await estaNoHorarioComercial("2025-12-30T19:10:00-03:00")); 
    
    // Cenário 3: Domingo
    console.log(await estaNoHorarioComercial("2025-12-28T11:00:00-03:00")); 
    
    // Cenário 4: Natal (Feriado)
    console.log(await estaNoHorarioComercial("2025-12-25T10:00:00-03:00")); 
    
    // Momento Atual
    console.log("\n--- MOMENTO ATUAL ---");
    console.log(await estaNoHorarioComercial());
}

rodarTestes();
