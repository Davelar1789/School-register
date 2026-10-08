import { Navigate, useLocation } from "react-router-dom";
import { decodeToken, getToken, homePathFor, isExpired, loginPathFor } from "../../utils/auth";

/**
 * Guards a branch of the route tree.
 *  - no / malformed token  → the matching login screen
 *  - expired token (online) → login again (offline teachers keep working from cache)
 *  - wrong role             → that user's own home screen
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = getToken();
  const decoded = decodeToken(token);
  const fallbackLogin = loginPathFor(allowedRoles[0]);

  if (!token || !decoded) {
    return <Navigate to={fallbackLogin} replace state={{ from: location.pathname }} />;
  }

  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  if (isExpired(decoded) && online) {
    return <Navigate to={fallbackLogin} replace state={{ from: location.pathname, expired: true }} />;
  }

  if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
    return <Navigate to={homePathFor(decoded.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
