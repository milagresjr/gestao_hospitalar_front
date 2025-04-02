export type CamaType = {
  cama_id?: string | number | undefined
  descricao: string
  sala_id?: string | number | undefined
  estado?: boolean | string | number
  sala?: SalaType
}

export type SalaType = {
  sala_id?: string | number | undefined
  descricao: string
  estado?: boolean | string | number
}

export type AreaHospitalType = {
  area_hospital_id?: string | number | undefined
  descricao: string
  estado?: boolean | string | number
}

export type FarmacoType = {
  farmaco_id?: string | number | undefined
  nome: string
  dosagem: string
  forma_farmaceutica: string
  validade: string
  estoque: number | string
  descricao: string
}

export type EspecialidadeType = {
  especialidade_id?: string | number | undefined
  nome: string
  descricao: string
  ativo: boolean
}

export type TipoConsultaType = {
  tipo_consulta_id?: string | number | undefined
  nome: string
  descricao: string
  duracao: number
  especialidade_id: string | number
  ativo: boolean
}

export type TipoServicoType = {
  tipo_servico_id?: string | number | undefined
  nome: string
  descricao: string
  duracao: number
  ativo: boolean
}

export type PacienteType = {
  paciente_id?: string | number | undefined
  nome: string
  data_nascimento: string
  sexo: string
  endereco: string
  telefone: string | number
  email: string
  grupo_sanguineo: string
  status: string
}

export type ProfissionalSaudeType = {
  profissional_saude_id: number | string | undefined
  nome: string
  tipo_profissional: string
  telefone: string | number
  email: string
  data_nascimento: string
  sexo: string
  endereco: string
}

export type ConsultaType = {
  consulta_id?: string | number | undefined
  medico_id: string | number
  paciente_id: string | number
  tipo_consulta_id: string | number
  tipo_servico_id: string | number
  profissional_saude_id: string | number
  prioridade: string
  data_consulta: string
  status: string
  observacoes?: string
  triagem_id?: string | number
  paciente: PacienteType
  tipo_consulta: TipoConsultaType
  tipo_servico?: TipoServicoType
  profissional_saude?: ProfissionalSaudeType
  triagem?: TriagemType
}

export type TriagemType = {
  triagem_id?: string | number | undefined
  paciente_id: string | number
  temperatura: string | number
  tensao_arterial: string | number
  peso: string | number
  frequencia_respiratoria: string | number
  frequencia_cardiaca: string | number
  status_triagem: string | number
}

export type UserType = {
  usuario_id?: string | number
  nome: string
  email: string
  login: string
  tipo: string
  telefone: string | number
}

export type SolicitacaoExameType = {
  solicitacao_exame_id?: string | number | undefined
  tipo_exame: string
  data_solicitacao: string
  data_realizacao?: string
  status?: string
  paciente_id: string | number
  profissional_saude_solicitante_id: string | number
  profissional_saude_responsavel_id?: string | number
  indicacao_clinica?: string
  resultado?: string
  laudo_medico?: string
  urgencia: string
  usuario_id: string | number
}

export type ResultadoExameType = {
  resultado_exame_id?: string | number | undefined
  exame_id: string | number
  data_lancamento?: string
  resultado: string
  observacao?: string
  responsavel_lancamento_id: string | number
}

export type ReceitaType = {
  receita_id: string | number
  consulta_id: string | number
  profissional_saude_id: string | number
  farmaco_id: string | number
  vezes_por_dia: number
  qtd_por_dia: number
  descricao: string
  data_emissao: string
  farmaco: FarmacoType
}

export type InternamentoType = {
  internamento_id?: string | number | undefined
  cama_id: string | number
  paciente_id: string | number
  profissional_saude_id: string | number
  data_entrada: string
  data_prevista_alta?: string
  data_alta?: string
  motivo_internamento: string
  diagnostico: string
  observacoes?: string
  estado: string | number | boolean
}