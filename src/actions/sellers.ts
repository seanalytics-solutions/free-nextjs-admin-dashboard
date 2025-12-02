"use server";

import prisma from "@/prisma/prisma";
import { revalidatePath } from "next/cache";

export async function getSellers() {
  try {
    const sellers = await prisma.usuarios.findMany({
      where: {
        rol: "vendedor",
      },
      include: {
        profile: true,
      },
    });
    return sellers;
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
}

export async function getSellerRequests() {
  try {
    const requests = await prisma.solicitudVendedor.findMany({
      include: {
        usuario: {
          include: {
            profile: true
          }
        }
      }
    });
    return requests;
  } catch (error) {
    console.error("Error fetching seller requests:", error);
    return [];
  }
}

export async function acceptSellerRequest(requestId: number) {
  try {
    const request = await prisma.solicitudVendedor.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    if (request.userId) {
      // Update user role
      await prisma.usuarios.update({
        where: { id: request.userId },
        data: {
          rol: "vendedor",
        },
      });
      
      // Update profile with RFC if available in request
      if (request.rfc) {
         // Check if profile exists first or use upsert if needed, but usually profile exists for user
         const profile = await prisma.profile.findUnique({ where: { usuarioId: request.userId } });
         if (profile) {
             await prisma.profile.update({
                where: { usuarioId: request.userId },
                data: { RFC: request.rfc }
             });
         }
      }
    }

    // Delete the request
    await prisma.solicitudVendedor.delete({
      where: { id: requestId },
    });

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error accepting seller request:", error);
    return { success: false, error: "Error al aceptar la solicitud" };
  }
}

export async function rejectSellerRequest(requestId: number) {
  try {
    await prisma.solicitudVendedor.delete({
      where: { id: requestId },
    });
    // revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting seller request:", error);
    return { success: false, error: "Error al rechazar la solicitud" };
  }
}

export async function deleteSeller(sellerId: number) {
  try { 
    
    Promise.all([
      prisma.solicitudVendedor.deleteMany({
        where: { userId: sellerId },
        }),
        prisma.usuarios.delete({
            where: { id: sellerId },
        }),
    ]);

    // await prisma.usuarios.update({
    //   where: { id: sellerId },
    //   data: { rol: "usuario" },
    // });
    // await prisma.product.updateMany({
    //   where: { sellerId: sellerId },
    //   data: { estado: false }, 
    // });

    return { success: true };
  } catch (error) {
    console.error("Error deleting seller:", error);
    return { success: false, error: "Error al eliminar vendedor" };
  }
}
