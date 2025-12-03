import GuiaTable from "@/components/guias/GuiaTable";

export default function GuiasPage() {
  return (
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="col-span-12">
          <GuiaTable />
        </div>
      </div>
  );
}
