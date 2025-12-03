"use client";

import { createVehicle } from "@/actions/vehicles";
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
import { Plus } from "lucide-react";
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

interface AddVehicleDialogProps {
  sucursales: Sucursal[];
  tiposVehiculos: TipoVehiculo[];
  conductores: Conductor[];
  className?: string;
}

export default function AddVehicleDialog({
  sucursales,
  tiposVehiculos,
  conductores,
  className,
}: AddVehicleDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createVehicle(formData);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Vehículo creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el vehículo");
    },
  });

  const handleSubmit = (formData: FormData) => {
    mutation.mutate(formData);
  };

  if (isDesktop) {
    return (
      <Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
        <DialogTrigger asChild>
          <Button className={className} onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Vehículo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar vehículo</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del nuevo vehículo.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
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
        <Button className={className} onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Vehículo
        </Button>
      </DrawerTrigger>
      <DrawerContent className="!max-h-[90dvh] !h-[90dvh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Agregar vehículo</DrawerTitle>
          <DrawerDescription>
            Ingresa los detalles del nuevo vehículo.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto">
          <VehicleForm
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
  handleSubmit,
  sucursales,
  tiposVehiculos,
  conductores,
  mutation,
  onCancel,
  className,
}: {
  handleSubmit: (formData: FormData) => void;
  sucursales: Sucursal[];
  tiposVehiculos: TipoVehiculo[];
  conductores: Conductor[];
  mutation: any;
  onCancel: () => void;
  className?: string;
}) {
  const [selectedSucursal, setSelectedSucursal] = useState<string>("");

  return (
    <form action={handleSubmit} className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="placas">Placas</Label>
          <Input
            type="text"
            name="placas"
            id="placas"
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
            placeholder="Número de tarjeta"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipoVehiculoId">Tipo de Vehículo</Label>
          <Select name="tipoVehiculoId" required>
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
          <Select name="curpConductor" disabled={!selectedSucursal}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedSucursal ? "Seleccionar conductor" : "Seleccione una sucursal primero"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Sin asignar</SelectItem>
              {conductores
                .filter((c) => c.claveOficina === selectedSucursal)
                .map((conductor) => {
                  const isAvailable = conductor.disponibilidad;
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
          <Label htmlFor="volumenCarga">Volumen de Carga (m³)</Label>
          <Input
            type="number"
            name="volumenCarga"
            id="volumenCarga"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>

        <div>
          <Label htmlFor="numEjes">Número de Ejes</Label>
          <Input
            type="number"
            name="numEjes"
            id="numEjes"
            placeholder="2"
            required
          />
        </div>

        <div>
          <Label htmlFor="numLlantas">Número de Llantas</Label>
          <Input
            type="number"
            name="numLlantas"
            id="numLlantas"
            placeholder="4"
            required
          />
        </div>

        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select name="estado" defaultValue="disponible">
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
          {mutation.isPending ? "Guardando..." : "Guardar Vehículo"}
        </Button>
      </div>
    </form>
  );
}
