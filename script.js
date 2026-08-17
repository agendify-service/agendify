let clientesSalvos = JSON.parse(localStorage.getItem("clientes")) || [];
let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

const TEXTO_PADRAO_EMPRESA = "Clique aqui para o Nome da Empresa";

const nomeEmpresaElem = document.getElementById("nomeEmpresa");
const form = document.getElementById("formAgendamento");
const nomeInput = document.getElementById("nomeCliente");
const telInput = document.getElementById("tel1");
const valorInput = document.getElementById("valorServico");
const dataInput = document.getElementById("dataAgendamento");
const horaInput = document.getElementById("horaAgendamento");

const listaDatalist = document.getElementById("listaClientes");
const listaAgendamentosHoje = document.getElementById("listaAgendamentosHoje");
const listaAgendamentosFuturos = document.getElementById("listaAgendamentosFuturos");
const totalFuturosBadge = document.getElementById("totalFuturosBadge");
const listaClientesCadastrados = document.getElementById("listaClientesCadastrados");
const totalClientesBadge = document.getElementById("totalClientesBadge");

const painelHistorico = document.getElementById("painelHistorico");
const filtroAno = document.getElementById("filtroAno");
const filtroMes = document.getElementById("filtroMes");
const historicoQtdAtendidos = document.getElementById("historicoQtdAtendidos");
const historicoTotalGanho = document.getElementById("historicoTotalGanho");

const subtotalPix = document.getElementById("subtotalPix");
const subtotalDinheiro = document.getElementById("subtotalDinheiro");
const subtotalCredito = document.getElementById("subtotalCredito");
const subtotalDebito = document.getElementById("subtotalDebito");

// 1. SANFONA (RETRÁTIL)
function toggleSecao(secaoId, iconId) {
    let secao = document.getElementById(secaoId);
    let icone = document.getElementById(iconId);

    if (secao.classList.contains("aberto")) {
        secao.classList.remove("aberto");
        secao.classList.add("fechado");
        icone.innerText = "▼";
    } else {
        secao.classList.remove("fechado");
        secao.classList.add("aberto");
        icone.innerText = "▲";
    }
}

// 2. TÍTULO DA EMPRESA ERGONÔMICO
const nomeSalvo = localStorage.getItem("nomeEmpresa");
if (nomeSalvo) {
    nomeEmpresaElem.innerText = nomeSalvo;
} else {
    nomeEmpresaElem.innerText = TEXTO_PADRAO_EMPRESA;
}

nomeEmpresaElem.addEventListener("focus", function() {
    if (this.innerText.trim() === TEXTO_PADRAO_EMPRESA) {
        this.innerText = "";
    } else {
        let range = document.createRange();
        range.selectNodeContents(this);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
});

nomeEmpresaElem.addEventListener("blur", function() {
    if (this.innerText.trim() === "") {
        this.innerText = TEXTO_PADRAO_EMPRESA;
        localStorage.removeItem("nomeEmpresa");
    } else {
        localStorage.setItem("nomeEmpresa", this.innerText.trim());
    }
});

// 3. PREENCHER DATA E HORA ATUAIS AUTOMATICAMENTE
function preencherDataHoraAtuais() {
    let agora = new Date();
    let ano = agora.getFullYear();
    let mes = String(agora.getMonth() + 1).padStart(2, '0');
    let dia = String(agora.getDate()).padStart(2, '0');
    let hora = String(agora.getHours()).padStart(2, '0');
    let minuto = String(agora.getMinutes()).padStart(2, '0');

    dataInput.value = `${ano}-${mes}-${dia}`;
    horaInput.value = `${hora}:${minuto}`;
}

// 4. GESTÃO DE CLIENTES
function atualizarClientesUI() {
    listaDatalist.innerHTML = "";
    listaClientesCadastrados.innerHTML = "";
    totalClientesBadge.innerText = clientesSalvos.length;

    if (clientesSalvos.length === 0) {
        listaClientesCadastrados.innerHTML = "<p style='color:#888; font-size:0.85rem;'>Nenhum cliente salvo.</p>";
    }

    clientesSalvos.forEach((c, index) => {
        let opt = document.createElement("option");
        opt.value = c.nome;
        listaDatalist.appendChild(opt);

        let div = document.createElement("div");
        div.className = "item-cliente-salvo";
        let telTxt = c.telefone ? c.telefone : "NADA";
        div.innerHTML = `
            <span><strong>${c.nome}</strong> (${telTxt})</span>
            <button class="btn-apagar-cliente" onclick="apagarCliente(${index})">Apagar</button>
        `;
        listaClientesCadastrados.appendChild(div);
    });
}

function apagarCliente(index) {
    if (confirm(`Deseja apagar o cadastro de ${clientesSalvos[index].nome}?`)) {
        clientesSalvos.splice(index, 1);
        localStorage.setItem("clientes", JSON.stringify(clientesSalvos));
        atualizarClientesUI();
    }
}

nomeInput.addEventListener("input", function() {
    let encontrado = clientesSalvos.find(c => c.nome.toLowerCase() === this.value.toLowerCase());
    if (encontrado) {
        telInput.value = encontrado.telefone || "";
    }
});

// 5. NOVO AGENDAMENTO
form.addEventListener("submit", function(e) {
    e.preventDefault();

    let telTratado = telInput.value.trim();

    let clienteIndex = clientesSalvos.findIndex(c => c.nome.toLowerCase() === nomeInput.value.trim().toLowerCase());
    if (clienteIndex === -1) {
        clientesSalvos.push({ nome: nomeInput.value.trim(), telefone: telTratado });
    } else if (telTratado && !clientesSalvos[clienteIndex].telefone) {
        clientesSalvos[clienteIndex].telefone = telTratado;
    }
    localStorage.setItem("clientes", JSON.stringify(clientesSalvos));
    atualizarClientesUI();

    let dataHoraString = `${dataInput.value}T${horaInput.value}`;

    let novoAgendamento = {
        id: Date.now(),
        cliente: nomeInput.value.trim(),
        telefone: telTratado,
        valor: parseFloat(valorInput.value),
        horario: dataHoraString,
        formaPagamento: "",
        status: "agendado"
    };

    agendamentos.push(novoAgendamento);
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

    let [ano, mes, dia] = dataInput.value.split("-");
    alert(`✅ Agendamento Confirmado!\n\nCliente: ${nomeInput.value}\nData: ${dia}/${mes}/${ano} às ${horaInput.value}\nValor: R$ ${parseFloat(valorInput.value).toFixed(2)}`);

    form.reset();
    preencherDataHoraAtuais();
    renderizarAgenda();
    renderizarHistorico();
});

// 6. RENDERIZAR AGENDAS (HOJE VS FUTUROS)
function renderizarAgenda() {
    listaAgendamentosHoje.innerHTML = "";
    listaAgendamentosFuturos.innerHTML = "";

    let totalGanhoHoje = 0;
    let totalAtendidosHoje = 0;

    let agora = new Date();
    let anoH = agora.getFullYear();
    let mesH = String(agora.getMonth() + 1).padStart(2, '0');
    let diaH = String(agora.getDate()).padStart(2, '0');
    let dataHojeFormatada = `${anoH}-${mesH}-${diaH}`;

    let contagemHorarios = {};
    agendamentos.forEach(a => {
        if (a.status === "agendado") {
            contagemHorarios[a.horario] = (contagemHorarios[a.horario] || 0) + 1;
        }
    });

    agendamentos.sort((a, b) => a.horario.localeCompare(b.horario));

    let qtdFuturos = 0;
    let dataUltimoGrupo = "";

    agendamentos.forEach(item => {
        let dataItemFormatada = item.horario.split('T')[0];

        if (dataItemFormatada === dataHojeFormatada && item.status === "concluido") {
            totalGanhoHoje += item.valor;
            totalAtendidosHoje++;
        }

        let temConflito = (contagemHorarios[item.horario] > 1) && (item.status === "agendado");
        let card = criarCardAgendamento(item, temConflito);

        if (dataItemFormatada === dataHojeFormatada) {
            listaAgendamentosHoje.appendChild(card);
        } else if (dataItemFormatada > dataHojeFormatada) {
            qtdFuturos++;

            if (dataItemFormatada !== dataUltimoGrupo) {
                dataUltimoGrupo = dataItemFormatada;
                let [a, m, d] = dataItemFormatada.split("-");
                let tituloData = document.createElement("div");
                tituloData.className = "grupo-data-titulo";
                tituloData.innerText = `📅 Agendamentos para ${d}/${m}/${a}`;
                listaAgendamentosFuturos.appendChild(tituloData);
            }

            listaAgendamentosFuturos.appendChild(card);
        }
    });

    totalFuturosBadge.innerText = qtdFuturos;

    if (listaAgendamentosHoje.children.length === 0) {
        listaAgendamentosHoje.innerHTML = "<p style='text-align:center; color:#888; padding:15px;'>Nenhum agendamento para hoje.</p>";
    }
    if (qtdFuturos === 0) {
        listaAgendamentosFuturos.innerHTML = "<p style='text-align:center; color:#888; padding:15px;'>Nenhum agendamento futuro registrado.</p>";
    }

    document.getElementById("faturamentoDia").innerText = `R$ ${totalGanhoHoje.toFixed(2)}`;
    document.getElementById("totalAtendidos").innerText = totalAtendidosHoje;
}

function criarCardAgendamento(item, temConflito) {
    let div = document.createElement("div");
    div.className = `item-agenda ${item.status === 'concluido' ? 'concluido' : ''} ${temConflito ? 'conflito' : ''}`;

    let [dataPart, horaPart] = item.horario.split('T');
    let [ano, mes, dia] = dataPart.split('-');
    let dataFormatada = `${dia}/${mes}/${ano} às ${horaPart}`;

    let telefoneExibicao = item.telefone ? item.telefone : "NADA";
    let linkZap = item.telefone ? `<a class="btn-acao btn-zap" href="https://wa.me/55${item.telefone.replace(/\D/g,'')}" target="_blank">WhatsApp</a>` : '';

    div.innerHTML = `
        <div class="item-agenda-topo">
            <h3>${item.cliente}</h3>
            <select class="select-pagamento-card" onchange="alterarFormaPagamento(${item.id}, this.value)">
                <option value="" ${!item.formaPagamento ? 'selected' : ''}>-- Forma de Pagamento --</option>
                <option value="Pix" ${item.formaPagamento === 'Pix' ? 'selected' : ''}>Pix</option>
                <option value="Dinheiro" ${item.formaPagamento === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
                <option value="Crédito" ${item.formaPagamento === 'Crédito' ? 'selected' : ''}>Cartão de Crédito</option>
                <option value="Débito" ${item.formaPagamento === 'Débito' ? 'selected' : ''}>Cartão de Débito</option>
            </select>
        </div>
        <p><strong>Data/Hora:</strong> ${dataFormatada}</p>
        <p><strong>Telefone:</strong> ${telefoneExibicao}</p>
        <p><strong>Valor:</strong> R$ ${item.valor.toFixed(2)}</p>
        ${temConflito ? '<p class="alerta-conflito">⚠️ ATENÇÃO: CONFLITO DE HORÁRIO!</p>' : ''}
        <div class="acoes-card">
            ${linkZap}
            <button class="btn-acao btn-editar" onclick="abrirModalEdicao(${item.id})">✏️ Editar</button>
            ${item.status === "agendado" ? `<button class="btn-acao btn-concluir" onclick="concluirServico(${item.id})">Marcar Pago</button>` : '<span style="color:#27ae60; font-weight:bold;">✅ Concluído</span>'}
            ${item.status === "agendado" ? `<button class="btn-acao btn-cancelar" onclick="cancelarServico(${item.id})">Cancelar</button>` : ''}
        </div>
    `;
    return div;
}

// 7. ALTERAR FORMA DE PAGAMENTO EM TEMPO REAL
function alterarFormaPagamento(id, valorForma) {
    let item = agendamentos.find(a => a.id === id);
    if (item) {
        item.formaPagamento = valorForma;
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        renderizarHistorico();
    }
}

// 8. MARCAR PAGO & CANCELAR
function concluirServico(id) {
    let item = agendamentos.find(a => a.id === id);
    if (item) {
        item.status = "concluido";
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        renderizarAgenda();
        renderizarHistorico();
    }
}

function cancelarServico(id) {
    if (confirm("Deseja realmente cancelar este agendamento?")) {
        agendamentos = agendamentos.filter(a => a.id !== id);
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        renderizarAgenda();
        renderizarHistorico();
    }
}

// 9. REAGENDAMENTO / EDIÇÃO
function abrirModalEdicao(id) {
    let item = agendamentos.find(a => a.id === id);
    if (!item) return;

    document.getElementById("editId").value = item.id;
    document.getElementById("editCliente").value = item.cliente;
    document.getElementById("editTelefone").value = item.telefone || "";
    document.getElementById("editValor").value = item.valor;

    let [dataPart, horaPart] = item.horario.split('T');
    document.getElementById("editData").value = dataPart;
    document.getElementById("editHora").value = horaPart;

    document.getElementById("modalEdicao").classList.add("aberto");
}

function fecharModal() {
    document.getElementById("modalEdicao").classList.remove("aberto");
}

document.getElementById("formEdicao").addEventListener("submit", function(e) {
    e.preventDefault();

    let id = parseInt(document.getElementById("editId").value);
    let item = agendamentos.find(a => a.id === id);

    if (item) {
        let telTratado = document.getElementById("editTelefone").value.trim();

        item.cliente = document.getElementById("editCliente").value.trim();
        item.telefone = telTratado;
        item.valor = parseFloat(document.getElementById("editValor").value);
        item.horario = `${document.getElementById("editData").value}T${document.getElementById("editHora").value}`;

        let clienteIndex = clientesSalvos.findIndex(c => c.nome.toLowerCase() === item.cliente.toLowerCase());
        if (clienteIndex !== -1 && telTratado) {
            clientesSalvos[clienteIndex].telefone = telTratado;
            localStorage.setItem("clientes", JSON.stringify(clientesSalvos));
            atualizarClientesUI();
        }

        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
        renderizarAgenda();
        renderizarHistorico();
        fecharModal();
    }
});

// 10. HISTÓRICO E FILTROS (CORRIGIDO SEM FUSO UTC)
function inicializarFiltros() {
    let anoAtual = new Date().getFullYear();
    filtroAno.innerHTML = "";
    for (let i = anoAtual - 2; i <= anoAtual + 3; i++) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.innerText = i;
        if (i === anoAtual) opt.selected = true;
        filtroAno.appendChild(opt);
    }
}

function renderizarHistorico() {
    painelHistorico.innerHTML = "";
    let anoSel = parseInt(filtroAno.value);
    let mesSel = filtroMes.value;

    let filtrados = agendamentos.filter(a => {
        let dataPart = a.horario.split('T')[0];
        let [ano, mes] = dataPart.split('-');
        
        let anoBate = parseInt(ano) === anoSel;
        let mesBate = (mesSel === "todos") || ((parseInt(mes) - 1) === parseInt(mesSel));
        return anoBate && mesBate;
    });

    let totalPeriodo = 0;
    let qtdAtendidosPeriodo = 0;
    let somaPix = 0;
    let somaDinheiro = 0;
    let somaCredito = 0;
    let somaDebito = 0;

    if (filtrados.length === 0) {
        painelHistorico.innerHTML = "<p style='color:#888; font-size:0.85rem;'>Nenhum registro encontrado para este período.</p>";
        historicoQtdAtendidos.innerText = "0";
        historicoTotalGanho.innerText = "R$ 0,00";
        subtotalPix.innerText = "R$ 0,00";
        subtotalDinheiro.innerText = "R$ 0,00";
        subtotalCredito.innerText = "R$ 0,00";
        subtotalDebito.innerText = "R$ 0,00";
        return;
    }

    filtrados.forEach(item => {
        let forma = item.formaPagamento || "";

        if (item.status === "concluido") {
            totalPeriodo += item.valor;
            qtdAtendidosPeriodo++;

            if (forma === "Pix") somaPix += item.valor;
            else if (forma === "Dinheiro") somaDinheiro += item.valor;
            else if (forma === "Crédito") somaCredito += item.valor;
            else if (forma === "Débito") somaDebito += item.valor;
        }

        let div = document.createElement("div");
        div.className = "item-historico";

        let [dataPart, horaPart] = item.horario.split('T');
        let [ano, mes, dia] = dataPart.split('-');
        let dataStr = `${dia}/${mes}/${ano}`;

        let textoForma = forma ? `(${forma})` : '(Forma não informada)';

        div.innerHTML = `
            <strong>${dataStr} às ${horaPart}</strong><br>
            ${item.cliente} | R$ ${item.valor.toFixed(2)}<br>
            <small>Status: ${item.status === 'concluido' ? `✅ Pago ${textoForma}` : '📅 Agendado'}</small>
        `;
        painelHistorico.appendChild(div);
    });

    historicoQtdAtendidos.innerText = qtdAtendidosPeriodo;
    historicoTotalGanho.innerText = `R$ ${totalPeriodo.toFixed(2)}`;
    subtotalPix.innerText = `R$ ${somaPix.toFixed(2)}`;
    subtotalDinheiro.innerText = `R$ ${somaDinheiro.toFixed(2)}`;
    subtotalCredito.innerText = `R$ ${somaCredito.toFixed(2)}`;
    subtotalDebito.innerText = `R$ ${somaDebito.toFixed(2)}`;
}

filtroAno.addEventListener("change", renderizarHistorico);
filtroMes.addEventListener("change", renderizarHistorico);

// 11. EXPORTAR E IMPORTAR BACKUP (NOME DE ARQUIVO COM DATA LOCAL)
function exportarBackup() {
    let dadosSistema = {
        nomeEmpresa: localStorage.getItem("nomeEmpresa") || "",
        clientes: clientesSalvos,
        agendamentos: agendamentos
    };

    let jsonTexto = JSON.stringify(dadosSistema, null, 2);
    let blob = new Blob([jsonTexto], { type: "text/plain;charset=utf-8" });

    let hoje = new Date();
    let ano = hoje.getFullYear();
    let mes = String(hoje.getMonth() + 1).padStart(2, '0');
    let dia = String(hoje.getDate()).padStart(2, '0');
    let nomeArquivo = `backup_agendamentos_${ano}-${mes}-${dia}.txt`;

    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(link.href);
}

function importarBackup(event) {
    let arquivo = event.target.files[0];
    if (!arquivo) return;

    let leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            let conteudo = JSON.parse(e.target.result);

            if (conteudo.clientes && conteudo.agendamentos) {
                if (confirm("⚠️ Isso substituirá os dados atuais pelos dados do arquivo. Deseja continuar?")) {
                    clientesSalvos = conteudo.clientes;
                    agendamentos = conteudo.agendamentos;

                    localStorage.setItem("clientes", JSON.stringify(clientesSalvos));
                    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

                    if (conteudo.nomeEmpresa) {
                        localStorage.setItem("nomeEmpresa", conteudo.nomeEmpresa);
                        nomeEmpresaElem.innerText = conteudo.nomeEmpresa;
                    }

                    atualizarClientesUI();
                    renderizarAgenda();
                    renderizarHistorico();

                    alert("✅ Backup restaurado com sucesso!");
                }
            } else {
                alert("❌ Arquivo de backup inválido.");
            }
        } catch (err) {
            alert("❌ Erro ao ler o arquivo de backup. Verifique se o arquivo está correto.");
        }
    };
    leitor.readAsText(arquivo);
    event.target.value = "";
}

// INICIALIZAÇÃO
preencherDataHoraAtuais();
atualizarClientesUI();
inicializarFiltros();
renderizarAgenda();
renderizarHistorico();