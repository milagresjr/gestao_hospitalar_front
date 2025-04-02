import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import EspecialidadesTable from './EspecialidadeTable'

export const metadata = {
  title: 'SGH | Especialidades',
  description: 'Página de especialidades',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Especialidades" />
      <EspecialidadesTable />
    </div>
  )
}
