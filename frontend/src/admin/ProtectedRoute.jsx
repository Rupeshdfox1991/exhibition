import { Navigate } from "react-router-dom";
import { auth } from "./api";

export default function ProtectedRoute({ children }) {
  return auth.isAuthed() ? children : <Navigate to="/admin/login" replace />;
}
