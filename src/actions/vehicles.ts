"use server";

import prisma from "@/prisma/prisma";

export interface VehiculoConConductor {
  id: number;
  placas: string;
  tipoVehiculo: string;
  tipoVehiculoId: number;
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
      tipoVehiculoId: unidad.tipoVehiculo.id,
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

export async function getConductores() {
  try {
    const conductores = await prisma.conductor.findMany({
      include: {
        unidades: true,
      },
      orderBy: {
        nombreCompleto: "asc",
      },
    });
    return conductores.map((c) => ({
      id: c.id,
      nombreCompleto: c.nombreCompleto,
      curp: c.curp,
      claveOficina: c.claveOficina,
      disponibilidad: c.disponibilidad,
      isAssigned: c.unidades.length > 0,
    }));
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
}

export async function updateVehicle(id: number, data: FormData) {
  try {
    const placas = data.get("placas") as string;
    const estado = data.get("estado") as string;
    const tipoVehiculoId = Number(data.get("tipoVehiculoId"));
    const claveOficina = data.get("claveOficina") as string;
    const curpConductor = data.get("curpConductor") as string;
    const volumenCarga = Number(data.get("volumenCarga"));
    const numEjes = Number(data.get("numEjes"));
    const numLlantas = Number(data.get("numLlantas"));
    const tarjetaCirculacion = data.get("tarjetaCirculacion") as string;

    await prisma.unidad.update({
      where: { id },
      data: {
        placas,
        estado,
        tipoVehiculoId,
        claveOficina,
        curpConductor: curpConductor === "unassigned" || !curpConductor ? null : curpConductor,
        volumenCarga,
        numEjes,
        numLlantas,
        tarjetaCirculacion,
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      const targetString = Array.isArray(target) ? target.join(',') : String(target);
      
      if (targetString.includes('tarjeta_circulacion') || targetString.includes('tarjetaCirculacion')) {
          const tarjetaCirculacion = data.get("tarjetaCirculacion") as string;
          return { success: false, message: `La tarjeta de circulación "${tarjetaCirculacion}" ya está registrada en otro vehículo.` };
      }
      if (targetString.includes('placas')) {
          const placas = data.get("placas") as string;
          return { success: false, message: `Las placas "${placas}" ya están registradas en otro vehículo.` };
      }
      return { success: false, message: "Ya existe un registro con estos datos. Verifica los campos únicos (placas o tarjeta de circulación)." };
    }
    if (error.code === 'P2003') {
      const constraint = error.meta?.constraint || error.meta?.field_name || '';
      const constraintStr = String(constraint);
      if (constraintStr.includes('clave_oficina') || constraintStr.includes('claveOficina')) {
        return { success: false, message: "La sucursal seleccionada no existe. Por favor selecciona una sucursal válida." };
      }
      if (constraintStr.includes('tipo_vehiculo') || constraintStr.includes('tipoVehiculo')) {
        return { success: false, message: "El tipo de vehículo seleccionado no existe. Por favor selecciona un tipo válido." };
      }
      if (constraintStr.includes('curp_conductor') || constraintStr.includes('curpConductor')) {
        return { success: false, message: "El conductor seleccionado no existe. Por favor selecciona un conductor válido." };
      }
      return { success: false, message: "Error de referencia: uno de los campos hace referencia a un registro que no existe." };
    }
    return { success: false, message: "Error al actualizar el vehículo. Intenta de nuevo." };
  }
}

export async function createVehicle(data: FormData) {
  try {
    const placas = data.get("placas") as string;
    const estado = data.get("estado") as string;
    const tipoVehiculoId = Number(data.get("tipoVehiculoId"));
    const claveOficina = data.get("claveOficina") as string;
    const curpConductor = data.get("curpConductor") as string;
    const volumenCarga = Number(data.get("volumenCarga"));
    const numEjes = Number(data.get("numEjes"));
    const numLlantas = Number(data.get("numLlantas"));
    const tarjetaCirculacion = data.get("tarjetaCirculacion") as string;

    await prisma.unidad.create({
      data: {
        placas,
        estado: estado || "disponible",
        tipoVehiculoId,
        claveOficina,
        curpConductor: curpConductor === "unassigned" || !curpConductor ? null : curpConductor,
        volumenCarga,
        numEjes,
        numLlantas,
        tarjetaCirculacion,
        fechaAlta: new Date(),
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error creating vehicle:", error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      const targetString = Array.isArray(target) ? target.join(',') : String(target);
      
      if (targetString.includes('tarjeta_circulacion') || targetString.includes('tarjetaCirculacion')) {
          return { success: false, message: `La tarjeta de circulación ya está registrada en otro vehículo.` };
      }
      if (targetString.includes('placas')) {
          return { success: false, message: `Las placas ya están registradas en otro vehículo.` };
      }
      return { success: false, message: "Ya existe un registro con estos datos. Verifica los campos únicos (placas o tarjeta de circulación)." };
    }
    if (error.code === 'P2003') {
      const constraint = error.meta?.constraint || error.meta?.field_name || '';
      const constraintStr = String(constraint);
      if (constraintStr.includes('clave_oficina') || constraintStr.includes('claveOficina')) {
        return { success: false, message: "La sucursal seleccionada no existe. Por favor selecciona una sucursal válida." };
      }
      if (constraintStr.includes('tipo_vehiculo') || constraintStr.includes('tipoVehiculo')) {
        return { success: false, message: "El tipo de vehículo seleccionado no existe. Por favor selecciona un tipo válido." };
      }
      if (constraintStr.includes('curp_conductor') || constraintStr.includes('curpConductor')) {
        return { success: false, message: "El conductor seleccionado no existe. Por favor selecciona un conductor válido." };
      }
      return { success: false, message: "Error de referencia: uno de los campos hace referencia a un registro que no existe." };
    }
    return { success: false, message: "Error al crear el vehículo. Intenta de nuevo." };
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
      volumenCarga: Number(unidad.volumenCarga),
      numEjes: unidad.numEjes,
      numLlantas: unidad.numLlantas,
      tarjetaCirculacion: unidad.tarjetaCirculacion,
      conductor: unidad.conductor
        ? {
            nombreCompleto: unidad.conductor.nombreCompleto,
            curp: unidad.conductor.curp,
          }
        : null,
      sucursal: {
        claveCuo: unidad.oficina.clave_cuo,
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
