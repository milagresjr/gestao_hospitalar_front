import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import TipoServicosTable from './TipoServicoTable'

export const metadata = {
  title: 'SGH | Tipo de Serviço',
  description: 'Página de tipo de serviço',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tipo de Serviço" />
      <TipoServicosTable />
    </div>
  )
}
