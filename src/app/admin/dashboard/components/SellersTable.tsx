"use client";

import { Eye, Trash2, Check, X, Search, Users, UserPlus } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { useState } from "react";

interface Vendedor {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rfc: string;
  imagen: string;
  rol: "Vendedor" | "Usuario";
  estado: "activo" | "pendiente";
}

const vendedoresData: Vendedor[] = [
  {
    id: 1,
    nombre: "Carlos",
    apellido: "Rodríguez",
    correo: "carlos.rodriguez@empresa.com",
    rfc: "RODC850315HDF",
    imagen: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    rol: "Vendedor",
    estado: "activo",
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    correo: "maria.gonzalez@empresa.com",
    rfc: "GOMA901020MDF",
    imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    rol: "Vendedor",
    estado: "activo",
  },
  {
    id: 3,
    nombre: "José",
    apellido: "Martínez",
    correo: "jose.martinez@empresa.com",
    rfc: "MAJE920815HDF",
    imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    rol: "Vendedor",
    estado: "activo",
  },
  {
    id: 4,
    nombre: "Ana",
    apellido: "López",
    correo: "ana.lopez@empresa.com",
    rfc: "LOPA880625MDF",
    imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    rol: "Usuario",
    estado: "pendiente",
  },
  {
    id: 5,
    nombre: "Luis",
    apellido: "Hernández",
    correo: "luis.hernandez@empresa.com",
    rfc: "HERL950410HDF",
    imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rol: "Usuario",
    estado: "pendiente",
  },
  {
    id: 6,
    nombre: "Patricia",
    apellido: "Sánchez",
    correo: "patricia.sanchez@empresa.com",
    rfc: "SAMP870920MDF",
    imagen: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
    rol: "Usuario",
    estado: "pendiente",
  },
];

export function SellersTable() {
  const [vendedores, setVendedores] = useState<Vendedor[]>(vendedoresData);
  const [tabActiva, setTabActiva] = useState<"activos" | "solicitudes">("activos");
  const [busqueda, setBusqueda] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id?: number }>({
    open: false,
  });

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

  // === ACCIONES ===
  const handleEliminarConfirmado = () => {
    if (!deleteModal.id) return;
    setVendedores((prev) => prev.filter((v) => v.id !== deleteModal.id));
    setDeleteModal({ open: false });
  };

  const handleAceptarSolicitud = (id: number) => {
    setVendedores((prev) =>
      prev.map((v) => (v.id === id ? { ...v, estado: "activo", rol: "Vendedor" } : v))
    );
  };

  const handleRechazarSolicitud = (id: number) => {
    setVendedores((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVerVendedor = (v: Vendedor) => {
    alert(`Detalles de ${v.nombre}`);
  };

  return (
    <div   className="
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
                  key={v.id}
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
                      <button
                        onClick={() => handleVerVendedor(v)}
                        className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>

                      {/* ELIMINAR */}
                      <button
                        onClick={() => setDeleteModal({ open: true, id: v.id })}
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
                  key={v.id}
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
                        onClick={() => handleAceptarSolicitud(v.id)}
                        className="px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Aceptar
                      </button>

                      {/* RECHAZAR */}
                      <button
                        onClick={() => handleRechazarSolicitud(v.id)}
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
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-200 dark:border-neutral-700 animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Confirmar eliminación
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              ¿Seguro que deseas eliminar este vendedor? Esta acción no se puede
              deshacer.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModal({ open: false })}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition"
              >
                Cancelar
              </button>

              <button
                onClick={handleEliminarConfirmado}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
