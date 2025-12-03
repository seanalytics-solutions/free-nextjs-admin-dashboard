"use client";

import {  Search, Car, Filter } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { useState } from "react";

interface Vehiculo {
  id: number;
  conductor: {
    nombre: string;
    apellido: string;
    ine: string;
    imagen: string;
  };
  sucursal: string;
  tipoVehiculo: string;
}

const vehiculosData: Vehiculo[] = [
  {
    id: 1,
    conductor: {
      nombre: "Roberto",
      apellido: "Pérez",
      ine: "PERR850612HDF",
      imagen: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
    },
    sucursal: "Sucursal Centro",
    tipoVehiculo: "Camioneta"
  },
  {
    id: 2,
    conductor: {
      nombre: "Laura",
      apellido: "García",
      ine: "GARL900320MDF",
      imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
    },
    sucursal: "Sucursal Norte",
    tipoVehiculo: "Sedán"
  },
  {
    id: 3,
    conductor: {
      nombre: "Miguel",
      apellido: "Torres",
      ine: "TORM880915HDF",
      imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
    },
    sucursal: "Sucursal Sur",
    tipoVehiculo: "Camión"
  },
  {
    id: 4,
    conductor: {
      nombre: "Carmen",
      apellido: "Ramírez",
      ine: "RAMC920705MDF",
      imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
    },
    sucursal: "Sucursal Centro",
    tipoVehiculo: "Van"
  },
  {
    id: 5,
    conductor: {
      nombre: "Fernando",
      apellido: "Vargas",
      ine: "VARF870425HDF",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    sucursal: "Sucursal Norte",
    tipoVehiculo: "Camioneta"
  },
  {
    id: 6,
    conductor: {
      nombre: "Sofía",
      apellido: "Méndez",
      ine: "MEMS950810MDF",
      imagen: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400"
    },
    sucursal: "Sucursal Sur",
    tipoVehiculo: "Sedán"
  },
  {
    id: 7,
    conductor: {
      nombre: "Diego",
      apellido: "Flores",
      ine: "FLOD910220HDF",
      imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    sucursal: "Sucursal Centro",
    tipoVehiculo: "Camión"
  }
];

export function BranchesVehiclesTable() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(vehiculosData);
  const [busqueda, setBusqueda] = useState("");
  const [sucursalFiltro, setSucursalFiltro] = useState<string>("Todas");
  const [tipoVehiculoFiltro, setTipoVehiculoFiltro] = useState<string>("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Obtener sucursales únicas
  const sucursales = ["Todas", ...Array.from(new Set(vehiculosData.map(v => v.sucursal)))];
  
  // Obtener tipos de vehículos únicos
  const tiposVehiculos = ["Todos", ...Array.from(new Set(vehiculosData.map(v => v.tipoVehiculo)))];

  // Filtrar vehículos
  const vehiculosFiltrados = vehiculos.filter(v => {
    // Filtro de búsqueda por texto
    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda = !busqueda.trim() || 
      v.conductor.nombre.toLowerCase().includes(busquedaLower) ||
      v.conductor.apellido.toLowerCase().includes(busquedaLower) ||
      v.conductor.ine.toLowerCase().includes(busquedaLower) ||
      v.sucursal.toLowerCase().includes(busquedaLower) ||
      v.tipoVehiculo.toLowerCase().includes(busquedaLower);

    // Filtro de sucursal
    const coincideSucursal = sucursalFiltro === "Todas" || v.sucursal === sucursalFiltro;

    // Filtro de tipo de vehículo
    const coincideTipoVehiculo = tipoVehiculoFiltro === "Todos" || v.tipoVehiculo === tipoVehiculoFiltro;

    return coincideBusqueda && coincideSucursal && coincideTipoVehiculo;
  });

  const handleVerVehiculo = (vehiculo: Vehiculo) => {
    alert(`Ver detalles del vehículo\nConductor: ${vehiculo.conductor.nombre} ${vehiculo.conductor.apellido}\nINE: ${vehiculo.conductor.ine}\nSucursal: ${vehiculo.sucursal}\nTipo: ${vehiculo.tipoVehiculo}`);
  };

  const handleEliminarVehiculo = (id: number) => {
    const vehiculo = vehiculos.find(v => v.id === id);
    if (vehiculo && confirm(`¿Estás seguro de eliminar el vehículo del conductor ${vehiculo.conductor.nombre} ${vehiculo.conductor.apellido}?`)) {
      setVehiculos(vehiculos.filter(v => v.id !== id));
    }
  };

  const limpiarFiltros = () => {
    setSucursalFiltro("Todas");
    setTipoVehiculoFiltro("Todos");
    setBusqueda("");
  };

  const filtrosActivos = sucursalFiltro !== "Todas" || tipoVehiculoFiltro !== "Todos" || busqueda.trim() !== "";

  return (
    <div className="bg-[#1a2332] rounded-xl overflow-hidden shadow-sm border border-[#2d3748]">
      {/* Header con Buscador y Filtros */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por conductor, INE, sucursal o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-[#374151] rounded-lg bg-[#1f2937] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full"
            />
          </div>

          {/* Filtros dropdown */}
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={sucursalFiltro}
                onChange={(e) => setSucursalFiltro(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 border border-[#374151] rounded-lg bg-[#1f2937] text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:border-[#4b5563] transition-all"
              >
                <option value="Todas">Todas las sucursales</option>
                {sucursales.filter(s => s !== "Todas").map(sucursal => (
                  <option key={sucursal} value={sucursal}>{sucursal}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={tipoVehiculoFiltro}
                onChange={(e) => setTipoVehiculoFiltro(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 border border-[#374151] rounded-lg bg-[#1f2937] text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:border-[#4b5563] transition-all"
              >
                <option value="Todos">Todos los vehículos</option>
                {tiposVehiculos.filter(t => t !== "Todos").map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <Car className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {filtrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2.5 rounded-lg border border-[#374151] bg-[#1f2937] text-gray-400 hover:bg-[#374151] transition-all text-sm"
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
            <tr className="border-b border-[#2d3748]">
              <th className="px-6 py-3 text-left text-gray-400">Conductor</th>
              <th className="px-6 py-3 text-left text-gray-400">INE</th>
              <th className="px-6 py-3 text-left text-gray-400">Sucursal</th>
              <th className="px-6 py-3 text-left text-gray-400">Tipo de Vehículo</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.map((vehiculo) => (
              <tr key={vehiculo.id} className="border-b border-[#2d3748] hover:bg-[#1f2937] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={vehiculo.conductor.imagen}
                      alt={`${vehiculo.conductor.nombre} ${vehiculo.conductor.apellido}`}
                      className="w-11 h-11 rounded-lg object-cover"
                    />
                    <div>
                      <div className="text-gray-200">
                        {vehiculo.conductor.nombre} {vehiculo.conductor.apellido}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {vehiculo.conductor.ine}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-400">
                    {vehiculo.sucursal}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                    vehiculo.tipoVehiculo === "Camioneta" ? "bg-purple-500/20 text-purple-400" :
                    vehiculo.tipoVehiculo === "Sedán" ? "bg-emerald-500/20 text-emerald-400" :
                    vehiculo.tipoVehiculo === "Camión" ? "bg-orange-500/20 text-orange-400" :
                    "bg-indigo-500/20 text-indigo-400"
                  }`}>
                    <Car className="w-3.5 h-3.5" />
                    {vehiculo.tipoVehiculo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {vehiculosFiltrados.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            {filtrosActivos 
              ? "No se encontraron vehículos con los filtros aplicados" 
              : "No hay vehículos registrados"}
          </div>
        )}
      </div>

      {/* Footer con contador */}
      {vehiculosFiltrados.length > 0 && (
        <div className="px-6 py-4 border-t border-[#2d3748] bg-[#1f2937]">
          <p className="text-sm text-gray-400">
            Mostrando <span className="text-gray-200">{vehiculosFiltrados.length}</span> de{" "}
            <span className="text-gray-200">{vehiculos.length}</span> vehículos
          </p>
        </div>
      )}
    </div>
  );
}