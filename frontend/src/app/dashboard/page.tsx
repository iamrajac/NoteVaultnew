"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Search, Bell, Plus, LayoutDashboard, FolderKanban, 
  CheckSquare, Users, Settings, History, 
  MoreHorizontal, Smartphone, Laptop, LogOut
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("nv_token");
    const storedUser = localStorage.getItem("nv_user");
    
    if (!token || !storedUser) {
      router.push("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      const ws = parsedUser.workspaces || [];
      setAvailableWorkspaces(ws);
      if (ws.length > 0) {
        setActiveWorkspace(ws[0].workspace);
      }
    } catch (err) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("nv_token");
    localStorage.removeItem("nv_user");
    router.push("/");
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    const membership = availableWorkspaces.find(
      (m: any) => m.workspace && m.workspace.id === workspaceId
    );
    if (membership && membership.workspace) {
      setActiveWorkspace(membership.workspace);
    }
  };

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading Workspace...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100 md:flex-row">
      {/* Sidebar */}
      <aside className="border-b bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:w-64 md:border-b-0 md:border-r md:p-6">
        <div className="mb-8 flex items-center space-x-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">NoteVault</span>
        </div>

        <nav className="space-y-1">
          {[
            { id: "Dashboard", icon: LayoutDashboard, active: true, roles: ["Admin", "Team Lead", "Employee"] },
            { id: "Projects", icon: FolderKanban, roles: ["Admin", "Team Lead", "Employee"] },
            { id: "Tasks", icon: CheckSquare, badge: "8", roles: ["Admin", "Team Lead", "Employee"] },
            { id: "Team", icon: Users, roles: ["Admin", "Team Lead"] },
            { id: "Settings", icon: Settings, roles: ["Admin"] },
            { id: "Changelog", icon: History, roles: ["Admin", "Team Lead"] },
          ]
            .filter((item) => !user || !item.roles || item.roles.includes(user.role))
            .map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href="#"
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  item.active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${item.active ? "text-blue-700 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                  <span>{item.id}</span>
                </div>
                {item.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="mt-auto hidden pt-8 md:block">
          <div className="flex items-center space-x-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 ring-4 ring-white dark:bg-orange-900/30 dark:text-orange-400 dark:ring-slate-900">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {activeWorkspace ? activeWorkspace.name : "Dashboard"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user.role} dashboard • Welcome back, {user.name}!
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {availableWorkspaces.length > 1 && (
              <div className="hidden items-center space-x-2 rounded-2xl bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 md:flex">
                <span className="text-slate-500 dark:text-slate-400">Workspace</span>
                <select
                  value={activeWorkspace?.id || ""}
                  onChange={(e) => handleWorkspaceChange(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-900 outline-none dark:text-slate-100"
                >
                  {availableWorkspaces.map((m: any) => (
                    <option key={m.workspace.id} value={m.workspace.id}>
                      {m.workspace.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full rounded-2xl border-none bg-white py-2 pl-10 pr-4 text-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:ring-slate-700 dark:focus:ring-blue-500"
              />
            </div>
            <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50 dark:ring-slate-900"></span>
              <Bell className="h-5 w-5" />
            </button>
            <button className="flex items-center space-x-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95">
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* Stats Grid - will show real data when features are implemented */}
        <div className="mb-8 rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          Workspace data will appear here once projects, tasks, and team data are created.
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Tasks Context */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Task List placeholder */}
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              No tasks have been created yet. Tasks assigned to you from the database will appear here.
            </div>

          </div>

          {/* Right Sidebar context */}
          <div className="space-y-8">
            
            {/* Activity Feed placeholder */}
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              Recent workspace activity from the database will be shown here.
            </div>

            {/* Upcoming Deadlines placeholder */}
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              Upcoming deadlines and milestones will appear here once they are created.
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
