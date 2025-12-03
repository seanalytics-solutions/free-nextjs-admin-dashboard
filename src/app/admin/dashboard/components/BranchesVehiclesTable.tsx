"use client";

import { Search, Car, Filter, Truck, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Pagination from "@/components/tables/Pagination";
import {
  getVehiculosConConductores,
  getSucursales,
  getTiposVehiculos,
  VehiculoConConductor,
} from "@/actions/vehicles";

interface Sucursal {
  claveCuo: string;
  nombreCuo: string;
  nombreEntidad: string;
}

interface TipoVehiculo {
  id: number;
  tipoVehiculo: string;
  capacidadKg: number;
}

export function BranchesVehiclesTable() {
  const [vehiculos, setVehiculos] = useState<VehiculoConConductor[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [tiposVehiculos, setTiposVehiculos] = useState<TipoVehiculo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sucursalFiltro, setSucursalFiltro] = useState<string>("Todas");
  const [tipoVehiculoFiltro, setTipoVehiculoFiltro] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      const [vehiculosData, sucursalesData, tiposData] = await Promise.all([
        getVehiculosConConductores(),
        getSucursales(),
        getTiposVehiculos(),
      ]);
      setVehiculos(vehiculosData);
      setSucursales(sucursalesData);
      setTiposVehiculos(tiposData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    setPage(1);
  }, [busqueda, sucursalFiltro, tipoVehiculoFiltro]);

  // Filtrar vehículos
  const vehiculosFiltrados = vehiculos.filter((v) => {
    // Filtro de búsqueda por texto
    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      !busqueda.trim() ||
      v.placas.toLowerCase().includes(busquedaLower) ||
      v.tipoVehiculo.toLowerCase().includes(busquedaLower) ||
      v.sucursal.nombreCuo.toLowerCase().includes(busquedaLower) ||
      v.sucursal.nombreEntidad.toLowerCase().includes(busquedaLower) ||
      (v.conductor?.nombreCompleto.toLowerCase().includes(busquedaLower) ?? false) ||
      (v.conductor?.curp.toLowerCase().includes(busquedaLower) ?? false);

    // Filtro de sucursal
    const coincideSucursal =
      sucursalFiltro === "Todas" || v.sucursal.claveCuo === sucursalFiltro;

    // Filtro de tipo de vehículo
    const coincideTipoVehiculo =
      tipoVehiculoFiltro === "Todos" || v.tipoVehiculo === tipoVehiculoFiltro;

    return coincideBusqueda && coincideSucursal && coincideTipoVehiculo;
  });

  const limpiarFiltros = () => {
    setSucursalFiltro("Todas");
    setTipoVehiculoFiltro("Todos");
    setBusqueda("");
  };

  const filtrosActivos =
    sucursalFiltro !== "Todas" ||
    tipoVehiculoFiltro !== "Todos" ||
    busqueda.trim() !== "";

  const totalPages = Math.ceil(vehiculosFiltrados.length / itemsPerPage);
  const paginatedVehicles = vehiculosFiltrados.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "disponible":
        return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
      case "en_ruta":
      case "en ruta":
        return "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400";
      case "mantenimiento":
        return "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getTipoVehiculoColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("camioneta")) return "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400";
    if (tipoLower.includes("sedán") || tipoLower.includes("sedan"))
      return "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    if (tipoLower.includes("camión") || tipoLower.includes("camion"))
      return "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400";
    if (tipoLower.includes("van")) return "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400";
    if (tipoLower.includes("moto")) return "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400";
    return "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400";
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Header con título y botón de refrescar */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Conductores por Sucursal
          </h2>
          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
            {vehiculos.length} total
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all disabled:opacity-50"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="p-6 pt-4 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[250px] w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por conductor, placas, sucursal..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          {/* Filtros dropdown */}
          <div className="flex flex-col w-full  md:flex-row gap-3">
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

            <div className="relative flex-1 w-full md:max-w-md">
              <select
                value={tipoVehiculoFiltro}
                onChange={(e) => setTipoVehiculoFiltro(e.target.value)}
                className="appearance-none w-full px-4 py-2.5 md:pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-all"
              >
                <option value="Todos">Todos los vehículos</option>
                {tiposVehiculos.map((tipo) => (
                  <option key={tipo.id} value={tipo.tipoVehiculo}>
                    {tipo.tipoVehiculo}
                  </option>
                ))}
              </select>
              <Car className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
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
                Placas
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Conductor
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                CURP
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Sucursal
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Tipo de Vehículo
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedVehicles.map((vehiculo) => (
              <tr
                key={vehiculo.id}
                className=" border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-gray-800 dark:text-white/90 font-medium">
                    {vehiculo.placas}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {vehiculo.conductor ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {vehiculo.conductor.nombreCompleto
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-gray-800 line-clamp-1 break-keep whitespace-nowrap dark:text-white/90">
                          {vehiculo.conductor.nombreCompleto}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {vehiculo.conductor.telefono}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Sin asignar</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-sm">
                  {vehiculo.conductor?.curp || "-"}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="inline-flex line-clamp-1 break-keep whitespace-nowrap items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      {vehiculo.sucursal.nombreCuo}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {vehiculo.sucursal.nombreMunicipio},{" "}
                      {vehiculo.sucursal.nombreEntidad}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex line-clamp-1 break-keep whitespace-nowrap items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getTipoVehiculoColor(
                      vehiculo.tipoVehiculo
                    )}`}
                  >
                    {/* <Car className="w-3.5 h-3.5" /> */}
                    {vehiculo.tipoVehiculo}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm capitalize ${getEstadoColor(
                      vehiculo.estado
                    )}`}
                  >
                    {vehiculo.estado.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vehiculosFiltrados.length === 0 && (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            {filtrosActivos
              ? "No se encontraron vehículos con los filtros aplicados"
              : "No hay vehículos registrados"}
          </div>
        )}
      </div>

      {/* Footer con contador */}
      {vehiculosFiltrados.length > 0 && (
        <div className="px-6 py-4 border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4">
         
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
