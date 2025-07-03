/**
 * Arquivo de compatibilidade para funções removidas
 * Este arquivo contém funções vazias para manter a compatibilidade após a remoção do módulo de horas extras
 */

// Variáveis para compatibilidade
window.valorHoraNormal = 0;
window.horasExtrasRegistros = [];
window.valorPercentualHoraExtra = 0;
window.valorPercentualNoturno = 0;

// Funções vazias para compatibilidade
window.abrirModalNovaHoraExtra = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.abrirModalEditarHoraExtra = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.registrarHoraExtra = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.atualizarHoraExtra = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.excluirHoraExtra = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.marcarHoraExtraComoRecebida = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.marcarHoraExtraComoPendente = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.aplicarFiltros = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.calcularHorasExtrasENoturno = function() {
    return { horasExtras: 0, adicionalNoturno: 0 };
};

window.calcularValorEstimado = function() {
    return 0;
};

window.gerarRelatorio = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.exportarParaExcel = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

window.integrarComFinanceiro = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

// Função para converter uma string de hora (HH:MM) para minutos desde 00:00
window.converterHoraParaMinutos = function(hora) {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
};

// Função para formatar data (mantida para compatibilidade)
window.formatarData = function(dataString) {
    if (!dataString) return '';
    
    // Adicionar 'T12:00:00' para evitar problemas de fuso horário
    const dataComHora = dataString.includes('T') ? dataString : dataString + 'T12:00:00';
    const data = new Date(dataComHora);
    
    // Usar o formato brasileiro (dd/mm/yyyy)
    return data.toLocaleDateString('pt-BR');
};

// Função para atualizar os totais exibidos
window.atualizarTotais = function({ horasExtras, adicionalNoturno, valorTotal }) {
    console.log('Função removida: módulo de horas extras foi desativado');
};

// Função para configurar a alternância entre visualização de tabela e cards
window.configurarAlternanciaVisualizacao = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
};

// Função para adicionar eventos aos botões de editar e excluir
window.adicionarEventosAcoes = function() {
    console.log('Função removida: módulo de horas extras foi desativado');
}; 