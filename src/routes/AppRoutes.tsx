import { LayoutGrid, Package, Tags, Tag, CalendarDays, Layers, FileText } from "lucide-react";
import { type RouteObject } from "react-router-dom";
import Dashboard from "@/modules/Dashboard/Dashboard";
import ProductList from "@/modules/Products/ProductList";
import ProductCreate from "@/modules/Products/ProductCreate";
import ProductView from "@/modules/Products/ProductView";
import CategoryList from "@/modules/Categories/CategoryList";
import CategoryCreate from "@/modules/Categories/CategoryCreate";
import CategoryView from "@/modules/Categories/CategoryView";
import TagList from "@/modules/Tags/TagList";
import OccasionList from "@/modules/Occasions/OccasionList";
import MaterialList from "@/modules/Materials/MaterialList";
import BlogList from "@/modules/Blogs/BlogList";
import BlogCreate from "@/modules/Blogs/BlogCreate";
import BlogView from "@/modules/Blogs/BlogView";

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
  {
    icon: <Tag size={20} />,
    path: "/tags",
    element: <TagList />,
  },
  {
    icon: <CalendarDays size={20} />,
    path: "/occasions",
    element: <OccasionList />,
  },
  {
    icon: <Layers size={20} />,
    path: "/materials",
    element: <MaterialList />,
  },
  {
    icon: <FileText size={20} />,
    path: "/blogs",
    element: <BlogList />,
  },
  {
    path: "/blogs/create",
    element: <BlogCreate />,
  },
  {
    path: "/blogs/:id",
    element: <BlogView />,
  },
  {
    path: "/blogs/:id/edit",
    element: <BlogCreate />,
  },
];

export const AppRoutes: AppRoutesProps[] = [
  ...MAIN_ITEMS,
  { path: "*", element: <div className="p-8 text-center">Page not found</div> },
];
