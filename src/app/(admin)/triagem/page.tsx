import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import TriagemTable from './TriagemTable'

export const metadata = {
  title: 'SGH | Triagem',
  description: 'Página de triagem',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Triagem" />
      <TriagemTable />
    </div>
  )
}
