import { Navigate } from "react-router-dom"

export type ProtectedRouteProps={
    isAllowed:boolean
    redirectTo?:string
    children:React.ReactNode
}
const ProtectedRoute = ({children, isAllowed,redirectTo="/login"}:ProtectedRouteProps) => {
    console.log(isAllowed,'allowed')
    if(!isAllowed) return <Navigate to={redirectTo} replace/>
  return (
    <>
    {children}
    </>
  )
}

export default ProtectedRoute
