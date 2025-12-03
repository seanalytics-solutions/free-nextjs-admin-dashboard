"use client";

import { Search, Building2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Pagination from "@/components/tables/Pagination";
import { getOfficesPaginated } from "@/actions/vehicles";

interface OfficeData {
  id: number;
  claveCuo: string;
  nombreCuo: string;
  entidad: string;
  municipio: string;
  telefono: string;
  activo: boolean;
  domicilio: string;
}

export function OfficesTable() {
  const [offices, setOffices] = useState<OfficeData[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOfficesPaginated(page, limit, search);
      setOffices(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (error) {
      console.error("Error fetching offices:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {/* Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gestión de Sucursales
          </h2>
          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
            {totalItems} total
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

      {/* Filters */}
      <div className="p-6 pt-4 pb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar sucursal, clave, municipio..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className=" border-gray-100 dark:border-gray-800">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Clave</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Ubicación</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : offices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron sucursales
                </td>
              </tr>
            ) : (
              offices.map((office) => (
                <tr
                  key={office.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-gray-800 dark:text-white/90 font-medium">
                    {office.claveCuo}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800 dark:text-white/90 font-medium">{office.nombreCuo}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={office.domicilio}>
                      {office.domicilio}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500 dark:text-gray-400">{office.municipio}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{office.entidad}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {office.telefono}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      office.activo 
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                        : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                    }`}>
                      {office.activo ? "Activa" : "Inactiva"}
                    </span>
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
