import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import FormNovaConsulta from './FormNovaConsulta'

export const metadata = {
  title: 'SGH | Nova Consulta',
  description: 'Página de nova consulta',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Nova Consulta" />
      <FormNovaConsulta />
    </div>
  )
}
