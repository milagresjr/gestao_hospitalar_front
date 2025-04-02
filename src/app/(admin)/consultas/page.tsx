import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ConsultasTable from './ConsultaTable'
import PacienteSelect from './PacienteSelect'

export const metadata = {
  title: 'SGH | Consultas',
  description: 'Página de consultas',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Consultas" />
      <ConsultasTable />
    </div>
  )
}
