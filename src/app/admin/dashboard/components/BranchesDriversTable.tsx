"use client";

import { Search, Filter, User, RefreshCw, Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import Pagination from "@/components/tables/Pagination";
import {
  getConductoresPaginated,
} from "@/actions/drivers";
import { getSucursales } from "@/actions/vehicles";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EditDriverDialog from "./EditDriverDialog";
import AddDriverDialog from "./AddDriverDialog";

interface Sucursal {
  claveCuo: string;
  nombreCuo: string;
  nombreEntidad: string;
}

export function BranchesDriversTable() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [sucursalFiltro, setSucursalFiltro] = useState<string>("Todas");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(busqueda);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(busqueda), 500);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const {
    data: driversData,
    isLoading: isLoadingDrivers,
    isRefetching,
  } = useQuery({
    queryKey: ["drivers", page, debouncedSearch, sucursalFiltro],
    queryFn: () =>
      getConductoresPaginated(page, itemsPerPage, debouncedSearch, sucursalFiltro),
  });

  const { data: sucursales = [] } = useQuery({
    queryKey: ["sucursales"],
    queryFn: getSucursales,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["drivers"] });
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sucursalFiltro]);

  const drivers = driversData?.data || [];
  const pagination = driversData?.pagination || {
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: itemsPerPage,
  };

  const limpiarFiltros = () => {
    setSucursalFiltro("Todas");
    setBusqueda("");
  };

  const filtrosActivos =
    sucursalFiltro !== "Todas" || busqueda.trim() !== "";

  if (isLoadingDrivers) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Cargando conductores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Header con título y botón de refrescar */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6  sm:block hidden  text-blue-600 dark:text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Conductores por Sucursal
          </h2>
          <span className="px-2 py-1 sm:block hidden text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
            {pagination.total} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AddDriverDialog sucursales={sucursales} />
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="p-6 pt-4 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[250px] w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, CURP, RFC..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          {/* Filtros dropdown */}
          <div className="flex flex-col w-full md:flex-row gap-3">
            <div className="relative flex-1 md:flex-none md:max-w-md">
              <select
                value={sucursalFiltro}
                onChange={(e) => setSucursalFiltro(e.target.value)}
                className="appearance-none px-4 w-full py-2.5 md:pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-all"
              >
                <option value="Todas">Todas las sucursales</option>
                {sucursales.map((sucursal) => (
                  <option key={sucursal.claveCuo} value={sucursal.claveCuo}>
                    {sucursal.nombreCuo}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>

            {filtrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Conductor
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Documentos
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Sucursal
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Vehículo
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr
                key={driver.id}
                className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {driver.nombreCompleto
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium line-clamp-1 break-keep whitespace-nowrap dark:text-white/90">
                        {driver.nombreCompleto}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Alta: {new Date(driver.fechaAlta).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold w-10">CURP:</span>
                      <span className="font-mono">{driver.curp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold w-10">RFC:</span>
                      <span className="font-mono">{driver.rfc}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold w-10">Lic:</span>
                      <span className="font-mono">{driver.licencia}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          driver.licenciaVigente
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        {driver.licenciaVigente ? "Vigente" : "Vencida"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-3 h-3" />
                      <span>{driver.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span>{driver.correo}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="inline-flex line-clamp-1 break-keep whitespace-nowrap items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      {driver.sucursal.nombreCuo}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {driver.sucursal.nombreEntidad}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {driver.unidades.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {driver.unidades[0].placas}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {driver.unidades[0].tipoVehiculo}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Sin vehículo</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm capitalize ${
                      driver.disponibilidad
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {driver.disponibilidad ? "Disponible" : "No Disponible"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <EditDriverDialog
                    driver={driver}
                    sucursales={sucursales}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {drivers.length === 0 && (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            {filtrosActivos
              ? "No se encontraron conductores con los filtros aplicados"
              : "No hay conductores registrados"}
          </div>
        )}
      </div>

      {/* Footer con contador */}
      {drivers.length > 0 && (
        <div className="px-6 py-4 border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4">
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

