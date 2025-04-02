import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import TipoConsultasTable from './TipoConsultaTable'

export const metadata = {
  title: 'SGH | Tipo de Consultas',
  description: 'Página de tipo de consulta',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tipo de Consultas" />
      <TipoConsultasTable />
    </div>
  )
}
