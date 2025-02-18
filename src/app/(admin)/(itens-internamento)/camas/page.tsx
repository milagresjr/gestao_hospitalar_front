import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CamasTable from "./CamasTable"; // Importa o Client Component

export const metadata = {
  title: "SGH | Camas",
  description: "Página de camas",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Camas" />
      <CamasTable />
    </div>
  );
}
