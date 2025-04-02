import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SalasTable from "./SalasTable";

export const metadata = {
  title: "SGH | Salas",
  description: "Página de salas",
};

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Salas" />
      <SalasTable />
    </div>
  );
}
