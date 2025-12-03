"use server";

import prisma from "@/prisma/prisma";

export interface VehiculoConConductor {
  id: number;
  placas: string;
  tipoVehiculo: string;
  estado: string;
  conductor: {
    id: number;
    nombreCompleto: string;
    curp: string;
    telefono: string;
    correo: string;
    disponibilidad: boolean;
  } | null;
  sucursal: {
    claveCuo: string;
    nombreCuo: string;
    nombreEntidad: string;
    nombreMunicipio: string;
  };
}

export async function getVehiculosConConductores(): Promise<VehiculoConConductor[]> {
  try {
    const unidades = await prisma.unidad.findMany({
      include: {
        conductor: true,
        tipoVehiculo: true,
        oficina: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return unidades.map((unidad) => ({
      id: unidad.id,
      placas: unidad.placas,
      tipoVehiculo: unidad.tipoVehiculo.tipoVehiculo,
      estado: unidad.estado,
      conductor: unidad.conductor
        ? {
            id: unidad.conductor.id,
            nombreCompleto: unidad.conductor.nombreCompleto,
            curp: unidad.conductor.curp,
            telefono: unidad.conductor.telefono,
            correo: unidad.conductor.correo,
            disponibilidad: unidad.conductor.disponibilidad,
          }
        : null,
      sucursal: {
        claveCuo: unidad.oficina.clave_cuo,
        nombreCuo: unidad.oficina.nombre_cuo,
        nombreEntidad: unidad.oficina.nombre_entidad,
        nombreMunicipio: unidad.oficina.nombre_municipio,
      },
    }));
  } catch (error) {
    console.error("Error fetching vehicles with drivers:", error);
    return [];
  }
}

export async function getSucursales() {
  try {
    const oficinas = await prisma.oficina.findMany({
      where: {
        activo: true,
      },
      select: {
        clave_cuo: true,
        nombre_cuo: true,
        nombre_entidad: true,
      },
      orderBy: {
        nombre_cuo: "asc",
      },
    });

    return oficinas.map((o) => ({
      claveCuo: o.clave_cuo,
      nombreCuo: o.nombre_cuo,
      nombreEntidad: o.nombre_entidad,
    }));
  } catch (error) {
    console.error("Error fetching branches:", error);
    return [];
  }
}

export async function getTiposVehiculos() {
  try {
    const tipos = await prisma.tipoVehiculo.findMany({
      orderBy: {
        tipoVehiculo: "asc",
      },
    });

    return tipos.map((t) => ({
      id: t.id,
      tipoVehiculo: t.tipoVehiculo,
      capacidadKg: Number(t.capacidadKg),
    }));
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    return [];
  }
}

export async function getVehiclesPaginated(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  sucursal: string = "Todas",
  tipo: string = "Todos"
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { placas: { contains: search, mode: "insensitive" } },
        { conductor: { nombreCompleto: { contains: search, mode: "insensitive" } } },
        { oficina: { nombre_cuo: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (sucursal !== "Todas") {
      where.claveOficina = sucursal;
    }

    if (tipo !== "Todos") {
      where.tipoVehiculo = { tipoVehiculo: tipo };
    }

    const [total, unidades] = await Promise.all([
      prisma.unidad.count({ where }),
      prisma.unidad.findMany({
        where,
        include: {
          conductor: true,
          tipoVehiculo: true,
          oficina: true,
        },
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = unidades.map((unidad) => ({
      id: unidad.id,
      placas: unidad.placas,
      tipoVehiculo: unidad.tipoVehiculo.tipoVehiculo,
      capacidadKg: Number(unidad.tipoVehiculo.capacidadKg),
      estado: unidad.estado,
      conductor: unidad.conductor
        ? {
            nombreCompleto: unidad.conductor.nombreCompleto,
          }
        : null,
      sucursal: {
        nombreCuo: unidad.oficina.nombre_cuo,
        nombreEntidad: unidad.oficina.nombre_entidad,
      },
    }));

    return {
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated vehicles:", error);
    return {
      data: [],
      pagination: { total: 0, totalPages: 0, currentPage: 1, limit },
    };
  }
}

export async function getOfficesPaginated(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nombre_cuo: { contains: search, mode: "insensitive" } },
        { clave_cuo: { contains: search, mode: "insensitive" } },
        { nombre_municipio: { contains: search, mode: "insensitive" } },
        { nombre_entidad: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, oficinas] = await Promise.all([
      prisma.oficina.count({ where }),
      prisma.oficina.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre_cuo: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = oficinas.map((oficina) => ({
      id: oficina.id_oficina,
      claveCuo: oficina.clave_cuo,
      nombreCuo: oficina.nombre_cuo,
      entidad: oficina.nombre_entidad,
      municipio: oficina.nombre_municipio,
      telefono: oficina.telefono,
      activo: oficina.activo,
      domicilio: oficina.domicilio,
    }));

    return {
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated offices:", error);
    return {
      data: [],
      pagination: { total: 0, totalPages: 0, currentPage: 1, limit },
    };
  }
}
