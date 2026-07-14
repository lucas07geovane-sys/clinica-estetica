// Tipos que espelham o schema real do Supabase (projeto kxdatmpilygchplcuxqx)

export type FormaPagamento = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
export type StatusPacote = 'ativo' | 'finalizando' | 'encerrado';
export type PerfilUsuario = 'administrador' | 'recepcao' | 'profissional';

export const FORMAS_PAGAMENTO: { value: FormaPagamento; label: string }[] = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
];

export interface ClienteRow {
  id: string;
  nome_completo: string;
  telefone: string;
  data_nascimento: string; // YYYY-MM-DD
  cpf?: string | null;
  email?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  observacoes?: string | null;
  restricoes?: string | null;
  como_conheceu?: string | null;
  profissional_responsavel_id?: string | null;
  foto_url?: string | null;
  created_at?: string;
}

export interface ServicoRow {
  id: string;
  nome: string;
  valor: number;
  tempo_medio: number;
  descricao?: string | null;
  periodicidade_recomendada: number;
  created_at?: string;
}

export interface AgendaRow {
  id: string;
  cliente_id: string;
  profissional_id?: string | null;
  servico_id?: string | null;
  data_agendamento: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM
  hora_fim: string; // HH:MM
  observacoes?: string | null;
  created_at?: string;
}

export interface AtendimentoRow {
  id: string;
  cliente_id: string;
  servico_id?: string | null;
  pacote_cliente_id?: string | null;
  profissional_id?: string | null;
  data_atendimento: string; // YYYY-MM-DD
  hora_atendimento: string; // HH:MM
  valor_cobrado: number;
  forma_pagamento: FormaPagamento;
  observacoes?: string | null;
  foto_antes_url?: string | null;
  foto_depois_url?: string | null;
  data_proximo_retorno: string; // YYYY-MM-DD
  created_at?: string;
}

export interface PacoteRow {
  id: string;
  cliente_id: string;
  nome_pacote: string;
  quantidade_sessoes_total: number;
  quantidade_sessoes_restantes: number;
  valor_total: number;
  status: StatusPacote;
  created_at?: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: string; // YYYY-MM-DD
}

export const somarMinutos = (horaHHMM: string, minutos: number): string => {
  const [h, m] = (horaHHMM || '00:00').split(':').map(Number);
  const total = (h * 60 + m + (minutos || 0) + 24 * 60) % (24 * 60);
  const hh = Math.floor(total / 60).toString().padStart(2, '0');
  const mm = (total % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
};
