import React from "react";
import GuiaTable from "@/components/guias/GuiaTable";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function GuiasPage() {
  return (
    <div>
      <PageBreadCrumb pageTitle="Gestión de Guías" />
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="col-span-12">
          <GuiaTable />
        </div>
      </div>
    </div>
  );
}
