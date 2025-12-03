"use client"
import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircleIcon,
  TimeIcon,
  DollarLineIcon,
  BoxCubeIcon,
} from "@/icons";
import NumberFlow from '@number-flow/react'
import { getProducts, getProductsById, getCustomersCountById, getOrdersCountById, getSalesDataById } from "@/actions/product";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { getUniqueBrands } from "@/actions/product";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "@/icons";
import { useQueries } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import { getOrders, getOrdersById } from "@/actions/orders";
import GeneralCardLoading from "@/components/ui/general/GeneralCardLoading";
import { GeneralErrorContent } from "@/components/ui/general/GeneralErrorContent";
import Pagination from "@/components/tables/Pagination";
import { PaginationSkeleton } from "@/components/ui/general/PaginationSkeleton";

import AddProductDialog from "@/components/products/AddProductDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectGroup, SelectValue } from "@/components/ui/select";
import ExpandableInput from "@/components/ui/expandable-input";
import { useDebounce } from "@/hooks/useDebounce";
import { useSidebar } from "@/context/SidebarContext";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";

import EditProductDialog from "@/components/products/EditProductDialog";
import DeleteProductDialog from "@/components/products/DeleteProductDialog";
import { ApexOptions } from "apexcharts";
import ChartTab from "@/components/common/ChartTab";
import dynamic from "next/dynamic";
import { getSalesData } from "@/actions/product";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,

});

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },

];

type StatusValue = typeof statusOptions[number]["value"];


interface Product {
  id: number;
  estado: boolean;
  inventario: number | null;
  vendidos: number;
}

interface MetricItem {
  id: number;
  key: keyof typeof metricsConfig;
  label: string;
  value: number;
}

type MetricConfig = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  subtitle: string;
};

const metricsConfig = {
  activos: {
    icon: CheckCircleIcon,
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    subtitle: "Productos disponibles",
  },
  pausados: {
    icon: TimeIcon,
    gradient: "from-amber-400 via-orange-500 to-red-500",
    subtitle: "En pausa",
  },
  vendidos: {
    icon: DollarLineIcon,
    gradient: "from-blue-400 via-indigo-500 to-violet-600",
    subtitle: "Total vendidos",
  },
  sinStock: {
    icon: BoxCubeIcon,
    gradient: "from-slate-400 via-gray-500 to-zinc-600",
    subtitle: "Requieren reabasto",
  },
} satisfies Record<string, MetricConfig>;

export default function SellerProfile() {
  const params = useParams();
  const id = Number(params.id);
  
  // All useState hooks at the top
  const [pageProducts] = useState(1);
  const [pageProductTable, setPageProductTable] = useState(1);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState<StatusValue>(statusOptions[0].value);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("yearly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [series, setSeries] = useState<{ name: string; data: number[] }[]>([
    { name: "Ventas", data: [] },
    { name: "Ingresos", data: [] },
  ]);
  const [categories, setCategories] = useState<string[]>([]);

  const { isMobile } = useSidebar();
  const debouncedSearch = useDebounce(search, 500);

  // All useQuery hooks
  const { data: productsData, isPending: isProductsPending, error: productsError } = useQuery({
    queryKey: ["products", id, pageProducts],
    queryFn: () => getProductsById({ sellerId: id, page: pageProducts }),
    placeholderData: keepPreviousData,
  });

  const { data: brands } = useQuery({
    queryKey: ["product-brands"],
    queryFn: getUniqueBrands,
  });

  const { data: productsTableData, error: productsTableError, isPending: isProductsTablePending, isFetching: isProductsTableFetching } = useQuery({
    queryKey: ["products", pageProductTable, debouncedSearch, brand, status],
    queryFn: () => getProductsById({ page: pageProductTable, search: debouncedSearch, brand, status, sellerId: id }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const { data: ordersData, error: ordersError, isPending: isOrdersPending } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => getOrdersById({ page, sellerId: id }),
    placeholderData: keepPreviousData,
  });

  const [customersCount, ordersCount] = useQueries({
    queries: [
      {
        queryKey: ["customers-count", id],
        queryFn: () => getCustomersCountById(id),
        staleTime: 30 * 1000,
      },
      {
        queryKey: ["orders-count", id],
        queryFn: () => getOrdersCountById(id),
        staleTime: 30 * 1000,
      }
    ],
  });

  const products: Product[] = productsData?.products ?? [];

  const metrics: MetricItem[] = useMemo(() => {
    if (!products.length) return [
      { id: 1, key: "activos", label: "Activos", value: 0 },
      { id: 2, key: "pausados", label: "Pausados", value: 0 },
      { id: 3, key: "vendidos", label: "Vendidos", value: 0 },
      { id: 4, key: "sinStock", label: "Sin stock", value: 0 },
    ];

    const activos = products.filter((p) => p.estado).length;
    const pausados = products.filter((p) => !p.estado).length;
    const vendidos = products.reduce((acc, p) => acc + (p.vendidos ?? 0), 0);
    const sinStock = products.filter((p) => (p.inventario ?? 0) <= 0).length;

    return [
      { id: 1, key: "activos", label: "Activos", value: activos },
      { id: 2, key: "pausados", label: "Pausados", value: pausados },
      { id: 3, key: "vendidos", label: "Vendidos", value: vendidos },
      { id: 4, key: "sinStock", label: "Sin stock", value: sinStock },
    ];
  }, [products]);

  // useEffect for sales data
  useEffect(() => {
    async function fetchData() {
      try {
        const { sales, revenue, categories } = await getSalesDataById(id, period, year, month);
        setSeries([
          { name: "Ventas", data: sales },
          { name: "Ingresos", data: revenue },
        ]);
        setCategories(categories);
      } catch (error) {
        console.error("Failed to fetch sales data", error);
      }
    }
    fetchData();
  }, [id, period, year, month]);

  // Derived state
  const isLoading = customersCount.isLoading || ordersCount.isLoading;
  const isError = customersCount.isError || ordersCount.isError;
  const isAnyPending = isOrdersPending || isProductsTablePending;
  const hasAnyError = productsError || ordersError || productsTableError || isError;

  const years = [
    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
    { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() },
  ];

  const months = [
    { value: "0", label: "Enero" },
    { value: "1", label: "Febrero" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Mayo" },
    { value: "5", label: "Junio" },
    { value: "6", label: "Julio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Septiembre" },
    { value: "9", label: "Octubre" },
    { value: "10", label: "Noviembre" },
    { value: "11", label: "Diciembre" },
  ];

  const cards = [
    {
      title: "Clientes",
      value: customersCount.data ?? 0,
      icon: GroupIcon,
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      badge: {
        color: "success",
        icon: ArrowUpIcon,
        value: "11.01%",
      },
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Pedidos",
      value: ordersCount.data ?? 0,
      icon: BoxIconLine,
      gradient: "from-blue-400 via-indigo-500 to-violet-600",
      badge: {
        color: "error",
        icon: ArrowDownIcon,
        value: "9.05%",
      },
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  // Unified loading state
  if (isAnyPending) {
    return (
      <div className="flex items-center justify-center h-[570px]">
        <Loader2Icon className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // Unified error state
  if (hasAnyError) {
    return <GeneralErrorContent className="h-[570px]" />;
  }

  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"], // Define line colors
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line", // Set the chart type to 'line'
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    stroke: {
      curve: "straight", // Define the line style (straight, smooth, or step)
      width: [2, 2], // Line width for each dataset
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      x: {
        format: "dd MMM yyyy", // Format for x-axis tooltip
      },
    },
    xaxis: {
      type: period === "monthly" && categories.length > 0 && categories[0].includes("-") ? "datetime" : "category", // Category-based x-axis
      categories: categories,
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
      labels: {
        format: "dd MMM",
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
      },
      title: {
        text: "", // Remove y-axis title
        style: {
          fontSize: "0px",
        },
      },
    },
  };



  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((item) => {
        const conf = metricsConfig[item.key];
        const Icon = conf.icon;

        return (
          <div
            key={item.id}
            className="
              relative rounded-2xl p-6 shadow-lg hover:shadow-xl
              transition-all duration-300 overflow-hidden border 
              bg-white border-slate-200
              dark:bg-white/3 dark:border-gray-800
            "
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-slate-600 dark:text-gray-400 text-sm mb-1">
                    {item.label}
                  </p>
                  <NumberFlow className="text-slate-900 dark:text-white/90 text-4xl font-semibold" value={item.value} />

                  {/* <p className="text-slate-900 dark:text-white/90 text-4xl font-semibold">
                    {item.value}
                  </p> */}
                </div>
                <div
                  className={`
                    bg-linear-to-br ${conf.gradient}
                    rounded-2xl shadow-lg
                    flex items-center justify-center w-14 h-14
                  `}
                >
                  {isProductsPending ? <Loader2Icon className="w-7 h-7 text-white animate-spin" /> : <Icon className="w-7 h-7 pl-0.5 pt-0.5 text-white" />}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-gray-500 text-xs">
                  {conf.subtitle}
                </p>

                <div
                  className={`w-12 h-1 bg-linear-to-r ${conf.gradient} rounded-full`}
                />
              </div>
            </div>
          </div>
        );
      })}
        </div>
      </div>

      <div className="col-span-12 space-y-6">
              {/* EcommerceMetrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="
              relative rounded-2xl p-6 shadow-lg hover:shadow-xl
              transition-all duration-300 overflow-hidden border

              bg-white border-gray-200  
              dark:bg-white/3 dark:border-gray-800
            "
          >
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {card.title}
                  </p>
                  <NumberFlow className={`text-4xl font-semibold mt-1 ${card.textColor}`} value={card.value ?? 0} />
                </div>

                <div
                  className={`
                    bg-linear-to-br ${card.gradient} flex items-center justify-center p-3 rounded-xl shadow-lg
                    dark:opacity-90
                  `}
                >
                  {isLoading ? <Loader2Icon className="w-7 h-7 text-white animate-spin" /> : <Icon className="size-7 pl-0.5 pt-0.5 text-white" />}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div
                  className={`
                    w-16 h-[3px] bg-linear-to-r ${card.gradient} rounded-full 
                    dark:opacity-90
                  `}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
            </div>
            
            <div className="col-span-12">
              {/* RecentOrders */}
              <div className="overflow-hidden shadow-lg  rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 h-[570px] flex flex-col">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                          Pedidos Recientes
                        </h3>
                      </div>
                    </div>
                    <div className="max-w-full overflow-x-auto flex-1">
                      <Table>
                        {/* Table Header */}
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                          <TableRow>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                              Productos
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                              Categoria
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                              Precio
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                              Estado
                            </TableCell>
                            <TableCell className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                              Fecha
                            </TableCell>
                          </TableRow>
                        </TableHeader>
              
                        {/* Table Body */}
              
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {ordersData?.orders.map((order) => (
                            <TableRow key={order.id} className="">
                              <TableCell className="py-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                                      {order.images && order.images.length > 0 ? (
                                      <Image
                                        src={order.images && order.images.length > 0 ? order.images[0].url : '/placeholder-image.png'}
                                        alt={order.producto}
                                        width={50}
                                        height={50}
                                        className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center text-gray-500"
                                      />
                                      ) : (
                                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                                          Img
                                      </div>
                                      )}
              
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                      {order.producto} 
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                {order.categoria}
                              </TableCell>
                              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                ${order.precio} 
                              </TableCell>
                              <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                <Badge
                                  size="sm"
                                  color={
                                    order.status === "Delivered"
                                      ? "success"
                                      : order.status === "Pending"
                                      ? "warning"
                                      : "error"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                                {order.fecha.toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          {ordersData?.orders.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                                  No recent orders found.
                                </TableCell>
                              </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
            </div>
            <div className="col-span-12">
              {/* ProductTable */}
                  <div className={`overflow-hidden shadow-lg flex flex-col relative rounded-2xl h-[570px] border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6`} >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center w-full justify-between">      
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                          Productos
                        </h3>
                        
                      <div className="flex flex-row  justify-end gap-3 items-center w-full">            
                          <ExpandableInput
                            expandedSize={isMobile ? "150px" : "300px"}
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                              setPage(1);
                            }}
                          />
                        {!isMobile ? ( 
                            <>
                          
                        <div className="w-full sm:w-1/4">
                          <Select
                            value={brand}
                            onValueChange={(value) => {
                              setBrand(value);
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="w-full dark:bg-dark-900">
                              <SelectValue placeholder="Filtrar por marca" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="all">Todas las marcas</SelectItem>
                                {brands &&
                                  brands.map((b) => (
                                    <SelectItem key={b} value={b}>
                                      {b}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
              
              
                          <Select
                            value={status}
                            onValueChange={(value) => {
                              setStatus(value as StatusValue);
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="w-40 dark:bg-dark-900">
                              <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                                    </>
              
                        ): (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <FilterIcon className="size-4 text-zinc-500"/>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="flex flex-col gap-3 p-2">
                            <Input
                            className="text-sm w-full h-9"
                              placeholder="Buscar..."
                              value={search}
                              onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                              }}
                            />
                            <Select
                              value={brand}
                              onValueChange={(value) => {
                                setBrand(value);
                                setPage(1);
                              }}
                            >
                              <SelectTrigger className="w-full dark:bg-dark-900">
                                <SelectValue placeholder="Filtrar por marca" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="all">Todas las marcas</SelectItem>
                                  {brands &&
                                    brands.map((b) => (
                                      <SelectItem key={b} value={b}>
                                        {b}
                                      </SelectItem>
                                    ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
              
                              <Select
                            value={status}
                            onValueChange={(value) => {
                              setStatus(value as StatusValue);
                              setPage(1);
                            }}
                          >
                            <SelectTrigger className="w-full dark:bg-dark-900">
                              <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          </PopoverContent>
                          </Popover>
                        )}
                        <AddProductDialog />
              
                      </div>
                      
                      </div>
                   
                    </div>
                    <div className="max-w-full flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-auto">
                      <Table className="h-full ">
                        {/* Table Header */}
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                          <TableRow>
                            <TableCell
                              
                              className="py-3 min-w-44 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                              Nombre
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            >
                              Marca
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            >
                              Precio
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                            >
                              Inventario
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-center text-gray-500  text-theme-xs dark:text-gray-400"
                            >
                              Estado
                            </TableCell>
                            <TableCell
                              className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                            >
                              Color
                            </TableCell>
                            <TableCell
                              
                              className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                            >
                              Pedidos
                            </TableCell>
                            <TableCell
                              className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                            >
                              Acciones
                            </TableCell>
                          </TableRow>
                        </TableHeader>
                          
                        <TableBody isLoading={isProductsTableFetching} className="divide-y divide-gray-100 dark:divide-gray-800 relative">
                          {productsTableData?.products && productsTableData.products.length > 0 && productsTableData.products.map((product) => (
                            <TableRow key={product.id} className="">
                              <TableCell className="py-3">
                                <div className="flex items-center gap-3">
                                  {product.images && product.images.length > 0 ? (
                                  <Image
                                    src={product.images && product.images.length > 0 ? product.images[0].url : '/placeholder-image.png'}
                                    alt={product.nombre}
                                    width={50}
                                    height={50}
                                    className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center text-gray-500"
                                  />
                                  ) : (
                                  <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                                     Img
                                  </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                      {product.nombre}
                                    </p>
                                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                                      {product.sku}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                {product.marca}
                              </TableCell>
                              <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                ${product.precio.toFixed(2)}
                              </TableCell>
                              <TableCell className="py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                {product.inventario}
                              </TableCell>
                              <TableCell className="pt-7 text-gray-500 text-center flex items-center justify-center text-theme-sm dark:text-gray-400">
                                <Badge
                                  size="sm"
                                  color={product.estado ? "success" : "error"}
                                >
                                  {product.estado ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 pl-10 text-end text-gray-500 text-theme-sm dark:text-gray-400">
                                <div className="w-full h-4 rounded-full" style={{ backgroundColor: product.color }} />
                              </TableCell>
                              <TableCell className="py-3 text-end text-gray-500 text-theme-sm dark:text-gray-400">
                                {product.pedidoProductosCount || 0}
                              </TableCell>
                              <TableCell className="py-3 text-end text-gray-500 text-theme-sm dark:text-gray-400">
                                <div className="flex items-center justify-end gap-2">
                                  <EditProductDialog product={product} />
                                  <DeleteProductDialog productId={product.id} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))} 
                          {
                            productsTableData?.products && productsTableData.products.length === 0 && (  
                              <TableRow>
                                <TableCell className=" absolute top-1/2 bottom-1/2 inset-0 col-span-7 text-center text-gray-500 text-theme-sm dark:text-gray-400">
                                  Sin productos disponibles
                                </TableCell>
                              </TableRow>
                            )
                          }
                        </TableBody>
                      </Table>
                      </div>
                      <div className="flex-none pt-4 pb-2 flex justify-center md:justify-end px-4">
                          <Pagination
                            currentPage={pageProductTable}
                            totalPages={productsTableData ? productsTableData.totalPages : 10}
                            onPageChange={(newPage) => {  
                              setPage(newPage);
                            }}
                          />
                      </div>
                          
                    </div>
                  </div>

            </div>
            <div className="col-span-12">
              {/* StatisticsChart */}
                  <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
                    <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
                      <div className="w-full">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                          Estadísticas
                        </h3>
                        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                          Resumen de ventas e ingresos
                        </p>
                      </div>
                      <div className="flex items-center w-full gap-3 sm:justify-end flex-wrap">
                        {period !== "weekly" && (
                          <div className="w-full sm:w-32">
                            <Select
                              defaultValue={year.toString()}
                              onValueChange={(val) => setYear(Number(val))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {years.map((y) => (
                                    <SelectItem key={y.value} value={y.value}>
                                      {y.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {period === "monthly" && (
                          <div className="w-full sm:w-40">
                            <Select
                              defaultValue={month.toString()}
                              onValueChange={(val) => setMonth(Number(val))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {months.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                      {m.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <ChartTab selected={period} onChange={setPeriod} />
                      </div>
                    </div>
              
                    <div className="max-w-full overflow-x-auto custom-scrollbar">
                      <div className="min-w-full">
                        <ReactApexChart
                          options={options}
                          series={series}
                          type="area"
              
                          height={310}
                        />
                      </div>
                    </div>
                  </div>
            </div>
    </div>
    
  );

}
