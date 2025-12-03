"use client";

import { updateVehicle } from "@/actions/vehicles";
import Label from "@/components/form/Label";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { BranchCombobox } from "./BranchCombobox";

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

interface EditVehicleDialogProps {
  vehicle: VehicleData;
  sucursales: Sucursal[];
  tiposVehiculos: TipoVehiculo[];
  conductores: Conductor[];
  className?: string;
}

export default function EditVehicleDialog({
  vehicle,
  sucursales,
  tiposVehiculos,
  conductores,
  className,
}: EditVehicleDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateVehicle(vehicle.id, formData);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Vehículo actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el vehículo");
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
            <DialogTitle>Editar vehículo</DialogTitle>
            <DialogDescription>
              Modifica los detalles del vehículo.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            vehicle={vehicle}
            handleSubmit={handleSubmit}
            sucursales={sucursales}
            tiposVehiculos={tiposVehiculos}
            conductores={conductores}
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
          <DrawerTitle>Editar vehículo</DrawerTitle>
          <DrawerDescription>
            Modifica los detalles del vehículo.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto">
          <VehicleForm
            vehicle={vehicle}
            handleSubmit={handleSubmit}
            sucursales={sucursales}
            tiposVehiculos={tiposVehiculos}
            conductores={conductores}
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

function VehicleForm({
  vehicle,
  handleSubmit,
  sucursales,
  tiposVehiculos,
  conductores,
  mutation,
  onCancel,
  className,
}: {
  vehicle: VehicleData;
  handleSubmit: (formData: FormData) => void;
  sucursales: Sucursal[];
  tiposVehiculos: TipoVehiculo[];
  conductores: Conductor[];
  mutation: any;
  onCancel: () => void;
  className?: string;
}) {
  // Find the initial sucursal ID based on the name (since VehicleData only has name)
  // Wait, VehicleData in VehiclesTable only has sucursal name, not ID.
  // I need to update VehiclesTable to fetch sucursal ID (claveCuo) as well.
  // Let's assume I'll fix VehiclesTable to include claveCuo.
  // For now, I'll try to find it by name or default to empty.
  
  const initialSucursal = vehicle.sucursal.claveCuo || sucursales.find(s => s.nombreCuo === vehicle.sucursal.nombreCuo)?.claveCuo || "";
  const [selectedSucursal, setSelectedSucursal] = useState<string>(initialSucursal);

  const initialTipo = tiposVehiculos.find(t => t.tipoVehiculo === vehicle.tipoVehiculo)?.id.toString() || "";
  const initialConductor = vehicle.conductor?.curp || "unassigned";

  return (
    <form action={handleSubmit} className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="placas">Placas</Label>
          <Input
            type="text"
            name="placas"
            id="placas"
            defaultValue={vehicle.placas}
            placeholder="Placas del vehículo"
            required
          />
        </div>

        <div>
          <Label htmlFor="tarjetaCirculacion">Tarjeta de Circulación</Label>
          <Input
            type="text"
            name="tarjetaCirculacion"
            id="tarjetaCirculacion"
            defaultValue={vehicle.tarjetaCirculacion}
            placeholder="Número de tarjeta"
            required
          />
        </div>

        <div>
          <Label htmlFor="volumenCarga">Volumen de Carga (m³)</Label>
          <Input
            type="number"
            step="0.01"
            name="volumenCarga"
            id="volumenCarga"
            defaultValue={vehicle.volumenCarga}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="numEjes">Número de Ejes</Label>
          <Input
            type="number"
            name="numEjes"
            id="numEjes"
            defaultValue={vehicle.numEjes}
            placeholder="0"
            required
          />
        </div>

        <div>
          <Label htmlFor="numLlantas">Número de Llantas</Label>
          <Input
            type="number"
            name="numLlantas"
            id="numLlantas"
            defaultValue={vehicle.numLlantas}
            placeholder="0"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipoVehiculoId">Tipo de Vehículo</Label>
          <Select name="tipoVehiculoId" defaultValue={initialTipo} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposVehiculos.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id.toString()}>
                  {tipo.tipoVehiculo} ({tipo.capacidadKg}kg)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="curpConductor">Conductor</Label>
          <Select name="curpConductor" defaultValue={initialConductor} disabled={!selectedSucursal}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedSucursal ? "Seleccionar conductor" : "Seleccione una sucursal primero"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {conductores
                .filter((c) => c.claveOficina === selectedSucursal)
                .map((conductor) => {
                  const isCurrentDriver = conductor.curp === initialConductor;
                  const isAvailable = conductor.disponibilidad || isCurrentDriver;
                  
                  return (
                    <SelectItem 
                      key={conductor.id} 
                      value={conductor.curp}
                      disabled={!isAvailable}
                      className="w-full"
                    >
                      <div className="flex w-full items-center justify-between gap-2 min-w-[200px]">
                        <span>{conductor.nombreCompleto}</span>
                        {!isAvailable && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="pointer-events-auto cursor-help">
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Conductor no disponible</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
          {!selectedSucursal && (
            <p className="text-xs text-muted-foreground mt-1">
              Selecciona una sucursal para ver los conductores disponibles.
            </p>
          )}
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
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" defaultValue={vehicle.estado}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="en_ruta">En Ruta</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
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
