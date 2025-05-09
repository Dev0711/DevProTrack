import React, { useState, useContext } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { repositoryAPI } from "../../services/api";
import { Menu, ChevronLeft, LayoutDashboard, Code, Settings, LogOut, User, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [syncingData, setSyncingData] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const handleSyncData = async () => {
    try {
      setSyncingData(true);
      await repositoryAPI.syncAll();
      setSyncingData(false);
    } catch (error) {
      console.error("Error syncing data:", error);
      setSyncingData(false);
    }
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      text: "Repositories",
      icon: <Code size={20} />,
      path: "/repositories",
    },
    {
      text: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-background border-r border-border h-screen fixed top-0 left-0 z-30`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {sidebarOpen && <h1 className="text-lg font-semibold">DevProTrack</h1>}
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-accent">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.text}>
                <Link
                  to={item.path}
                  className={`flex items-center ${sidebarOpen ? "px-4" : "justify-center px-2"} py-2 rounded-md ${
                    location.pathname === item.path ? "bg-primary/10 text-primary" : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {sidebarOpen && <span>{item.text}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-background">
          <div className="flex items-center">
            <h2 className="text-lg font-medium">{menuItems.find((item) => item.path === location.pathname)?.text || "DevProTrack"}</h2>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center" onClick={handleSyncData} disabled={syncingData}>
              <RefreshCw size={16} className={`mr-2 ${syncingData ? "animate-spin" : ""}`} />
              Sync Data
            </Button>

            <div className="relative">
              <Button onClick={toggleUserMenu} variant="ghost" size="sm" className="flex items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {currentUser?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="ml-2">{currentUser?.username}</span>
                </div>
              </Button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-background border border-border rounded-md shadow-lg z-40">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent text-destructive" onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-background/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
