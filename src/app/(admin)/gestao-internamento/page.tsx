import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { ContentInternamento } from './ContentInternamento'

export const metadata = {
  title: 'SGH | Internamento',
  description: 'Página de Internamento',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Gestão de Internamento" />
      <ContentInternamento />
    </div>
  )
}
