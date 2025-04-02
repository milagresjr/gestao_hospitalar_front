import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ProfissionalSaudeTable from './ProfissionalSaudeTable'

export const metadata = {
  title: 'SGH | Profissional de Saúde',
  description: 'Página de profissional de saúde',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Profissional de Saúde" />
      <ProfissionalSaudeTable />
    </div>
  )
}
