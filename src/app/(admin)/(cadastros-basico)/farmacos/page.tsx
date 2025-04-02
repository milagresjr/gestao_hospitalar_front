import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import FarmacosTable from './FarmacoTable'

export const metadata = {
  title: 'SGH | Fármacos',
  description: 'Página de fármacos',
}

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Fármacos" />
      <FarmacosTable />
    </div>
  )
}
