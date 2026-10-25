import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = "text-slate-700 hover:text-indigo-600";

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-indigo-600 text-lg">
          RGPV Notes Hub
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/upload" className={linkClass}>
                Upload
              </Link>
              <Link to="/my-uploads" className={linkClass}>
                My uploads
              </Link>
              {user.role === "admin" && (
                <Link to="/admin" className={linkClass}>
                  Admin
                </Link>
              )}
              <span className="text-slate-500 hidden sm:inline">
                Hi, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
