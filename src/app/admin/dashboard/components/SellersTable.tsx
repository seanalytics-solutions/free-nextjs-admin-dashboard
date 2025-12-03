"use client";

import { Eye, Trash2, Check, X, Search, Users, UserPlus } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { useState } from "react";
import {
  acceptSellerRequest,
  rejectSellerRequest,
  deleteSeller,
  getSellers,
  getSellerRequests,
} from "@/actions/sellers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";

interface Vendedor {
  uniqueId: string;
  originalId: number;
  source: "user" | "request";
  nombre: string;
  apellido: string;
  correo: string;
  rfc: string;
  imagen: string;
  rol: "Vendedor" | "Usuario";
  estado: "activo" | "pendiente";
}

export function SellersTable() {
  const queryClient = useQueryClient();
  const [tabActiva, setTabActiva] = useState<"activos" | "solicitudes">("activos");
  const [busqueda, setBusqueda] = useState("");
  
  // Modal state handling both delete and reject actions
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    id: string | null;
    action: "delete" | "reject" | null;
  }>({
    open: false,
    id: null,
    action: null,
  });

  // === DATA FETCHING ===
  const { data: vendedores = [], isLoading } = useQuery({
    queryKey: ["sellers-data"],
    queryFn: async () => {
      const [sellers, requests] = await Promise.all([
        getSellers(),
        getSellerRequests(),
      ]);

      const mappedSellers: Vendedor[] = sellers.map((s) => ({
        uniqueId: `user-${s.id}`,
        originalId: s.id,
        source: "user",
        nombre: s.nombre || "",
        apellido: s.apellido || "",
        correo: s.correo,
        rfc: s.profile?.RFC || "N/A",
        imagen:
          s.profile?.imagen ||
          "https://res.cloudinary.com/dgpd2ljyh/image/upload/v1748920792/default_nlbjlp.jpg",
        rol: "Vendedor",
        estado: "activo",
      }));

      const mappedRequests: Vendedor[] = requests.map((r) => ({
        uniqueId: `req-${r.id}`,
        originalId: r.id,
        source: "request",
        nombre: r.usuario?.nombre || r.nombre_tienda || "Desconocido",
        apellido: r.usuario?.apellido || "",
        correo: r.email || r.usuario?.correo || "",
        rfc: r.rfc || "N/A",
        imagen:
          r.usuario?.profile?.imagen ||
          r.img_uri ||
          "https://res.cloudinary.com/dgpd2ljyh/image/upload/v1748920792/default_nlbjlp.jpg",
        rol: "Usuario",
        estado: "pendiente",
      }));

      return [...mappedSellers, ...mappedRequests];
    },
  });

  // === MUTATIONS ===
  const acceptMutation = useMutation({
    mutationFn: async (originalId: number) => {
      const res = await acceptSellerRequest(originalId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Solicitud aceptada correctamente");
      queryClient.invalidateQueries({ queryKey: ["sellers-data"] });
    },
    onError: () => {
      toast.error("Error al aceptar la solicitud");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (originalId: number) => {
      const res = await rejectSellerRequest(originalId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Solicitud rechazada correctamente");
      queryClient.invalidateQueries({ queryKey: ["sellers-data"] });
      setConfirmModal({ open: false, id: null, action: null });
    },
    onError: () => {
      toast.error("Error al rechazar la solicitud");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (originalId: number) => {
      const res = await deleteSeller(originalId);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      toast.success("Vendedor eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["sellers-data"] });
      setConfirmModal({ open: false, id: null, action: null });
    },
    onError: () => {
      toast.error("Error al eliminar el vendedor");
    },
  });

  // === HANDLERS ===
  const handleConfirmAction = () => {
    if (!confirmModal.id || !confirmModal.action) return;

    const item = vendedores.find((v) => v.uniqueId === confirmModal.id);
    if (!item) return;

    if (confirmModal.action === "delete") {
      deleteMutation.mutate(item.originalId);
    } else if (confirmModal.action === "reject") {
      rejectMutation.mutate(item.originalId);
    }
  };

  const handleAceptarSolicitud = (uniqueId: string) => {
    const item = vendedores.find((v) => v.uniqueId === uniqueId);
    if (item) acceptMutation.mutate(item.originalId);
  };

  const handleVerVendedor = (v: Vendedor) => {
    alert(`Detalles de ${v.nombre}`);
  };

  // === FILTRO ===
  const filtrarVendedores = (lista: Vendedor[]) => {
    if (!busqueda.trim()) return lista;
    const b = busqueda.toLowerCase();

    return lista.filter(
      (v) =>
        v.nombre.toLowerCase().includes(b) ||
        v.apellido.toLowerCase().includes(b) ||
        v.correo.toLowerCase().includes(b) ||
        v.rfc.toLowerCase().includes(b)
    );
  };

  const activos = filtrarVendedores(
    vendedores.filter((v) => v.estado === "activo" && v.rol === "Vendedor")
  );

  const pendientes = filtrarVendedores(
    vendedores.filter((v) => v.estado === "pendiente")
  );

  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Cargando datos...</div>;
  }

  return (
    <div className="
              relative rounded-2xl p-6 shadow-lg hover:shadow-xl
              transition-all duration-300 overflow-hidden border 
              bg-white border-slate-200
              dark:bg-white/3 dark:border-gray-800
            ">
      {/* ======== HEADER ======== */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between gap-6 mb-4">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o RFC..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="
      w-full pl-12 pr-4 py-3
      rounded-2xl border bg-white border-slate-200
      shadow-lg hover:shadow-xl transition-all duration-300
      text-gray-900 placeholder-gray-400
      focus:ring-2 focus:ring-blue-500 focus:border-transparent

      dark:bg-white/3 dark:border-gray-800 
      dark:text-gray-100 dark:placeholder-gray-500
    "
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-neutral-700">
            {/* Activos */}
            <button
              onClick={() => setTabActiva("activos")}
              className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 ${
                tabActiva === "activos"
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Users className="w-5 h-5" />
              Vendedores
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  tabActiva === "activos"
                    ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200"
                    : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300"
                }`}
              >
                {vendedores.filter((v) => v.estado === "activo" && v.rol === "Vendedor").length}
              </span>
            </button>

            {/* Solicitudes */}
            <button
              onClick={() => setTabActiva("solicitudes")}
              className={`px-6 py-3 border-b-2 transition-all flex items-center gap-2 ${
                tabActiva === "solicitudes"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Solicitudes
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  tabActiva === "solicitudes"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                    : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-300"
                }`}
              >
                {vendedores.filter((v) => v.estado === "pendiente").length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ======== TABLA ACTIVOS ======== */}
      {tabActiva === "activos" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-700">
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  Nombre del vendedor
                </th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  RFC
                </th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  Rol
                </th>
                <th className="px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {activos.map((v) => (
                <tr
                  key={v.uniqueId}
                  className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={v.imagen}
                        alt={`${v.nombre} ${v.apellido}`}
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div className="text-gray-900 dark:text-gray-100">
                        {v.nombre} {v.apellido}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {v.correo}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {v.rfc}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200">
                      {v.rol}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">

                      {/* VER */}
                      <Link
                        href={`/admin/dashboard/vendedor/${v.originalId}`}
                        className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Link>

                      {/* ELIMINAR */}
                      <button
                        onClick={() => setConfirmModal({ open: true, id: v.uniqueId, action: "delete" })}
                        className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activos.length === 0 && (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              {busqueda
                ? "No se encontraron vendedores con esa búsqueda"
                : "No hay vendedores activos"}
            </div>
          )}
        </div>
      )}

      {/* ======== TABLA SOLICITUDES ======== */}
      {tabActiva === "solicitudes" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-neutral-700">
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  Nombre del solicitante
                </th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  Correo
                </th>
                <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  RFC
                </th>
                <th className="px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {pendientes.map((v) => (
                <tr
                  key={v.uniqueId}
                  className="border-b border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={v.imagen}
                        alt={`${v.nombre} ${v.apellido}`}
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-gray-900 dark:text-gray-100">
                          {v.nombre} {v.apellido}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Se convertirá en Vendedor
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {v.correo}
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {v.rfc}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* ACEPTAR */}
                      <button
                        onClick={() => handleAceptarSolicitud(v.uniqueId)}
                        className="px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Aceptar
                      </button>

                      {/* RECHAZAR */}
                      <button
                        onClick={() => setConfirmModal({ open: true, id: v.uniqueId, action: "reject" })}
                        className="px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pendientes.length === 0 && (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
              {busqueda
                ? "No se encontraron solicitudes con esa búsqueda"
                : "No hay solicitudes pendientes"}
            </div>
          )}
        </div>
      )}

      {/* ============ MODAL DE CONFIRMACIÓN ============ */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-200 dark:border-neutral-700 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {confirmModal.action === "delete" ? "Confirmar eliminación" : "Confirmar rechazo"}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {confirmModal.action === "delete"
                ? "¿Seguro que deseas eliminar este vendedor? Esta acción no se puede deshacer."
                : "¿Seguro que deseas rechazar esta solicitud? Esta acción no se puede deshacer."}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModal({ open: false, id: null, action: null })}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmAction}
                disabled={deleteMutation.isPending || rejectMutation.isPending}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition flex items-center gap-2"
              >
                {(deleteMutation.isPending || rejectMutation.isPending) ? (
                  <span className="animate-spin">...</span>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {confirmModal.action === "delete" ? "Eliminar" : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
