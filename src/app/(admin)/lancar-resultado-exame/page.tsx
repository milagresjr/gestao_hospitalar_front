import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import TableExamesSolicitado from './TableExamesSolicitado'

export const metadata = {
  title: 'SGH | Lançar Resultado de Exame',
  description: 'Página de resultado de exame',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Exames" />
      <TableExamesSolicitado />
    </div>
  )
}
