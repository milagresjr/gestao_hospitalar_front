import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AreasHospitalTable from "./AreasHospitalTable"; // Importa o Client Component

export const metadata = {
  title: "SGH | Áreas Hospital",
  description: "Página de Áreas Hospital",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Áreas Hospital" />
      <AreasHospitalTable />
    </div>
  );
}
