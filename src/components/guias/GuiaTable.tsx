"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getGuias } from "@/actions/guias";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import GeneralCardLoading from "../ui/general/GeneralCardLoading";
import { GeneralErrorContent } from "../ui/general/GeneralErrorContent";
import Pagination from "../tables/Pagination";
import { useState } from "react";
import { PaginationSkeleton } from "../ui/general/PaginationSkeleton";
import ExpandableInput from "../ui/expandable-input";
import { useDebounce } from "@/hooks/useDebounce";
import { useSidebar } from "@/context/SidebarContext";
import { useRouter } from "next/navigation";
import { useFileViewer } from "@/context/FileViewerContext";
import { Eye } from "lucide-react";

export default function GuiaTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { isMobile } = useSidebar();
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();
  const { openFile } = useFileViewer();

  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ["guias", page, debouncedSearch],
    queryFn: () => getGuias({ page, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  if (isPending) {
    return (
      <GeneralCardLoading title={true} className={`h-[570px] relative`}>
        <section className="flex flex-col h-full justify-between gap-4">
        <div className="animate-pulse bg-foreground/10 h-[100cqh] min-h-[120px] aspect-auto w-full rounded-md" />
          <div className="absolute left-1/2 bottom-8 md:bottom-0 transform md:relative -translate-x-1/2 md:self-end md:flex md:justify-end md:w-full">
            <PaginationSkeleton />
          </div>
        </section>
      </GeneralCardLoading>
    );
  }

  if (error) {
    return <GeneralErrorContent className={`h-[570px]`} />;
  }

  return (
    <div
      className={`overflow-hidden flex flex-col relative rounded-2xl h-[570px] border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/3 sm:px-6`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center w-full justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Guías
          </h3>

          <div className="flex flex-row justify-end gap-3 items-center w-full">
            <ExpandableInput
              expandedSize={isMobile ? "150px" : "300px"}
              placeholder="Buscar por rastreo o usuario..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
      <div className="max-w-full flex-1 flex flex-col justify-between overflow-x-auto ">
        <Table className="h-full">
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-b">
            <TableRow>
              <TableCell className="py-3 min-w-44 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Rastreo
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Usuario
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Situación
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Fecha Creación
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Entrega Estimada
              </TableCell>
              <TableCell className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody
            isLoading={isFetching}
            className="divide-y divide-gray-100 dark:divide-gray-800 relative"
          >
            {data?.guias &&
              data.guias.length > 0 &&
              data.guias.map((guia) => (
                <TableRow
                  key={guia.id_guia}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                  onClick={() => router.push(`/admin/dashboard/guias/${guia.id_guia}`)}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {guia.numero_de_rastreo}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {guia.profile
                      ? `${guia.profile.nombre} ${guia.profile.apellido}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-center flex items-center justify-center text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        guia.situacion_actual === "entregado"
                          ? "success"
                          : guia.situacion_actual === "cancelado"
                          ? "error"
                          : "warning"
                      }
                    >
                      {guia.situacion_actual}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {new Date(guia.fecha_creacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {guia.fecha_entrega_estimada
                      ? new Date(guia.fecha_entrega_estimada).toLocaleDateString()
                      : "Pendiente"}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {guia.key_pdf && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openFile({
                            id: guia.numero_de_rastreo,
                            url: `/api/proxy-pdf?url=${encodeURIComponent(
                              `https://correos-storage.emmanuelbayona.dev/${guia.key_pdf}`
                            )}`,
                            name: `${guia.numero_de_rastreo}.pdf`,
                            fileType: "pdf",
                          });
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-white/10 transition-colors"
                        title="Ver PDF"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {data?.guias && data.guias.length === 0 && (
              <TableRow>
                <TableCell className=" absolute top-1/2 bottom-1/2 inset-0 col-span-6 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                  Sin guías disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-3 flex justify-center md:justify-end w-full md:pr-6">
        <Pagination
          currentPage={page}
          totalPages={data ? data.totalPages : 10}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
        />
      </div>
      </div>
  );
}
