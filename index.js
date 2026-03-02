/**
 * Analisa se a data e hora atual está dentro do horário de funcionamento.
 * Regras:
 * - Seg a Qui: 08:00 às 20:00
 * - Sex: 08:00 às 19:00
 * - Finais de semana e feriados: Fechado
 */

async function isBusinessHours(dateInput = new Date()) {
    const data = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const ano = data.getFullYear();
    
    // Obtém o dia da semana (0 = Domingo, 1 = Segunda ... 6 = Sábado)
    const diaSemana = data.getDay();
    
    // 1. Verifica final de semana
    if (diaSemana === 0 || diaSemana === 6) {
        return `Entrada: ${formatDate(data)} - Resultado: Fora do horário de funcionamento (Final de semana)`;
    }

    // 2. Busca feriados na BrasilAPI
    try {
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        if (response.ok) {
            const feriados = await response.json();
            // Formata a data atual para YYYY-MM-DD para comparar com a API
            const dataString = data.toISOString().split('T')[0];
            const isFeriado = feriados.some(feriado => feriado.date === dataString);
            
            if (isFeriado) {
                return `Entrada: ${formatDate(data)} - Resultado: Fora do horário de funcionamento (Feriado)`;
            }
        }
    } catch (error) {
        console.error("Erro ao consultar a BrasilAPI:", error);
    }

    // 3. Verifica regras de horário
    const hora = data.getHours();
    const minutos = data.getMinutes();
    const tempoEmMinutos = (hora * 60) + minutos;
    
    const inicioExpediente = 8 * 60; // 08:00
    let fimExpediente;

    if (diaSemana >= 1 && diaSemana <= 4) {
        // Segunda a Quinta-feira (08:00 às 20:00)
        fimExpediente = 20 * 60;
    } else if (diaSemana === 5) {
        // Sexta-feira (08:00 às 19:00)
        fimExpediente = 19 * 60;
    }

    if (tempoEmMinutos >= inicioExpediente && tempoEmMinutos < fimExpediente) {
        return `Entrada: ${formatDate(data)} - Resultado: Dentro do horário de funcionamento`;
    } else {
        return `Entrada: ${formatDate(data)} - Resultado: Fora do horário de funcionamento`;
    }
}

// Função auxiliar para formatar a saída igual ao exemplo solicitado
function formatDate(date) {
    const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())} (${dias[date.getDay()]})`;
}

// Testando os cenários exigidos no desafio
async function rodarTestes() {
    console.log("=== INICIANDO TESTES ===");
    
    // Cenário 1
    console.log(await isBusinessHours("2025-12-30T10:15:00-03:00")); 
    
    // Cenário 2 (Nota: A regra diz que Terça vai até 20:00, então 19:10 dará "Dentro")
    console.log(await isBusinessHours("2025-12-30T19:10:00-03:00")); 
    
    // Cenário 3 (Domingo)
    console.log(await isBusinessHours("2025-12-28T11:00:00-03:00")); 
    
    // Cenário 4 (Natal - Feriado)
    console.log(await isBusinessHours("2025-12-25T10:00:00-03:00")); 
    
    // Momento Atual
    console.log("\n--- MOMENTO ATUAL ---");
    console.log(await isBusinessHours());
}

rodarTestes();