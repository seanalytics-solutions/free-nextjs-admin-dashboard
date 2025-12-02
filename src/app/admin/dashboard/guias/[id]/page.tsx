import { getGuiaById } from "@/actions/guias";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { notFound } from "next/navigation";

export default async function GuiaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guia = await getGuiaById(id);

  if (!guia) {
    notFound();
  }

  return (
    <div>
      <PageBreadCrumb pageTitle={`Detalles de Guía: ${guia.numero_de_rastreo}`} />
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* General Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Información General
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Rastreo:</span>
              <span className="font-medium text-gray-800 dark:text-white/90">{guia.numero_de_rastreo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Estado:</span>
              <Badge color={guia.situacion_actual === "entregado" ? "success" : "warning"}>
                {guia.situacion_actual}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Fecha Creación:</span>
              <span className="font-medium text-gray-800 dark:text-white/90">{new Date(guia.fecha_creacion).toLocaleString()}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Entrega Estimada:</span>
              <span className="font-medium text-gray-800 dark:text-white/90">
                {guia.fecha_entrega_estimada ? new Date(guia.fecha_entrega_estimada).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Detalles del Paquete
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Dimensiones (cm):</span>
              <span className="font-medium text-gray-800 dark:text-white/90">
                {guia.largo_cm} x {guia.ancho_cm} x {guia.alto_cm}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Peso:</span>
              <span className="font-medium text-gray-800 dark:text-white/90">{guia.peso_kg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Valor Declarado:</span>
              <span className="font-medium text-gray-800 dark:text-white/90">${guia.valor_declarado}</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        {guia.profile && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Usuario
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                    {guia.profile.nombre} {guia.profile.apellido}
                </span>
                </div>
                {guia.profile.usuario && (
                    <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Correo:</span>
                    <span className="font-medium text-gray-800 dark:text-white/90">
                        {guia.profile.usuario.correo}
                    </span>
                    </div>
                )}
            </div>
            </div>
        )}

        {/* Remitente Info */}
        {guia.remitente && (
             <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
             <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                 Remitente
             </h3>
             <div className="space-y-3">
                 <div className="flex justify-between">
                 <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                 <span className="font-medium text-gray-800 dark:text-white/90">
                     {guia.remitente.nombres} {guia.remitente.apellidos}
                 </span>
                 </div>
                 <div className="flex justify-between">
                 <span className="text-gray-500 dark:text-gray-400">Teléfono:</span>
                 <span className="font-medium text-gray-800 dark:text-white/90">
                     {guia.remitente.telefono}
                 </span>
                 </div>
                  <div className="flex flex-col gap-1">
                 <span className="text-gray-500 dark:text-gray-400">Dirección:</span>
                 <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                     {guia.remitente.calle} {guia.remitente.numero}, {guia.remitente.asentamiento}, {guia.remitente.localidad}, {guia.remitente.estado}, {guia.remitente.codigo_postal}
                 </span>
                 </div>
             </div>
             </div>
        )}

         {/* Destinatario Info */}
         {guia.destinatario && (
             <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
             <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                 Destinatario
             </h3>
             <div className="space-y-3">
                 <div className="flex justify-between">
                 <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
                 <span className="font-medium text-gray-800 dark:text-white/90">
                     {guia.destinatario.nombres} {guia.destinatario.apellidos}
                 </span>
                 </div>
                 <div className="flex justify-between">
                 <span className="text-gray-500 dark:text-gray-400">Teléfono:</span>
                 <span className="font-medium text-gray-800 dark:text-white/90">
                     {guia.destinatario.telefono}
                 </span>
                 </div>
                  <div className="flex flex-col gap-1">
                 <span className="text-gray-500 dark:text-gray-400">Dirección:</span>
                 <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                     {guia.destinatario.calle} {guia.destinatario.numero}, {guia.destinatario.asentamiento}, {guia.destinatario.localidad}, {guia.destinatario.estado}, {guia.destinatario.codigo_postal}
                 </span>
                 </div>
             </div>
             </div>
        )}

      </div>
    </div>
  );
}
