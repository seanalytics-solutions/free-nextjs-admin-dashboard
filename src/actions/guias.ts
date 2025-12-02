"use server";

import prisma from "@/prisma/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export type Guia = {
  id_guia: string;
  numero_de_rastreo: string;
  situacion_actual: string;
  alto_cm: number;
  largo_cm: number;
  ancho_cm: number;
  peso_kg: number;
  valor_declarado: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  fecha_entrega_estimada: Date | null;
  key_pdf: string | null;
  profile?: {
    nombre: string;
    apellido: string;
    usuario?: {
        correo: string;
    } | null;
  } | null;
  remitente?: any;
  destinatario?: any;
  envios?: any[];
};

export async function getGuias({
  page = 1,
  pageSize = 10,
  search = "",
}: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ guias: Guia[]; totalPages: number }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { guias: [], totalPages: 0 };
  }

  const where: any = {};

  if (search) {
    where.OR = [
      { numero_de_rastreo: { contains: search, mode: "insensitive" } },
      {
        profile: {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { apellido: { contains: search, mode: "insensitive" } },
             { Usuarios: { correo: { contains: search, mode: "insensitive" } } }
          ],
        },
      },
    ];
  }

  const totalGuias = await prisma.guia.count({ where });
  const totalPages = Math.ceil(totalGuias / pageSize);

  const guias = await prisma.guia.findMany({
    where,
    take: pageSize,
    skip: (page - 1) * pageSize,
    include: {
      profile: {
        select: {
            nombre: true,
            apellido: true,
            Usuarios: {
                select: {
                    correo: true
                }
            }
        }
      },
      remitente: true,
      destinatario: true,
      envios: true,
    },
    orderBy: {
      fecha_creacion: "desc",
    },
  });

  const formattedGuias = guias.map((guia) => ({
    ...guia,
    alto_cm: guia.alto_cm.toNumber(),
    largo_cm: guia.largo_cm.toNumber(),
    ancho_cm: guia.ancho_cm.toNumber(),
    peso_kg: guia.peso_kg.toNumber(),
    valor_declarado: guia.valor_declarado.toNumber(),
    profile: guia.profile ? {
        ...guia.profile,
        usuario: guia.profile.Usuarios
    } : null,
    remitente: guia.remitente ? {
        ...guia.remitente,
        lat: guia.remitente.lat ? Number(guia.remitente.lat) : null,
        lng: guia.remitente.lng ? Number(guia.remitente.lng) : null,
    } : null,
    destinatario: guia.destinatario ? {
        ...guia.destinatario,
        lat: guia.destinatario.lat ? Number(guia.destinatario.lat) : null,
        lng: guia.destinatario.lng ? Number(guia.destinatario.lng) : null,
    } : null,
  }));

  return { guias: formattedGuias, totalPages };
}

export async function getGuiaById(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !id) {
        return null;
    }

    const guia = await prisma.guia.findUnique({
        where: { id_guia: id },
        include: {
            profile: {
                include: {
                    Usuarios: true
                }
            },
            remitente: true,
            destinatario: true,
            envios: {
                include: {
                    unidad: true
                }
            },
            movimientos: true,
            incidencias: true
        }
    });

    if (!guia) return null;

    return {
        ...guia,
        alto_cm: guia.alto_cm.toNumber(),
        largo_cm: guia.largo_cm.toNumber(),
        ancho_cm: guia.ancho_cm.toNumber(),
        peso_kg: guia.peso_kg.toNumber(),
        valor_declarado: guia.valor_declarado.toNumber(),
        profile: guia.profile ? {
            ...guia.profile,
            usuario: guia.profile.Usuarios
        } : null,
        remitente: guia.remitente ? {
            ...guia.remitente,
            lat: guia.remitente.lat ? Number(guia.remitente.lat) : null,
            lng: guia.remitente.lng ? Number(guia.remitente.lng) : null,
        } : null,
        destinatario: guia.destinatario ? {
            ...guia.destinatario,
            lat: guia.destinatario.lat ? Number(guia.destinatario.lat) : null,
            lng: guia.destinatario.lng ? Number(guia.destinatario.lng) : null,
        } : null,
        envios: guia.envios.map((envio) => ({
            ...envio,
            unidad: envio.unidad ? {
                ...envio.unidad,
                volumenCarga: Number(envio.unidad.volumenCarga),
            } : null
        }))
    };
}
