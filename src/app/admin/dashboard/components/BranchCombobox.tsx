"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Sucursal {
  claveCuo: string;
  nombreCuo: string;
  nombreEntidad: string;
}

interface BranchComboboxProps {
  sucursales: Sucursal[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function BranchCombobox({
  sucursales,
  value,
  onChange,
  disabled,
}: BranchComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSucursal = sucursales.find((s) => s.claveCuo === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {selectedSucursal
            ? selectedSucursal.nombreCuo
            : "Seleccionar sucursal..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar sucursal..." />
          <CommandList>
            <CommandEmpty>No se encontró la sucursal.</CommandEmpty>
            <CommandGroup>
              {sucursales.map((sucursal) => (
                <CommandItem
                  key={sucursal.claveCuo}
                  value={sucursal.nombreCuo}
                  onSelect={() => {
                    onChange(sucursal.claveCuo);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === sucursal.claveCuo ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {sucursal.nombreCuo}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({sucursal.nombreEntidad})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
