"use client";

import { Search, Car, Filter, Truck, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Pagination from "@/components/tables/Pagination";
import {
  getVehiclesPaginated,
  getSucursales,
  getTiposVehiculos,
  getConductores,
} from "@/actions/vehicles";
import AddVehicleDialog from "./AddVehicleDialog";
import EditVehicleDialog from "./EditVehicleDialog";
import { useQuery } from "@tanstack/react-query";

interface VehicleData {
  id: number;
  placas: string;
  tipoVehiculo: string;
  capacidadKg: number;
  volumenCarga: number;
  numEjes: number;
  numLlantas: number;
  tarjetaCirculacion: string;
  estado: string;
  conductor: {
    nombreCompleto: string;
    curp?: string;
  } | null;
  sucursal: {
    claveCuo: string;
    nombreCuo: string;
    nombreEntidad: string;
  };
}

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

interface Conductor {
  id: number;
  nombreCompleto: string;
  curp: string;
  claveOficina: string;
  disponibilidad: boolean;
  isAssigned: boolean;
}

export function VehiclesTable() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [tiposVehiculos, setTiposVehiculos] = useState<TipoVehiculo[]>([]);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [sucursalFiltro, setSucursalFiltro] = useState<string>("Todas");
  const [tipoVehiculoFiltro, setTipoVehiculoFiltro] = useState<string>("Todos");
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["vehicles", page, limit, search, sucursalFiltro, tipoVehiculoFiltro],
    queryFn: () => getVehiclesPaginated(page, limit, search, sucursalFiltro, tipoVehiculoFiltro),
  });

  const vehicles = data?.data || [];
  const totalPages = data?.pagination.totalPages || 1;
  const totalItems = data?.pagination.total || 0;

  const fetchFilters = useCallback(async () => {
    try {
      const [sucursalesData, tiposData, conductoresData] = await Promise.all([
        getSucursales(),
        getTiposVehiculos(),
        getConductores(),
      ]);
      setSucursales(sucursalesData);
      setTiposVehiculos(tiposData);
      setConductores(conductoresData);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const limpiarFiltros = () => {
    setSucursalFiltro("Todas");
    setTipoVehiculoFiltro("Todos");
    setSearch("");
    setPage(1);
  };

  const filtrosActivos =
    sucursalFiltro !== "Todas" ||
    tipoVehiculoFiltro !== "Todos" ||
    search.trim() !== "";

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

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6  sm:block hidden  text-blue-600 dark:text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gestión de Vehículos
          </h2>
          <span className="px-2 py-1  sm:block hidden  text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
            {totalItems} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AddVehicleDialog 
            sucursales={sucursales} 
            tiposVehiculos={tiposVehiculos} 
            conductores={conductores}
          />
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 pt-4 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[250px] w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar placas, conductor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          <div className="flex flex-col w-full  md:flex-row gap-3">
            <div className="relative flex-1 md:flex-none md:max-w-md">
              <select
                value={sucursalFiltro}
                onChange={(e) => { setSucursalFiltro(e.target.value); setPage(1); }}
                className="appearance-none w-full px-4 py-2.5 md:pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-all"
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
                onChange={(e) => { setTipoVehiculoFiltro(e.target.value); setPage(1); }}
                className="appearance-none w-full px-4 py-2.5 md:pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-all"
              >
                <option value="Todos">Todos los tipos</option>
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Placas</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Capacidad</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Sucursal</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Conductor</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron vehículos
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className=" border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-gray-800 dark:text-white/90 font-medium">
                    {vehicle.placas}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {vehicle.tipoVehiculo}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {vehicle.capacidadKg} kg
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800 dark:text-white/90">{vehicle.sucursal.nombreCuo}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{vehicle.sucursal.nombreEntidad}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {vehicle.conductor ? vehicle.conductor.nombreCompleto : <span className="text-gray-400 dark:text-gray-500 italic">Sin asignar</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm capitalize ${getEstadoColor(vehicle.estado)}`}>
                      {vehicle.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <EditVehicleDialog 
                      vehicle={vehicle} 
                      sucursales={sucursales} 
                      tiposVehiculos={tiposVehiculos} 
                      conductores={conductores}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4  border-gray-100 dark:border-gray-800 flex justify-center md:justify-end">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
