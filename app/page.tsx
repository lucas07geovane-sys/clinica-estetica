"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiClock, FiMessageCircle, FiPlus, FiCalendar, FiSearch, FiList, FiHome, FiX, FiTrendingDown, FiEdit2, FiTrash2, FiDollarSign, FiChevronLeft, FiChevronRight, FiTag } from 'react-icons/fi';
import { supabase } from './supabaseClient';
import {
  ClienteRow, ServicoRow, AgendaRow, AtendimentoRow, PacoteRow, Despesa,
  FormaPagamento, FORMAS_PAGAMENTO, somarMinutos,
} from './db-types';

interface Sessao {
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
}

export default function Dashboard() {
  // ---- Dados vindos do Supabase ----
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [servicos, setServicos] = useState<ServicoRow[]>([]);
  const [agenda, setAgenda] = useState<AgendaRow[]>([]);
  const [atendimentos, setAtendimentos] = useState<AtendimentoRow[]>([]);
  const [pacotes, setPacotes] = useState<PacoteRow[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [profissionalId, setProfissionalId] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  const carregarTudo = useCallback(async () => {
    const [cliRes, servRes, agRes, atdRes, pacRes, despRes, userRes] = await Promise.all([
      supabase.from('clientes').select('*').order('created_at'),
      supabase.from('servicos').select('*').order('nome'),
      supabase.from('agenda').select('*').order('data_agendamento').order('hora_inicio'),
      supabase.from('atendimentos').select('*').order('data_atendimento'),
      supabase.from('pacotes_clientes').select('*'),
      supabase.from('despesas').select('*').order('data'),
      supabase.from('usuarios').select('id').limit(1),
    ]);

    const primeiroErro = [cliRes, servRes, agRes, atdRes, pacRes, despRes, userRes].find(r => r.error)?.error;
    if (primeiroErro) {
      console.error('Erro ao carregar dados:', primeiroErro);
      setErroCarregamento(primeiroErro.message);
    } else {
      setErroCarregamento(null);
    }

    if (cliRes.data) setClientes(cliRes.data as ClienteRow[]);
    if (servRes.data) setServicos(servRes.data as ServicoRow[]);
    if (agRes.data) setAgenda(agRes.data as AgendaRow[]);
    if (atdRes.data) setAtendimentos(atdRes.data.map(a => ({ ...a, valor_cobrado: Number(a.valor_cobrado) || 0 })) as AtendimentoRow[]);
    if (pacRes.data) setPacotes(pacRes.data.map(p => ({ ...p, valor_total: Number(p.valor_total) || 0 })) as PacoteRow[]);
    if (despRes.data) setDespesas(despRes.data.map(d => ({ ...d, valor: Number(d.valor) || 0 })) as Despesa[]);
    setProfissionalId(userRes.data?.[0]?.id ?? null);
    setCarregado(true);
  }, []);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  const [modoAgenda, setModoAgenda] = useState<'lista' | 'calendario'>('lista');
  const [abaAtiva, setAbaAtiva] = useState<'home' | 'lista' | 'financeiro' | 'servicos'>('home');
  const [filtroLista, setFiltroLista] = useState<'todas' | 'hoje' | 'ausentes'>('todas');
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalEditarDespesaAberto, setModalEditarDespesaAberto] = useState(false);
  const [modalServicoAberto, setModalServicoAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [clienteExpandidoSessoes, setClienteExpandidoSessoes] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [dataAgendaSelecionada, setDataAgendaSelecionada] = useState('2026-07-13');

  const [nomeForm, setNomeForm] = useState('');
  const [telForm, setTelForm] = useState('');
  const [dataNascimentoForm, setDataNascimentoForm] = useState('1995-01-01');
  const [dataForm, setDataForm] = useState('2026-07-13');
  const [horarioForm, setHorarioForm] = useState('');
  const [valorForm, setValorForm] = useState('150');
  const [tipoAtendimentoForm, setTipoAtendimentoForm] = useState<'unico' | 'pacote'>('unico');
  const [servicoIdForm, setServicoIdForm] = useState('');
  const [formaPagamentoForm, setFormaPagamentoForm] = useState<FormaPagamento>('pix');

  const [sessao1, setSessao1] = useState<Sessao>({ data: '2026-07-13', horario: '' });
  const [sessao2, setSessao2] = useState<Sessao>({ data: '2026-07-28', horario: '' });
  const [sessao3, setSessao3] = useState<Sessao>({ data: '2026-08-12', horario: '' });

  const [descDespesaForm, setDescDespesaForm] = useState('');
  const [valorDespesaForm, setValorDespesaForm] = useState('');
  const [dataDespesaForm, setDataDespesaForm] = useState('2026-07-13');

  const [nomeServicoForm, setNomeServicoForm] = useState('');
  const [valorServicoForm, setValorServicoForm] = useState('150');
  const [tempoServicoForm, setTempoServicoForm] = useState('60');
  const [periodicidadeServicoForm, setPeriodicidadeServicoForm] = useState('25');

  const [clienteSendoEditada, setClienteSendoEditada] = useState<{
    id: string; nome_completo: string; telefone: string; data_nascimento: string;
    servico_id: string; valor_pago: number; forma_pagamento: FormaPagamento;
    tipoAtendimento: 'unico' | 'pacote'; data_atendimento: string; horario_atendimento: string;
    atendimentoId: string; pacoteClienteId: string | null; agendaPrincipalId: string | null;
  } | null>(null);
  const [despesaSendoEditada, setDespesaSendoEditada] = useState<Despesa | null>(null);

  useEffect(() => {
    if (servicos.length > 0 && !servicoIdForm) setServicoIdForm(servicos[0].id);
  }, [servicos, servicoIdForm]);

  const [mensagemTemplate, setMensagemTemplate] = useState(
    "Olá, {{Nome}}! Tudo bem? Percebemos que faz um tempinho desde seu último atendimento na Thay Rosalis Beauty. Gostaríamos de lembrar que já está na hora do seu retorno. Podemos agendar um horário para você? 💖"
  );

  const hojeFormatado = '2026-07-13';

  const formatarDataAgendaExibicao = (dataString?: string | null) => {
    if (!dataString || typeof dataString !== 'string') return '--/--/----';
    const partes = dataString.split('-');
    if (partes.length !== 3) return dataString;
    const [ano, mes, dia] = partes;
    return dia + '/' + mes + '/' + ano;
  };

  const calcularDiasSemRetorno = (dataString?: string | null) => {
    if (!dataString) return 0;
    const hoje = new Date('2026-07-13');
    const dataPassada = new Date(dataString);
    const diferencaTempo = hoje.getTime() - dataPassada.getTime();
    return Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));
  };

  const alterarDiaAgenda = (dias: number) => {
    const dataAtual = new Date(dataAgendaSelecionada + 'T12:00:00');
    dataAtual.setDate(dataAtual.getDate() + dias);
    setDataAgendaSelecionada(dataAtual.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (dataForm) {
      setSessao1({ data: dataForm, horario: horarioForm });

      const d2 = new Date(dataForm + 'T12:00:00');
      d2.setDate(d2.getDate() + 15);
      setSessao2({ data: d2.toISOString().split('T')[0], horario: horarioForm });

      const d3 = new Date(dataForm + 'T12:00:00');
      d3.setDate(d3.getDate() + 30);
      setSessao3({ data: d3.toISOString().split('T')[0], horario: horarioForm });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataForm, horarioForm]);

  const nomeServico = (servicoId?: string | null) => servicos.find(s => s.id === servicoId)?.nome || 'Outros';

  const clientesProcessadas = clientes.map(c => {
    const atendimentosDoCliente = atendimentos
      .filter(a => a.cliente_id === c.id)
      .sort((a, b) => (a.data_atendimento + a.hora_atendimento).localeCompare(b.data_atendimento + b.hora_atendimento));
    const atendimentoPrincipal = atendimentosDoCliente[0];
    const pacoteAtivo = pacotes.find(p => p.cliente_id === c.id && p.status !== 'encerrado');
    const agendaDoCliente = agenda
      .filter(a => a.cliente_id === c.id)
      .sort((a, b) => (a.data_agendamento + a.hora_inicio).localeCompare(b.data_agendamento + b.hora_inicio));

    return {
      ...c,
      atendimentoPrincipal,
      pacoteAtivo,
      agendaDoCliente,
      servico: nomeServico(atendimentoPrincipal?.servico_id),
      servico_id: atendimentoPrincipal?.servico_id || '',
      tipoAtendimento: (pacoteAtivo ? 'pacote' : 'unico') as 'unico' | 'pacote',
      ultimo_atendimento: atendimentoPrincipal?.data_atendimento || '',
      horario_atendimento: atendimentoPrincipal?.hora_atendimento || '',
      valor_pago: atendimentoPrincipal?.valor_cobrado || 0,
      diasAusente: calcularDiasSemRetorno(atendimentoPrincipal?.data_atendimento),
      sessoesPacote: agendaDoCliente.map(a => ({ id: a.id, data: a.data_agendamento, horario: a.hora_inicio })),
    };
  });

  type ClienteProcessada = typeof clientesProcessadas[number];

  const clienteTemAtendimentoNaData = (cliente: ClienteProcessada, dataStr: string) =>
    cliente.agendaDoCliente.some(a => a.data_agendamento === dataStr);

  const obterHorarioNaData = (cliente: ClienteProcessada, dataStr: string) => {
    const sessao = cliente.agendaDoCliente.find(a => a.data_agendamento === dataStr);
    return sessao ? sessao.hora_inicio : (cliente.horario_atendimento || "00:00");
  };

  const clientesNecessitamRetorno = clientesProcessadas.filter(c => c.diasAusente >= 25);

  const clientesAgendaFiltradas = clientesProcessadas
    .filter(c => clienteTemAtendimentoNaData(c, dataAgendaSelecionada))
    .sort((a, b) => obterHorarioNaData(a, dataAgendaSelecionada).localeCompare(obterHorarioNaData(b, dataAgendaSelecionada)));

  const clientesAtendidasHojeCard = clientesProcessadas.filter(c => clienteTemAtendimentoNaData(c, hojeFormatado));

  const faturamentoTotal = atendimentos.reduce((acc, a) => {
    if (a.data_atendimento && a.data_atendimento <= hojeFormatado) return acc + (Number(a.valor_cobrado) || 0);
    return acc;
  }, 0);

  const despesasTotal = despesas.reduce((acc, d) => {
    if (d.data && d.data <= hojeFormatado) return acc + (Number(d.valor) || 0);
    return acc;
  }, 0);
  const lucroLiquido = faturamentoTotal - despesasTotal;

  const clientesFiltradasPorAba = clientesProcessadas.filter(c => {
    if (filtroLista === 'hoje') return clienteTemAtendimentoNaData(c, hojeFormatado);
    if (filtroLista === 'ausentes') return c.diasAusente >= 25;
    return true;
  }).filter(c => c.nome_completo && c.nome_completo.toLowerCase().includes(busca.toLowerCase()));

  const handleCadastrarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salvando) return;
    if (!profissionalId) { alert('Nenhum profissional cadastrado no banco. Rode o script de setup (usuarios) antes de continuar.'); return; }
    const servico = servicos.find(s => s.id === servicoIdForm);
    if (!servico) { alert('Selecione um serviço.'); return; }

    setSalvando(true);
    try {
      const { data: clienteInserido, error: erroCliente } = await supabase.from('clientes').insert({
        nome_completo: nomeForm,
        telefone: telForm.replace(/\D/g, ''),
        data_nascimento: dataNascimentoForm,
        profissional_responsavel_id: profissionalId,
      }).select().single();
      if (erroCliente || !clienteInserido) throw erroCliente;

      const clienteId = clienteInserido.id as string;
      let pacoteClienteId: string | null = null;

      if (tipoAtendimentoForm === 'pacote') {
        const { data: pacoteInserido, error: erroPacote } = await supabase.from('pacotes_clientes').insert({
          cliente_id: clienteId,
          nome_pacote: servico.nome + ' - Pacote 3 Sessões',
          quantidade_sessoes_total: 3,
          quantidade_sessoes_restantes: 3,
          valor_total: Number(valorForm) || 0,
          status: 'ativo',
        }).select().single();
        if (erroPacote || !pacoteInserido) throw erroPacote;
        pacoteClienteId = pacoteInserido.id as string;

        for (const sessao of [sessao1, sessao2, sessao3]) {
          const { error: erroAgenda } = await supabase.from('agenda').insert({
            cliente_id: clienteId,
            profissional_id: profissionalId,
            servico_id: servico.id,
            data_agendamento: sessao.data,
            hora_inicio: sessao.horario || '00:00',
            hora_fim: somarMinutos(sessao.horario || '00:00', servico.tempo_medio),
          });
          if (erroAgenda) throw erroAgenda;
        }
      } else {
        const { error: erroAgenda } = await supabase.from('agenda').insert({
          cliente_id: clienteId,
          profissional_id: profissionalId,
          servico_id: servico.id,
          data_agendamento: dataForm,
          hora_inicio: horarioForm || '00:00',
          hora_fim: somarMinutos(horarioForm || '00:00', servico.tempo_medio),
        });
        if (erroAgenda) throw erroAgenda;
      }

      const dataPrimeiraSessao = tipoAtendimentoForm === 'pacote' ? sessao1.data : dataForm;
      const horaPrimeiraSessao = tipoAtendimentoForm === 'pacote' ? sessao1.horario : horarioForm;
      const dataRetorno = new Date(dataPrimeiraSessao + 'T12:00:00');
      dataRetorno.setDate(dataRetorno.getDate() + (servico.periodicidade_recomendada || 25));

      const { error: erroAtendimento } = await supabase.from('atendimentos').insert({
        cliente_id: clienteId,
        servico_id: servico.id,
        pacote_cliente_id: pacoteClienteId,
        profissional_id: profissionalId,
        data_atendimento: dataPrimeiraSessao,
        hora_atendimento: horaPrimeiraSessao || '00:00',
        valor_cobrado: Number(valorForm) || 0,
        forma_pagamento: formaPagamentoForm,
        data_proximo_retorno: dataRetorno.toISOString().split('T')[0],
      });
      if (erroAtendimento) throw erroAtendimento;

      await carregarTudo();
      setNomeForm(''); setTelForm(''); setDataNascimentoForm('1995-01-01'); setDataForm('2026-07-13');
      setHorarioForm(''); setValorForm('150'); setTipoAtendimentoForm('unico'); setFormaPagamentoForm('pix');
      setModalClienteAberto(false);
      setAbaAtiva('home');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Erro ao salvar cadastro: ' + msg);
    } finally {
      setSalvando(false);
    }
  };

  const handleCadastrarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('despesas').insert({
      descricao: descDespesaForm,
      valor: Number(valorDespesaForm) || 0,
      data: dataDespesaForm,
    });
    if (error) { alert('Erro ao registrar despesa: ' + error.message); return; }
    await carregarTudo();
    setDescDespesaForm(''); setValorDespesaForm(''); setDataDespesaForm('2026-07-13');
    setModalDespesaAberto(false);
    setAbaAtiva('financeiro');
  };

  const iniciarEdicao = (cliente: ClienteProcessada) => {
    if (!cliente.atendimentoPrincipal) return;
    setClienteSendoEditada({
      id: cliente.id,
      nome_completo: cliente.nome_completo,
      telefone: cliente.telefone,
      data_nascimento: cliente.data_nascimento,
      servico_id: cliente.atendimentoPrincipal.servico_id || '',
      valor_pago: cliente.atendimentoPrincipal.valor_cobrado,
      forma_pagamento: cliente.atendimentoPrincipal.forma_pagamento,
      tipoAtendimento: cliente.tipoAtendimento,
      data_atendimento: cliente.atendimentoPrincipal.data_atendimento,
      horario_atendimento: cliente.atendimentoPrincipal.hora_atendimento,
      atendimentoId: cliente.atendimentoPrincipal.id,
      pacoteClienteId: cliente.pacoteAtivo?.id || null,
      agendaPrincipalId: cliente.agendaDoCliente[0]?.id || null,
    });
    setModalEditarAberto(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSendoEditada) return;
    const c = clienteSendoEditada;
    try {
      const { error: erroCli } = await supabase.from('clientes').update({
        nome_completo: c.nome_completo,
        telefone: c.telefone.replace(/\D/g, ''),
        data_nascimento: c.data_nascimento,
      }).eq('id', c.id);
      if (erroCli) throw erroCli;

      const atendimentoUpdate: Record<string, unknown> = {
        servico_id: c.servico_id,
        valor_cobrado: c.valor_pago,
        forma_pagamento: c.forma_pagamento,
      };
      if (c.tipoAtendimento === 'unico') {
        atendimentoUpdate.data_atendimento = c.data_atendimento;
        atendimentoUpdate.hora_atendimento = c.horario_atendimento;
      }
      const { error: erroAtd } = await supabase.from('atendimentos').update(atendimentoUpdate).eq('id', c.atendimentoId);
      if (erroAtd) throw erroAtd;

      if (c.pacoteClienteId) {
        const { error: erroPac } = await supabase.from('pacotes_clientes').update({ valor_total: c.valor_pago }).eq('id', c.pacoteClienteId);
        if (erroPac) throw erroPac;
      }

      if (c.tipoAtendimento === 'unico' && c.agendaPrincipalId) {
        const { error: erroAg } = await supabase.from('agenda').update({
          servico_id: c.servico_id,
          data_agendamento: c.data_atendimento,
          hora_inicio: c.horario_atendimento,
        }).eq('id', c.agendaPrincipalId);
        if (erroAg) throw erroAg;
      }

      await carregarTudo();
      setModalEditarAberto(false);
      setClienteSendoEditada(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Erro ao salvar alterações: ' + msg);
    }
  };

  const handleExcluirCliente = async (id: string, nome: string) => {
    if (!confirm('Tem certeza que deseja remover ' + nome + ' do sistema?')) return;
    await supabase.from('agenda').delete().eq('cliente_id', id);
    await supabase.from('atendimentos').delete().eq('cliente_id', id);
    await supabase.from('pacotes_clientes').delete().eq('cliente_id', id);
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) { alert('Erro ao remover cliente: ' + error.message); return; }
    await carregarTudo();
  };

  const handleEditarSessaoEspecifica = async (cliente: ClienteProcessada, agendaId: string, sessaoAtual: Sessao) => {
    const novaData = prompt('Editar DATA da sessão (AAAA-MM-DD):', sessaoAtual?.data || hojeFormatado);
    if (!novaData) return;
    const novaHora = prompt('Editar HORÁRIO da sessão (HH:MM):', sessaoAtual?.horario || "00:00");
    if (!novaHora) return;

    const { error } = await supabase.from('agenda').update({ data_agendamento: novaData, hora_inicio: novaHora }).eq('id', agendaId);
    if (error) { alert('Erro ao editar sessão: ' + error.message); return; }

    const ehPrimeira = cliente.agendaDoCliente[0]?.id === agendaId;
    if (ehPrimeira && cliente.atendimentoPrincipal) {
      await supabase.from('atendimentos').update({ data_atendimento: novaData, hora_atendimento: novaHora }).eq('id', cliente.atendimentoPrincipal.id);
    }
    await carregarTudo();
  };

  const handleAdicionarSessaoAvulsa = async (cliente: ClienteProcessada) => {
    const dataSessao = prompt("Digite a data da nova sessão (AAAA-MM-DD):", hojeFormatado);
    if (!dataSessao) return;
    const horaSessao = prompt("Digite o horário da sessão (HH:MM):", "09:00");
    if (!horaSessao) return;

    const servico = servicos.find(s => s.id === cliente.servico_id);
    const { error } = await supabase.from('agenda').insert({
      cliente_id: cliente.id,
      profissional_id: profissionalId,
      servico_id: cliente.servico_id || null,
      data_agendamento: dataSessao,
      hora_inicio: horaSessao,
      hora_fim: somarMinutos(horaSessao, servico?.tempo_medio || 60),
    });
    if (error) { alert('Erro ao adicionar sessão: ' + error.message); return; }
    await carregarTudo();
  };

  const handleRemoverSessao = async (agendaId: string) => {
    if (!confirm("Deseja remover o registro desta sessão?")) return;
    const { error } = await supabase.from('agenda').delete().eq('id', agendaId);
    if (error) { alert('Erro ao remover sessão: ' + error.message); return; }
    await carregarTudo();
  };

  const iniciarEdicaoDespesa = (despesa: Despesa) => {
    setDespesaSendoEditada({ ...despesa });
    setModalEditarDespesaAberto(true);
  };

  const handleSalvarEdicaoDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!despesaSendoEditada) return;
    const { error } = await supabase.from('despesas').update({
      descricao: despesaSendoEditada.descricao,
      valor: despesaSendoEditada.valor,
      data: despesaSendoEditada.data,
    }).eq('id', despesaSendoEditada.id);
    if (error) { alert('Erro ao salvar despesa: ' + error.message); return; }
    await carregarTudo();
    setModalEditarDespesaAberto(false);
    setDespesaSendoEditada(null);
  };

  const handleExcluirDespesa = async (id: string, descricao: string) => {
    if (!confirm('Tem certeza que deseja excluir a despesa "' + descricao + '"?')) return;
    const { error } = await supabase.from('despesas').delete().eq('id', id);
    if (error) { alert('Erro ao excluir despesa: ' + error.message); return; }
    await carregarTudo();
  };

  const handleCadastrarServico = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('servicos').insert({
      nome: nomeServicoForm,
      valor: Number(valorServicoForm) || 0,
      tempo_medio: Number(tempoServicoForm) || 60,
      periodicidade_recomendada: Number(periodicidadeServicoForm) || 25,
    });
    if (error) { alert('Erro ao cadastrar serviço: ' + error.message); return; }
    await carregarTudo();
    setNomeServicoForm(''); setValorServicoForm('150'); setTempoServicoForm('60'); setPeriodicidadeServicoForm('25');
    setModalServicoAberto(false);
  };

  const handleExcluirServico = async (id: string, nome: string) => {
    if (!confirm('Excluir o serviço "' + nome + '" do catálogo? (não afeta atendimentos já registrados)')) return;
    const { error } = await supabase.from('servicos').delete().eq('id', id);
    if (error) { alert('Erro ao excluir serviço (verifique se ainda há atendimentos vinculados): ' + error.message); return; }
    await carregarTudo();
  };

  const gerarLinkWhatsApp = (nome: string, telefone: string) => {
    const msgPronta = mensagemTemplate.replace('{{Nome}}', nome || '');
    return 'https://api.whatsapp.com/send?phone=55' + telefone + '&text=' + encodeURIComponent(msgPronta);
  };

  const navegarParaListaComFiltro = (filtro: 'todas' | 'hoje' | 'ausentes') => {
    setFiltroLista(filtro);
    setAbaAtiva('lista');
  };

  const renderizarDiasCalendario = () => {
    const diasNoMes = 31;
    const espacosVaziosIniciais = 3;
    const elementos = [];

    for (let i = 0; i < espacosVaziosIniciais; i++) {
      elementos.push(<div key={'vazio-' + i} className="min-h-[90px] border-b border-r border-gray-100 bg-gray-50/20"></div>);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
      const diaStringFormato = '2026-07-' + dia.toString().padStart(2, '0');
      const ehHoje = diaStringFormato === hojeFormatado;
      const ehSelecionado = diaStringFormato === dataAgendaSelecionada;

      const clientesDoDia = clientesProcessadas.filter(c => clienteTemAtendimentoNaData(c, diaStringFormato));

      elementos.push(
        <div
          key={'dia-' + dia}
          onClick={() => { setDataAgendaSelecionada(diaStringFormato); setModoAgenda('lista'); }}
          className={'min-h-[95px] p-1 border-b border-r border-gray-100 flex flex-col justify-between cursor-pointer transition relative group ' + (ehSelecionado ? 'bg-[#F3D1C9]/20' : 'hover:bg-gray-50')}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={'text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full tracking-tighter ' + (ehHoje ? 'bg-red-600 text-white font-black' : 'text-[#4A3E3D]')}>
              {dia}
            </span>
          </div>

          <div className="flex-1 space-y-0.5 overflow-y-auto max-h-[65px] scrollbar-none pr-0.5">
            {clientesDoDia.slice(0, 3).map((c, idx) => (
              <div key={idx} className={'text-[10px] px-1 py-0.5 rounded-sm truncate leading-tight font-medium ' + (c.tipoAtendimento === 'pacote' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800')}>
                {(c.nome_completo || 'Sem Nome').split(' ')[0]} ({c.servico || 'Sobranc.'})
              </div>
            ))}
            {clientesDoDia.length > 3 && (
              <div className="text-[9px] text-gray-400 font-bold pl-1">+{clientesDoDia.length - 3}</div>
            )}
          </div>
        </div>
      );
    }

    return elementos;
  };

  if (!carregado) {
    return <div className="min-h-screen bg-[#FAF7F9] flex items-center justify-center font-serif text-gray-400">Carregando painel seguro...</div>;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen bg-[#FAF7F9] text-[#4A3E3D]">

      {erroCarregamento && (
        <div className="max-w-7xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
          Erro ao conectar com o banco: {erroCarregamento}. Verifique se o script de setup (tabelas/policies) foi executado no Supabase.
        </div>
      )}

      {!profissionalId && (
        <div className="max-w-7xl mx-auto mb-4 bg-amber-50 border border-amber-200 text-amber-700 text-sm p-3 rounded-xl">
          Nenhum profissional encontrado na tabela usuarios. Rode o script de setup para semear o registro inicial antes de cadastrar clientes.
        </div>
      )}

      <div className="max-w-7xl mx-auto bg-white p-4 rounded-2xl shadow-md border border-[#F5EBE6] mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <button onClick={() => setAbaAtiva('home')} className="flex items-center gap-3 group text-left focus:outline-none">
            <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] group-hover:scale-110 transition"></div>
            <span className="font-serif font-bold text-2xl tracking-wide text-[#4A3E3D] group-hover:text-[#E0B5AC] transition">Thay Rosalis Beauty</span>
          </button>

          <div className="flex gap-1 border-l border-gray-200 pl-4">
            <button onClick={() => setAbaAtiva('home')} className={'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ' + (abaAtiva === 'home' ? 'bg-[#F3D1C9] text-[#4A3E3D]' : 'text-gray-500 hover:bg-gray-50')}><FiHome /> Painel</button>
            <button onClick={() => { setAbaAtiva('lista'); setFiltroLista('todas'); }} className={'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ' + (abaAtiva === 'lista' && filtroLista === 'todas' ? 'bg-[#F3D1C9] text-[#4A3E3D]' : 'text-gray-500 hover:bg-gray-50')}><FiList /> Clientes</button>
            <button onClick={() => setAbaAtiva('financeiro')} className={'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ' + (abaAtiva === 'financeiro' ? 'bg-[#F3D1C9] text-[#4A3E3D]' : 'text-gray-500 hover:bg-gray-50')}><FiDollarSign /> Fluxo de Caixa</button>
            <button onClick={() => setAbaAtiva('servicos')} className={'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ' + (abaAtiva === 'servicos' ? 'bg-[#F3D1C9] text-[#4A3E3D]' : 'text-gray-500 hover:bg-gray-50')}><FiTag /> Serviços</button>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => setModalDespesaAberto(true)} className="flex-1 md:flex-none border border-red-200 hover:bg-red-50 text-red-600 font-semibold px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            <FiTrendingDown /> Nova Despesa
          </button>
          <button onClick={() => setModalClienteAberto(true)} className="flex-1 md:flex-none bg-[#F3D1C9] hover:bg-[#E0B5AC] text-[#4A3E3D] font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
            <FiPlus className="stroke-[3]" /> Nova Cliente
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">

        {abaAtiva === 'home' && (
          <>
            <header className="mb-6">
              <h1 className="font-serif text-3xl text-[#4A3E3D] font-bold tracking-tight">Painel de Controle</h1>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div onClick={() => navegarParaListaComFiltro('todas')} className="bg-white p-6 rounded-2xl shadow-sm border border-[#F5EBE6] flex items-center justify-between cursor-pointer hover:shadow-md transition group">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-[#E0B5AC] transition">Clientes Cadastradas</p>
                  <h3 className="text-2xl font-black mt-1 text-[#4A3E3D]">{clientes.length}</h3>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF0ED] text-[#E0B5AC]">
                  <FiUsers size={22} className="stroke-[2.5]" />
                </div>
              </div>

              <div onClick={() => navegarParaListaComFiltro('hoje')} className="bg-white p-6 rounded-2xl shadow-sm border border-[#F5EBE6] flex items-center justify-between cursor-pointer hover:shadow-md transition group">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-emerald-600 transition">Atendimentos Hoje</p>
                  <h3 className="text-2xl font-black mt-1 text-emerald-600">{clientesAtendidasHojeCard.length}</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                  <FiCalendar size={22} className="stroke-[2.5]" />
                </div>
              </div>

              <div onClick={() => navegarParaListaComFiltro('ausentes')} className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between cursor-pointer bg-red-50/10 hover:shadow-md transition group">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-500 transition">Ausentes +25 dias</p>
                  <h3 className="text-2xl font-black text-red-600 mt-1">{clientesNecessitamRetorno.length}</h3>
                </div>
                <div className="p-3 rounded-xl bg-red-50 text-red-500">
                  <FiClock size={22} className="stroke-[2.5]" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F5EBE6] mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">

                <button
                  onClick={() => setModoAgenda(modoAgenda === 'lista' ? 'calendario' : 'lista')}
                  className="font-serif text-xl font-bold text-[#4A3E3D] flex items-center gap-2 hover:text-[#E0B5AC] transition group text-left"
                >
                  <span>📅</span>
                  <span className="underline decoration-dotted group-hover:decoration-solid">
                    {modoAgenda === 'lista' ? 'Agenda ' + formatarDataAgendaExibicao(dataAgendaSelecionada) : "Calendário Julho 2026"}
                  </span>
                  <span className="text-xs font-sans text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-normal group-hover:bg-[#F3D1C9] group-hover:text-[#4A3E3D]">Alternar visão</span>
                </button>

                <div className="flex items-center gap-2 bg-[#FAF7F9] p-1 rounded-xl border border-gray-200 text-xs">
                  <button onClick={() => { setModoAgenda('lista'); alterarDiaAgenda(-1); }} className="p-1.5 rounded-lg hover:bg-white hover:shadow-xs text-gray-600 transition flex items-center gap-1">
                    <FiChevronLeft /> Dia Anterior
                  </button>
                  <button onClick={() => { setDataAgendaSelecionada('2026-07-13'); setModoAgenda('lista'); }} className={'px-3 py-1.5 rounded-lg font-semibold transition ' + (dataAgendaSelecionada === '2026-07-13' && modoAgenda === 'lista' ? 'bg-white shadow-xs text-[#4A3E3D]' : 'text-gray-500')}>
                    Hoje
                  </button>
                  <button onClick={() => { setModoAgenda('lista'); alterarDiaAgenda(1); }} className="p-1.5 rounded-lg hover:bg-white hover:shadow-xs text-gray-600 transition flex items-center gap-1">
                    Próximo Dia <FiChevronRight />
                  </button>
                </div>
              </div>

              {modoAgenda === 'lista' && (
                clientesAgendaFiltradas.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Nenhum atendimento agendado para o dia {formatarDataAgendaExibicao(dataAgendaSelecionada)}. 🌸
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clientesAgendaFiltradas.map((cliente) => (
                      <div key={cliente.id} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex items-center justify-between gap-4 shadow-2xs group relative">
                        <div>
                          <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                            🕒 {obterHorarioNaData(cliente, dataAgendaSelecionada)}
                          </span>
                          <h4 className="font-bold text-[#4A3E3D] text-base">{cliente.nome_completo || 'Sem Nome'}</h4>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                            <span className="text-[#D4AF37] bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 mr-1">{cliente.servico || 'Geral'}</span>
                            • {cliente.tipoAtendimento}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end justify-between h-full min-h-[50px]">
                          <div className="flex gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
                            <button onClick={() => iniciarEdicao(cliente)} title="Editar cliente" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-md bg-white/50 border border-gray-100 shadow-2xs transition">
                              <FiEdit2 size={13} />
                            </button>
                            <button onClick={() => handleExcluirCliente(cliente.id, cliente.nome_completo)} title="Excluir cliente" className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-md bg-white/50 border border-gray-100 shadow-2xs transition">
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {modoAgenda === 'calendario' && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs animate-fadeIn">
                  <div className="bg-[#FAF7F9] p-4 border-b border-gray-200 text-center">
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-[#4A3E3D]">Julho 2026</h3>
                  </div>

                  <div className="grid grid-cols-7 text-center bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 py-2 uppercase tracking-widest">
                    <div>D</div> <div>S</div> <div>T</div> <div>Q</div> <div>Q</div> <div>S</div> <div>S</div>
                  </div>

                  <div className="grid grid-cols-7 border-l border-t border-gray-100">
                    {renderizarDiasCalendario()}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F5EBE6] lg:col-span-2">
                <h2 className="font-serif text-xl font-bold mb-6 text-[#4A3E3D] flex items-center gap-2 border-b border-gray-100 pb-3">
                  <span className="text-xl">⚠️</span>
                  <span>Ações Urgentes de Retorno</span>
                </h2>
                <div className="divide-y divide-gray-100">
                  {clientesNecessitamRetorno.length === 0 ? (
                    <p className="py-4 text-sm text-gray-400 text-center">Nenhuma cliente pendente de retorno no momento. ✨</p>
                  ) : (
                    clientesNecessitamRetorno.slice(0, 4).map((cliente) => (
                      <div key={cliente.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="text-red-500 mt-0.5 animate-pulse">🔴</span>
                          <div>
                            <strong className="text-base font-semibold text-[#4A3E3D]">{cliente.nome_completo} ({cliente.servico})</strong>
                            <p className="text-xs text-gray-500 mt-1">Último procedimento há <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">{cliente.diasAusente} dias</span></p>
                          </div>
                        </div>
                        <a href={gerarLinkWhatsApp(cliente.nome_completo, cliente.telefone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-xl transition duration-200 gap-2 shadow-sm"><FiMessageCircle size={15} /> Notificar</a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F5EBE6] flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold mb-1 text-[#4A3E3D]">Mensagem de Lembrete</h3>
                  <textarea className="w-full text-sm p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F3D1C9] resize-none h-44 text-[#4A3E3D] bg-[#FAF7F9]" value={mensagemTemplate} onChange={(e) => setMensagemTemplate(e.target.value)} />
                </div>
              </div>
            </div>
          </>
        )}

        {abaAtiva === 'lista' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-[#F5EBE6]">
            <header className="mb-6 border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#4A3E3D] font-bold">
                  {filtroLista === 'todas' && "Lista Geral de Clientes"}
                  {filtroLista === 'hoje' && "Atendimentos Registrados Hoje 📅"}
                  {filtroLista === 'ausentes' && "Clientes Ausentes (+25 dias) ⚠️"}
                </h2>
              </div>

              <div className="flex bg-[#FAF7F9] p-1 rounded-xl border border-gray-200 self-start text-xs">
                <button onClick={() => setFiltroLista('todas')} className={'px-3 py-1.5 rounded-lg font-medium transition ' + (filtroLista === 'todas' ? 'bg-white shadow-xs text-[#4A3E3D] font-bold' : 'text-gray-400')}>Todas</button>
                <button onClick={() => setFiltroLista('hoje')} className={'px-3 py-1.5 rounded-lg font-medium transition ' + (filtroLista === 'hoje' ? 'bg-white shadow-xs text-emerald-600 font-bold' : 'text-gray-400')}>De Hoje</button>
                <button onClick={() => setFiltroLista('ausentes')} className={'px-3 py-1.5 rounded-lg font-medium transition ' + (filtroLista === 'ausentes' ? 'bg-white shadow-xs text-red-600 font-bold' : 'text-gray-400')}>Ausentes</button>
              </div>
            </header>

            <div className="flex items-center gap-2 bg-[#FAF7F9] px-4 py-2 rounded-xl border border-[#F5EBE6] mb-4 max-w-md">
              <FiSearch className="text-gray-400" />
              <input type="text" placeholder="Filtrar por nome na tabela..." value={busca} onChange={(e) => setBusca(e.target.value)} className="bg-transparent text-sm outline-none w-full text-[#4A3E3D]" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF7F9] text-[#4A3E3D] font-serif font-bold text-xs uppercase">
                  <tr>
                    <th className="p-4 rounded-l-xl">Nome</th>
                    <th className="p-4">Serviço</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Sessões Programadas</th>
                    <th className="p-4">Primeiro Horário</th>
                    <th className="p-4">Data Inicial</th>
                    <th className="p-4 rounded-r-xl text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientesFiltradasPorAba.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-gray-400">Nenhuma cliente registrada nesta categoria.</td></tr>
                  ) : (
                    clientesFiltradasPorAba.map((cliente) => (
                      <React.Fragment key={cliente.id}>
                        <tr className="hover:bg-gray-50/50 transition">
                          <td className="p-4 font-semibold text-[#4A3E3D]">{cliente.nome_completo || 'Sem Nome'}</td>
                          <td className="p-4">
                            <span className="bg-amber-50 text-[#A67C1E] px-2.5 py-1 rounded-xl font-bold text-xs border border-amber-200 shadow-3xs">
                              {cliente.servico || 'Sobrancelhas'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={'px-2 py-0.5 rounded-md text-xs font-bold ' + (cliente.tipoAtendimento === 'pacote' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700')}>
                              {cliente.tipoAtendimento === 'pacote' ? 'Pacote' : 'Único'}
                            </span>
                          </td>
                          <td className="p-4">
                            {cliente.tipoAtendimento === 'pacote' ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  {cliente.sessoesPacote.length} Sessões
                                </span>
                                <button onClick={() => setClienteExpandidoSessoes(clienteExpandidoSessoes === cliente.id ? null : cliente.id)} className="text-xs text-purple-600 underline flex items-center gap-0.5 font-semibold">Ver Datas</button>
                                <button onClick={() => handleAdicionarSessaoAvulsa(cliente)} className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded-md hover:bg-purple-700">+ Add</button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 font-mono font-bold text-gray-600">{cliente.horario_atendimento || "00:00"}</td>
                          <td className="p-4">{cliente.ultimo_atendimento ? formatarDataAgendaExibicao(cliente.ultimo_atendimento) : '-'}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => iniciarEdicao(cliente)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><FiEdit2 size={16} /></button>
                              <button onClick={() => handleExcluirCliente(cliente.id, cliente.nome_completo)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><FiTrash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>

                        {cliente.tipoAtendimento === 'pacote' && clienteExpandidoSessoes === cliente.id && (
                          <tr className="bg-purple-50/30">
                            <td colSpan={7} className="p-4 pl-12">
                              <div className="border-l-2 border-purple-200 pl-4 space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700">Cronograma do Pacote (Aparece no Calendário):</h4>
                                {cliente.sessoesPacote.length === 0 ? (
                                  <p className="text-xs text-gray-500">Nenhuma sessão registrada.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-3">
                                    {cliente.sessoesPacote.map((sessao, idx) => (
                                      <div key={sessao.id} className="bg-white px-3 py-1.5 rounded-xl border border-purple-100 flex items-center gap-2 text-xs shadow-xs">
                                        <span className="font-bold text-purple-600">{idx + 1}ª Atendimento:</span>
                                        <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{formatarDataAgendaExibicao(sessao?.data)} às {sessao?.horario || "00:00"}</span>
                                        <button onClick={() => handleEditarSessaoEspecifica(cliente, sessao.id, sessao)} title="Editar data/hora da sessão" className="text-blue-500 hover:text-blue-700 ml-1 text-xs font-bold">📝</button>
                                        <button onClick={() => handleRemoverSessao(sessao.id)} title="Excluir sessão" className="text-red-400 hover:text-red-600 font-bold ml-0.5">×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {abaAtiva === 'financeiro' && (
          <div className="space-y-6">
            <header>
              <h2 className="font-serif text-3xl text-[#4A3E3D] font-bold">Fluxo de Caixa & Finanças</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">(+) Entradas Totais</span>
                <h4 className="text-2xl font-black text-emerald-600 mt-1">R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">(-) Saídas (Despesas)</span>
                <h4 className="text-2xl font-black text-red-600 mt-1">R$ {despesasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F5EBE6] bg-[#F5EBE6]/20">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">(=) Lucro Líquido Real</span>
                <h4 className={'text-2xl font-black mt-1 ' + (lucroLiquido >= 0 ? 'text-[#4A3E3D]' : 'text-red-700')}>R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#F5EBE6]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-lg font-bold text-[#4A3E3D]">Histórico de Saídas / Despesas</h3>
                <button onClick={() => setModalDespesaAberto(true)} className="text-xs bg-red-50 text-red-600 font-bold px-3 py-2 rounded-xl hover:bg-red-100 transition flex items-center gap-1"><FiPlus /> Adicionar Saída</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF7F9] text-[#4A3E3D] font-serif font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4 rounded-l-xl">Descrição da Despesa</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4 rounded-r-xl text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {despesas.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-400">Nenhuma despesa lançada.</td></tr>
                    ) : (
                      despesas.map((d) => (
                        <tr key={d.id} className="hover:bg-red-50/10 transition">
                          <td className="p-4 font-medium text-gray-700">{d.descricao}</td>
                          <td className="p-4 text-gray-400 text-xs">{formatarDataAgendaExibicao(d.data)}</td>
                          <td className="p-4 font-bold text-red-600">- R$ {d.valor.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => iniciarEdicaoDespesa(d)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><FiEdit2 size={16} /></button>
                              <button onClick={() => handleExcluirDespesa(d.id, d.descricao)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><FiTrash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'servicos' && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-[#F5EBE6]">
            <header className="mb-6 border-b border-gray-100 pb-4 flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl text-[#4A3E3D] font-bold">Catálogo de Serviços</h2>
              <button onClick={() => setModalServicoAberto(true)} className="bg-[#F3D1C9] hover:bg-[#E0B5AC] text-[#4A3E3D] font-semibold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"><FiPlus /> Novo Serviço</button>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF7F9] text-[#4A3E3D] font-serif font-bold text-xs uppercase">
                  <tr>
                    <th className="p-4 rounded-l-xl">Nome</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Tempo Médio</th>
                    <th className="p-4">Retorno Recomendado</th>
                    <th className="p-4 rounded-r-xl text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {servicos.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum serviço cadastrado.</td></tr>
                  ) : servicos.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-semibold text-[#4A3E3D]">{s.nome}</td>
                      <td className="p-4">R$ {Number(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4">{s.tempo_medio} min</td>
                      <td className="p-4">a cada {s.periodicidade_recomendada} dias</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleExcluirServico(s.id, s.nome)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><FiTrash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalClienteAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative my-8">
            <button onClick={() => setModalClienteAberto(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1 rounded-full"><FiX size={20} /></button>
            <h3 className="font-serif text-xl font-bold text-[#4A3E3D] mb-4">Agendar Novo Atendimento</h3>
            <form onSubmit={handleCadastrarCliente} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">TIPO DE ATENDIMENTO</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setTipoAtendimentoForm('unico')} className={'p-2.5 rounded-xl text-xs font-bold border transition ' + (tipoAtendimentoForm === 'unico' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500')}>Atendimento Único</button>
                  <button type="button" onClick={() => setTipoAtendimentoForm('pacote')} className={'p-2.5 rounded-xl text-xs font-bold border transition ' + (tipoAtendimentoForm === 'pacote' ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500')}>Pacote (3 Sessões)</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">TIPO DE SERVIÇO</label>
                <select required value={servicoIdForm} onChange={(e) => setServicoIdForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none text-[#4A3E3D] font-medium">
                  {servicos.length === 0 && <option value="">Nenhum serviço cadastrado</option>}
                  {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">NOME DA CLIENTE</label>
                <input type="text" required placeholder="Ex: Amanda Rodrigues" value={nomeForm} onChange={(e) => setNomeForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">WHATSAPP (COM DDD)</label>
                <input type="text" required placeholder="Ex: 11999999999" value={telForm} onChange={(e) => setTelForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">DATA DE NASCIMENTO</label>
                <input type="date" required value={dataNascimentoForm} onChange={(e) => setDataNascimentoForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">FORMA DE PAGAMENTO</label>
                <select required value={formaPagamentoForm} onChange={(e) => setFormaPagamentoForm(e.target.value as FormaPagamento)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none text-[#4A3E3D] font-medium">
                  {FORMAS_PAGAMENTO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              {tipoAtendimentoForm === 'unico' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DATA</label>
                    <input type="date" required value={dataForm} onChange={(e) => setDataForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HORÁRIO</label>
                    <input type="time" required value={horarioForm} onChange={(e) => setHorarioForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
                  </div>
                </div>
              )}

              {tipoAtendimentoForm === 'pacote' && (
                <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 space-y-3">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Agendamento das 3 Sessões do Pacote</span>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-600">1ª SESSÃO (DATA)</label>
                        <input type="date" required value={sessao1.data} onChange={(e) => setSessao1({ ...sessao1, data: e.target.value })} className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-600">HORA</label>
                        <input type="time" required value={sessao1.horario} onChange={(e) => setSessao1({ ...sessao1, horario: e.target.value })} className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-600">2ª SESSÃO (RETORNO)</label>
                        <input type="date" required value={sessao2.data} onChange={(e) => setSessao2({ ...sessao2, data: e.target.value })} className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-600">HORA</label>
                        <input type="time" required value={sessao2.horario} onChange={(e) => setSessao2({ ...sessao2, horario: e.target.value })} className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs focus:outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-purple-600">3ª SESSÃO (RETORNO)</label>
                        <input type="date" required value={sessao3.data} onChange={(e) => setSessao3({ ...sessao3, data: e.target.value })} className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-purple-600">HORA</label>
                        <input type="time" required value={sessao3.horario} onChange={(e) => setSessao3({ ...sessao3, horario: e.target.value })} className="w-full border border-gray-200 bg-white rounded-lg p-2 text-xs focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">VALOR TOTAL DO PROCEDIMENTO (R$)</label>
                <input type="number" required value={valorForm} onChange={(e) => setValorForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>

              <button type="submit" disabled={salvando} className="w-full bg-[#F3D1C9] disabled:opacity-50 text-[#4A3E3D] font-bold p-3 rounded-xl text-sm mt-2">{salvando ? 'Salvando...' : 'Confirmar Agendamento'}</button>
            </form>
          </div>
        </div>
      )}

      {modalEditarAberto && clienteSendoEditada && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
            <button onClick={() => { setModalEditarAberto(false); setClienteSendoEditada(null); }} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1 rounded-full"><FiX size={20} /></button>
            <h3 className="font-serif text-xl font-bold text-[#4A3E3D] mb-4">Editar Dados do Agendamento</h3>
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">NOME COMPLETO</label>
                <input type="text" required value={clienteSendoEditada.nome_completo || ''} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, nome_completo: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">TIPO DE SERVIÇO</label>
                <select value={clienteSendoEditada.servico_id} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, servico_id: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none text-[#4A3E3D] font-medium">
                  {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">WHATSAPP</label>
                <input type="text" required value={clienteSendoEditada.telefone || ''} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, telefone: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">DATA DE NASCIMENTO</label>
                <input type="date" required value={clienteSendoEditada.data_nascimento || ''} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, data_nascimento: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">FORMA DE PAGAMENTO</label>
                <select value={clienteSendoEditada.forma_pagamento} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, forma_pagamento: e.target.value as FormaPagamento })} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-white focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none text-[#4A3E3D] font-medium">
                  {FORMAS_PAGAMENTO.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              {clienteSendoEditada.tipoAtendimento === 'unico' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">DATA</label>
                    <input type="date" required value={clienteSendoEditada.data_atendimento || ''} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, data_atendimento: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">HORÁRIO</label>
                    <input type="time" required value={clienteSendoEditada.horario_atendimento || "00:00"} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, horario_atendimento: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">VALOR PAGO (R$)</label>
                <input type="number" required value={clienteSendoEditada.valor_pago || 0} onChange={(e) => setClienteSendoEditada({ ...clienteSendoEditada, valor_pago: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModalEditarAberto(false); setClienteSendoEditada(null); }} className="flex-1 bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 bg-[#F3D1C9] text-[#4A3E3D] font-bold p-3 rounded-xl text-sm">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDespesaAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative my-8">
            <button onClick={() => setModalDespesaAberto(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1 rounded-full"><FiX size={20} /></button>
            <h3 className="font-serif text-xl font-bold text-red-600 mb-4">Registrar Despesa</h3>
            <form onSubmit={handleCadastrarDespesa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">DESCRIÇÃO DA DESPESA</label>
                <input type="text" required placeholder="Ex: Aluguel da sala" value={descDespesaForm} onChange={(e) => setDescDespesaForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">VALOR (R$)</label>
                  <input type="number" step="0.01" required placeholder="0.00" value={valorDespesaForm} onChange={(e) => setValorDespesaForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">DATA</label>
                  <input type="date" required value={dataDespesaForm} onChange={(e) => setDataDespesaForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-200 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-red-500 text-white font-bold p-3 rounded-xl text-sm mt-2 hover:bg-red-600 transition">Salvar Saída</button>
            </form>
          </div>
        </div>
      )}

      {modalEditarDespesaAberto && despesaSendoEditada && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
            <button onClick={() => { setModalEditarDespesaAberto(false); setDespesaSendoEditada(null); }} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1 rounded-full"><FiX size={20} /></button>
            <h3 className="font-serif text-xl font-bold text-[#4A3E3D] mb-4">Editar Lançamento de Saída</h3>
            <form onSubmit={handleSalvarEdicaoDespesa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">DESCRIÇÃO DA DESPESA</label>
                <input type="text" required value={despesaSendoEditada.descricao || ''} onChange={(e) => setDespesaSendoEditada({ ...despesaSendoEditada, descricao: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">VALOR (R$)</label>
                  <input type="number" step="0.01" required value={despesaSendoEditada.valor || 0} onChange={(e) => setDespesaSendoEditada({ ...despesaSendoEditada, valor: Number(e.target.value) })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">DATA</label>
                  <input type="date" required value={despesaSendoEditada.data || ''} onChange={(e) => setDespesaSendoEditada({ ...despesaSendoEditada, data: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModalEditarDespesaAberto(false); setDespesaSendoEditada(null); }} className="flex-1 bg-gray-100 text-gray-600 font-bold p-3 rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 bg-red-500 text-white font-bold p-3 rounded-xl text-sm hover:bg-red-600 transition">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalServicoAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
            <button onClick={() => setModalServicoAberto(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-1 rounded-full"><FiX size={20} /></button>
            <h3 className="font-serif text-xl font-bold text-[#4A3E3D] mb-4">Novo Serviço</h3>
            <form onSubmit={handleCadastrarServico} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">NOME DO SERVIÇO</label>
                <input type="text" required placeholder="Ex: Design de Sobrancelhas" value={nomeServicoForm} onChange={(e) => setNomeServicoForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">VALOR PADRÃO (R$)</label>
                <input type="number" required value={valorServicoForm} onChange={(e) => setValorServicoForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">TEMPO MÉDIO (MIN)</label>
                  <input type="number" required value={tempoServicoForm} onChange={(e) => setTempoServicoForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">RETORNO (DIAS)</label>
                  <input type="number" required value={periodicidadeServicoForm} onChange={(e) => setPeriodicidadeServicoForm(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F3D1C9] focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#F3D1C9] text-[#4A3E3D] font-bold p-3 rounded-xl text-sm mt-2">Salvar Serviço</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
