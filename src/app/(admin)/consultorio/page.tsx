import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { ContentConsultorio } from './ContentConsultorio'

export const metadata = {
  title: 'SGH | Consultório',
  description: 'Página de Consultório',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Consultório" />
      <ContentConsultorio />
    </div>
  )
}
