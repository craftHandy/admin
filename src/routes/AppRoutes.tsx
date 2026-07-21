import { LayoutGrid, Package, Tags } from "lucide-react";
import { type RouteObject } from "react-router-dom";
import Dashboard from "@/modules/Dashboard/Dashboard";
import ProductList from "@/modules/Products/ProductList";
import ProductCreate from "@/modules/Products/ProductCreate";
import ProductView from "@/modules/Products/ProductView";
import CategoryList from "@/modules/Categories/CategoryList";
import CategoryCreate from "@/modules/Categories/CategoryCreate";
import CategoryView from "@/modules/Categories/CategoryView";

export type AppRoutesProps = RouteObject & {
  icon?: React.ReactNode;
};

const MAIN_ITEMS: AppRoutesProps[] = [
  {
    icon: <LayoutGrid size={20} />,
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    icon: <Package size={20} />,
    path: "/products",
    element: <ProductList />,
  },
  {
    path: "/products/create",
    element: <ProductCreate />,
  },
  {
    path: "/products/:id",
    element: <ProductView />,
  },
  {
    path: "/products/:id/edit",
    element: <ProductView />,
  },
  {
    icon: <Tags size={20} />,
    path: "/categories",
    element: <CategoryList />,
  },
  {
    path: "/categories/create",
    element: <CategoryCreate />,
  },
  {
    path: "/categories/:id",
    element: <CategoryView />,
  },
  {
    path: "/categories/:id/edit",
    element: <CategoryCreate />,
  },
];

export const AppRoutes: AppRoutesProps[] = [
  ...MAIN_ITEMS,
  { path: "*", element: <div className="p-8 text-center">Page not found</div> },
];
