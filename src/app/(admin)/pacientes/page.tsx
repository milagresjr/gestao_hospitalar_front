import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import PacientesTable from './PacienteTable'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'SGH | Pacientes',
  description: 'Página de pacientes',
}

export default async function Page() {

  return (
    <div>
      <PageBreadcrumb pageTitle="Pacientes" />
      <PacientesTable />
    </div>
  )
}
