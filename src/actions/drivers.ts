"use server";

import prisma from "@/prisma/prisma";
import { revalidatePath } from "next/cache";

export interface ConductorData {
  id: number;
  nombreCompleto: string;
  curp: string;
  rfc: string;
  licencia: string;
  licenciaVigente: boolean;
  telefono: string;
  correo: string;
  disponibilidad: boolean;
  fechaAlta: Date;
  sucursal: {
    claveCuo: string;
    nombreCuo: string;
    nombreEntidad: string;
  };
  unidades: {
    id: number;
    placas: string;
    tipoVehiculo: string;
  }[];
}

export async function getVehiculosDisponibles(claveOficina: string, conductorCurp?: string) {
  try {
    console.log("Fetching available vehicles for office:", claveOficina, "and driver CURP:", conductorCurp);
    const where: any = {
      claveOficina,
      OR: [
        { curpConductor: null },
        { curpConductor: "" }
      ]
    };

    if (conductorCurp) {
      where.OR.push({ curpConductor: conductorCurp });
    }

    console.log("Constructed where clause for available vehicles:", where);

    const vehicles = await prisma.unidad.findMany({
      where:{
        claveOficina: claveOficina,
      },
      include: { tipoVehiculo: true },
      orderBy: { placas: 'asc' }
    });
    console.log("Available vehicles fetched:", vehicles);
    return vehicles.map(v => ({
      id: v.id,
      placas: v.placas,
      tipo: v.tipoVehiculo.tipoVehiculo
    }));
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    return [];
  }
}

export async function getConductoresPaginated(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  sucursal: string = "Todas"
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nombreCompleto: { contains: search, mode: "insensitive" } },
        { curp: { contains: search, mode: "insensitive" } },
        { rfc: { contains: search, mode: "insensitive" } },
        { correo: { contains: search, mode: "insensitive" } },
      ];
    }

    if (sucursal !== "Todas") {
      where.claveOficina = sucursal;
    }

    const [total, conductores] = await Promise.all([
      prisma.conductor.count({ where }),
      prisma.conductor.findMany({
        where,
        include: {
          oficina: true,
          unidades: {
            include: {
              tipoVehiculo: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { nombreCompleto: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = conductores.map((c) => ({
      id: c.id,
      nombreCompleto: c.nombreCompleto,
      curp: c.curp,
      rfc: c.rfc,
      licencia: c.licencia,
      licenciaVigente: c.licenciaVigente,
      telefono: c.telefono,
      correo: c.correo,
      disponibilidad: c.disponibilidad,
      fechaAlta: c.fechaAlta,
      sucursal: {
        claveCuo: c.oficina.clave_cuo,
        nombreCuo: c.oficina.nombre_cuo,
        nombreEntidad: c.oficina.nombre_entidad,
      },
      unidades: c.unidades.map(u => ({
        id: u.id,
        placas: u.placas,
        tipoVehiculo: u.tipoVehiculo.tipoVehiculo
      }))
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
    console.error("Error fetching paginated drivers:", error);
    return {
      data: [],
      pagination: { total: 0, totalPages: 0, currentPage: 1, limit },
    };
  }
}

export async function createConductor(data: FormData) {
  try {
    const nombreCompleto = data.get("nombreCompleto") as string;
    const curp = data.get("curp") as string;
    const rfc = data.get("rfc") as string;
    const licencia = data.get("licencia") as string;
    const licenciaVigente = data.get("licenciaVigente") === "true";
    const telefono = data.get("telefono") as string;
    const correo = data.get("correo") as string;
    const claveOficina = data.get("claveOficina") as string;
    const disponibilidad = data.get("disponibilidad") === "true";
    const vehiculoId = data.get("vehiculoId") ? Number(data.get("vehiculoId")) : null;

    // Validación de campos obligatorios
    if (!nombreCompleto || !nombreCompleto.trim()) {
      return { success: false, message: "El nombre completo es obligatorio." };
    }
    if (!curp || !curp.trim()) {
      return { success: false, message: "El CURP es obligatorio." };
    }
    if (!rfc || !rfc.trim()) {
      return { success: false, message: "El RFC es obligatorio." };
    }
    if (!licencia || !licencia.trim()) {
      return { success: false, message: "El número de licencia es obligatorio." };
    }
    if (!telefono || !telefono.trim()) {
      return { success: false, message: "El teléfono es obligatorio." };
    }
    if (!correo || !correo.trim()) {
      return { success: false, message: "El correo electrónico es obligatorio." };
    }
    if (!claveOficina || !claveOficina.trim()) {
      return { success: false, message: "La sucursal es obligatoria. Por favor selecciona una sucursal." };
    }

    const conductor = await prisma.conductor.create({
      data: {
        nombreCompleto,
        curp,
        rfc,
        licencia,
        licenciaVigente,
        telefono,
        correo,
        claveOficina,
        disponibilidad,
        fechaAlta: new Date(),
      },
    });

    if (vehiculoId) {
      await prisma.unidad.update({
        where: { id: vehiculoId },
        data: { curpConductor: conductor.curp }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error creating driver:", error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      const targetString = Array.isArray(target) ? target.join(',') : String(target);
      const curp = data.get("curp") as string;
      const rfc = data.get("rfc") as string;
      
      if (targetString.includes('curp')) {
        return { success: false, message: `El CURP "${curp}" ya está registrado en otro conductor.` };
      }
      if (targetString.includes('rfc')) {
        return { success: false, message: `El RFC "${rfc}" ya está registrado en otro conductor.` };
      }
      return { success: false, message: "Ya existe un conductor con estos datos. Verifica CURP y RFC." };
    }
    if (error.code === 'P2003') {
      const constraint = error.meta?.constraint;
      if (constraint && String(constraint).includes('clave_oficina')) {
        return { success: false, message: "La sucursal seleccionada no existe. Por favor selecciona una sucursal válida." };
      }
      return { success: false, message: "Error de referencia: uno de los campos hace referencia a un registro que no existe." };
    }
    return { success: false, message: "Error al crear el conductor. Intenta de nuevo." };
  }
}

export async function updateConductor(id: number, data: FormData) {
  try {
    const nombreCompleto = data.get("nombreCompleto") as string;
    const curp = data.get("curp") as string;
    const rfc = data.get("rfc") as string;
    const licencia = data.get("licencia") as string;
    const licenciaVigente = data.get("licenciaVigente") === "true";
    const telefono = data.get("telefono") as string;
    const correo = data.get("correo") as string;
    const claveOficina = data.get("claveOficina") as string;
    const disponibilidad = data.get("disponibilidad") === "true";
    const vehiculoId = data.get("vehiculoId") ? Number(data.get("vehiculoId")) : null;

    // Validación de campos obligatorios
    if (!nombreCompleto || !nombreCompleto.trim()) {
      return { success: false, message: "El nombre completo es obligatorio." };
    }
    if (!curp || !curp.trim()) {
      return { success: false, message: "El CURP es obligatorio." };
    }
    if (!rfc || !rfc.trim()) {
      return { success: false, message: "El RFC es obligatorio." };
    }
    if (!licencia || !licencia.trim()) {
      return { success: false, message: "El número de licencia es obligatorio." };
    }
    if (!telefono || !telefono.trim()) {
      return { success: false, message: "El teléfono es obligatorio." };
    }
    if (!correo || !correo.trim()) {
      return { success: false, message: "El correo electrónico es obligatorio." };
    }
    if (!claveOficina || !claveOficina.trim()) {
      return { success: false, message: "La sucursal es obligatoria. Por favor selecciona una sucursal." };
    }

    // Get current driver to check if CURP changed (unlikely but possible) or to handle vehicle reassignment
    const currentDriver = await prisma.conductor.findUnique({
      where: { id },
      include: { unidades: true }
    });

    if (!currentDriver) throw new Error("Driver not found");

    await prisma.conductor.update({
      where: { id },
      data: {
        nombreCompleto,
        curp,
        rfc,
        licencia,
        licenciaVigente,
        telefono,
        correo,
        claveOficina,
        disponibilidad,
      },
    });

    // Handle vehicle assignment
    // 1. Unassign all vehicles currently assigned to this driver (if we assume 1:1 or strict reassignment)
    // Or better: check if vehicleId is different.
    
    // If vehicleId is provided:
    if (vehiculoId) {
      // Check if this vehicle is already assigned to this driver
      const isAssigned = currentDriver.unidades.some(u => u.id === vehiculoId);
      
      if (!isAssigned) {
        // Unassign previous vehicles (if we want to enforce single vehicle per driver)
        // For now, let's unassign all other vehicles from this driver to keep it clean 1:1
        await prisma.unidad.updateMany({
          where: { curpConductor: currentDriver.curp },
          data: { curpConductor: null }
        });

        // Assign new vehicle
        await prisma.unidad.update({
          where: { id: vehiculoId },
          data: { curpConductor: curp } // Use new CURP in case it changed
        });
      }
    } else {
      // If vehicleId is null/undefined (e.g. "Sin asignar" selected), unassign all vehicles
      // But only if the user explicitly selected "Sin asignar". 
      // If the field is missing from FormData, we might not want to change anything?
      // Assuming the form sends "unassigned" or empty string for no vehicle.
      const rawVehicleId = data.get("vehiculoId");
      if (rawVehicleId === "unassigned" || rawVehicleId === "") {
         await prisma.unidad.updateMany({
          where: { curpConductor: currentDriver.curp },
          data: { curpConductor: null }
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating driver:", error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      const targetString = Array.isArray(target) ? target.join(',') : String(target);
      const curp = data.get("curp") as string;
      const rfc = data.get("rfc") as string;
      
      if (targetString.includes('curp')) {
        return { success: false, message: `El CURP "${curp}" ya está registrado en otro conductor.` };
      }
      if (targetString.includes('rfc')) {
        return { success: false, message: `El RFC "${rfc}" ya está registrado en otro conductor.` };
      }
      return { success: false, message: "Ya existe un conductor con estos datos. Verifica CURP y RFC." };
    }
    if (error.code === 'P2003') {
      const constraint = error.meta?.constraint;
      if (constraint && String(constraint).includes('clave_oficina')) {
        return { success: false, message: "La sucursal seleccionada no existe. Por favor selecciona una sucursal válida." };
      }
      return { success: false, message: "Error de referencia: uno de los campos hace referencia a un registro que no existe." };
    }
    return { success: false, message: "Error al actualizar el conductor. Intenta de nuevo." };
  }
}
