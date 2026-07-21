import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { publicRoutes } from "./PublicRoutes";
import { AppRoutes, type AppRoutesProps } from "./AppRoutes";
import AppLayout from "./AppLayout";
import { Suspense, useEffect, useState } from "react";
import PublicLayout from "./PublicLayout";
import ProtectedRoute from "./ProtectedRoute";
// export const renderRoutes = (routes: RouteObject[]) => {
//   return routes.map((route, index) => {
//     const { path, element, children } = route;

//     return (
//       <Route key={index} path={path} element={element}>
//         {children && renderRoutes(children)}
//       </Route>
//     );
//   });
// };
export const renderRoutes = (routes: AppRoutesProps[]) => {
  return routes.map((route, index) => {
    const { path, element, children } = route;

    if (children && children.length > 0) {
      return (
        <Route key={index} path={path} element={element ?? <Outlet />}>
          <Route
            index
            element={<Navigate to={children[0].path as string} replace />}
          />
          {renderRoutes(children as AppRoutesProps[])}
        </Route>
      );
    }

    return <Route key={index} path={path} element={element} />;
  });
};
const Router = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access_token"));

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(!!localStorage.getItem("access_token"));
    };

    syncAuthState();
    window.addEventListener("auth:changed", syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener("auth:changed", syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Suspense fallback="Public Loading...">
                <Outlet />
              </Suspense>
            </PublicLayout>
          }
        >
          {renderRoutes(publicRoutes)}
        </Route>

        {/* PROTECTED */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAllowed={isLoggedIn}>
              <AppLayout>
                <Suspense fallback="Public Loading...">
                  <Outlet />
                </Suspense>
              </AppLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          {renderRoutes(AppRoutes)}
        </Route>

        <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
