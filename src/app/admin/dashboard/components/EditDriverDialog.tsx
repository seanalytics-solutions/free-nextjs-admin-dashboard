"use client";

import { updateConductor, ConductorData, getVehiculosDisponibles } from "@/actions/drivers";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { PencilIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BranchCombobox } from "./BranchCombobox";

interface Sucursal {
  claveCuo: string;
  nombreCuo: string;
  nombreEntidad: string;
}

interface EditDriverDialogProps {
  driver: ConductorData;
  sucursales: Sucursal[];
  className?: string;
}

export default function EditDriverDialog({
  driver,
  sucursales,
  className,
}: EditDriverDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateConductor(driver.id, formData);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Conductor actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el conductor");
    },
  });

  const handleSubmit = (formData: FormData) => {
    mutation.mutate(formData);
  };

  if (isDesktop) {
    return (
      <Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={() => setIsModalOpen(true)}
          >
            <PencilIcon className="size-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar conductor</DialogTitle>
            <DialogDescription>
              Modifica los detalles del conductor.
            </DialogDescription>
          </DialogHeader>
          <DriverForm
            driver={driver}
            handleSubmit={handleSubmit}
            sucursales={sucursales}
            mutation={mutation}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          onClick={() => setIsModalOpen(true)}
        >
          <PencilIcon className="size-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="!max-h-[90dvh] !h-[90dvh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Editar conductor</DrawerTitle>
          <DrawerDescription>
            Modifica los detalles del conductor.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto">
          <DriverForm
            driver={driver}
            handleSubmit={handleSubmit}
            sucursales={sucursales}
            mutation={mutation}
            onCancel={() => setIsModalOpen(false)}
            className="pb-4"
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DriverForm({
  driver,
  handleSubmit,
  sucursales,
  mutation,
  onCancel,
  className,
}: {
  driver: ConductorData;
  handleSubmit: (formData: FormData) => void;
  sucursales: Sucursal[];
  mutation: any;
  onCancel: () => void;
  className?: string;
}) {
  const [selectedSucursal, setSelectedSucursal] = useState<string>(driver.sucursal.claveCuo);
  const currentVehicleId = driver.unidades.length > 0 ? driver.unidades[0].id.toString() : "unassigned";

  const { data: vehiculos = [] } = useQuery({
    queryKey: ["vehiculosDisponibles", selectedSucursal, driver.curp],
    queryFn: () => getVehiculosDisponibles(selectedSucursal, driver.curp),
    enabled: !!selectedSucursal,
  });

  return (
    <form action={handleSubmit} className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="nombreCompleto">Nombre Completo</Label>
          <Input
            type="text"
            name="nombreCompleto"
            id="nombreCompleto"
            defaultValue={driver.nombreCompleto}
            placeholder="Nombre completo del conductor"
            required
          />
        </div>

        <div>
          <Label htmlFor="curp">CURP</Label>
          <Input
            type="text"
            name="curp"
            id="curp"
            defaultValue={driver.curp}
            placeholder="CURP"
            required
          />
        </div>

        <div>
          <Label htmlFor="rfc">RFC</Label>
          <Input
            type="text"
            name="rfc"
            id="rfc"
            defaultValue={driver.rfc}
            placeholder="RFC"
            required
          />
        </div>

        <div>
          <Label htmlFor="licencia">Licencia</Label>
          <Input
            type="text"
            name="licencia"
            id="licencia"
            defaultValue={driver.licencia}
            placeholder="Número de licencia"
            required
          />
        </div>

        <div>
          <Label htmlFor="licenciaVigente">Licencia Vigente</Label>
          <Select
            name="licenciaVigente"
            defaultValue={driver.licenciaVigente ? "true" : "false"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Vigente</SelectItem>
              <SelectItem value="false">Vencida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            type="tel"
            name="telefono"
            id="telefono"
            defaultValue={driver.telefono}
            placeholder="Número de teléfono"
            required
          />
        </div>

        <div>
          <Label htmlFor="correo">Correo Electrónico</Label>
          <Input
            type="email"
            name="correo"
            id="correo"
            defaultValue={driver.correo}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="claveOficina">Sucursal</Label>
          <input type="hidden" name="claveOficina" value={selectedSucursal} />
          <BranchCombobox 
            sucursales={sucursales} 
            value={selectedSucursal} 
            onChange={setSelectedSucursal} 
          />
        </div>

        <div>
          <Label htmlFor="vehiculoId">Vehículo Asignado</Label>
          <Select name="vehiculoId" defaultValue={currentVehicleId} disabled={!selectedSucursal}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedSucursal ? "Seleccionar vehículo" : "Selecciona una sucursal primero"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {vehiculos.map((vehiculo) => (
                <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                  {vehiculo.placas} - {vehiculo.tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="disponibilidad">Disponibilidad</Label>
          <Select
            name="disponibilidad"
            defaultValue={driver.disponibilidad ? "true" : "false"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Disponible</SelectItem>
              <SelectItem value="false">No Disponible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          loading={mutation.isPending}
          disabled={mutation.isPending || !selectedSucursal}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
