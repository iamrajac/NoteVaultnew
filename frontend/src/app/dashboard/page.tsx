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
      // Select best default workspace
      if (parsedUser.workspaces && parsedUser.workspaces.length > 0) {
        setActiveWorkspace(parsedUser.workspaces[0].workspace);
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
            { id: "Dashboard", icon: LayoutDashboard, active: true },
            { id: "Projects", icon: FolderKanban },
            { id: "Tasks", icon: CheckSquare, badge: "8" },
            { id: "Team", icon: Users },
            { id: "Settings", icon: Settings },
            { id: "Changelog", icon: History },
          ].map((item) => {
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
            <h1 className="text-2xl font-bold tracking-tight">{activeWorkspace ? activeWorkspace.name : "Dashboard"}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user.name}!</p>
          </div>
          
          <div className="flex items-center space-x-4">
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

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Projects</h3>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <FolderKanban className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">12</span>
              <span className="text-xs font-medium text-emerald-500">+2 this week</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</h3>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">48</span>
              <span className="text-xs font-medium text-slate-400">85% completion</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-3xl border border-red-200 bg-gradient-to-br from-white to-red-50/50 p-6 shadow-sm dark:border-red-900/30 dark:from-slate-800/50 dark:to-red-900/10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue Tasks</h3>
              <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                <Settings className="h-4 w-4" /> {/* Just placeholder icon */}
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">3</span>
              <span className="text-xs font-medium text-red-500">Action needed</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Team Members</h3>
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-medium dark:border-slate-800 dark:bg-slate-700">
                    U{i}
                  </div>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-500">+5</span>
            </div>
          </motion.div>
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Tasks Context */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Task List */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-800/50">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold">Assigned to Me</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">View all</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                      <th className="pb-3 pl-2 pr-4 font-medium"><CheckSquare className="h-4 w-4" /></th>
                      <th className="pb-3 pr-4 font-medium">Task Name</th>
                      <th className="pb-3 pr-4 font-medium">Project</th>
                      <th className="pb-3 pr-4 font-medium">Due Date</th>
                      <th className="pb-3 pr-4 font-medium">Priority</th>
                      <th className="pb-3 pr-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { task: "Q3 Marketing Plan", project: "Marketing", due: "Today", prio: "High", status: "In Progress" },
                      { task: "API Integration", project: "Engineering", due: "Tomorrow", prio: "Medium", status: "Pending" },
                      { task: "Client Presentation", project: "Sales", due: "Oct 24", prio: "High", status: "Done" },
                      { task: "Database Migration", project: "Engineering", due: "Oct 25", prio: "Critical", status: "In Progress" },
                    ].map((row, i) => (
                      <tr key={i} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 pl-2 pr-4">
                          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked={row.status === "Done"} />
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">{row.task}</td>
                        <td className="py-3 pr-4 text-slate-500">{row.project}</td>
                        <td className="py-3 pr-4 text-slate-500">{row.due}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                            row.prio === "High" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                            row.prio === "Medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                            "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                          }`}>
                            {row.prio}
                          </span>
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide border ${
                            row.status === "Done" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400" :
                            row.status === "In Progress" ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400" :
                            "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full content-[''] ${
                              row.status === "Done" ? "bg-emerald-500" : 
                              row.status === "In Progress" ? "bg-blue-500" : "bg-slate-400"
                            }`}></span>
                            <span>{row.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions / Project Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Website Redesign</h3>
                <p className="mb-4 text-xs text-slate-500">12 tasks remaining</p>
                <div className="flex items-center space-x-3">
                  <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: "75%" }}></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">75%</span>
                </div>
              </div>

              <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="mb-1 text-base font-bold text-slate-900 dark:text-white">Mobile App Launch</h3>
                <p className="mb-4 text-xs text-slate-500">42 tasks remaining</p>
                <div className="flex items-center space-x-3">
                  <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-purple-600" style={{ width: "30%" }}></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">30%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar context */}
          <div className="space-y-8">
            
            {/* Activity Feed */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
              <h2 className="mb-6 text-lg font-bold">Activity Feed</h2>
              <div className="space-y-6">
                
                {[
                  { user: "Rohith", action: "updated the", target: "Q3 Roadmap", time: "10 minutes ago", color: "bg-blue-500" },
                  { user: "Raja", action: "commented on", target: "Design Review", time: "1 hour ago", color: "bg-slate-500", extract: `"Looks great! Just check the padding on mobile."` },
                  { user: "Project Y", action: "created by", target: "Suhas", time: "2 hours ago", color: "bg-emerald-500" },
                  { user: "Dev Team", action: "merged PR", target: "#402", time: "4 hours ago", color: "bg-purple-500" },
                ].map((act, i) => (
                  <div key={i} className="relative flex space-x-4 pl-2">
                    {/* Visual Connector */}
                    {i !== 3 && <div className="absolute left-3.5 top-6 h-full w-[2px] bg-slate-100 dark:bg-slate-800/80"></div>}
                    
                    <div className="relative mt-1">
                      <div className={`h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900 ${act.color}`}></div>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold text-slate-900 dark:text-white">{act.user}</span>{" "}
                        <span className="text-slate-500">{act.action}</span>{" "}
                        <span className="font-medium text-blue-600 dark:text-blue-400">{act.target}</span>
                      </p>
                      {act.extract && (
                        <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs italic text-slate-600 dark:bg-slate-800/80 dark:text-slate-400">
                          {act.extract}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-slate-400">{act.time}</p>
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold">Deadlines</h2>
                <button className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">View Calendar</button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/50 p-4 dark:border-orange-900/30 dark:bg-orange-900/10">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                       <History className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Q3 Financials</p>
                      <p className="text-xs text-slate-500">Finance Team</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">2h left</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-800/30">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                       <History className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Blog Post Draft</p>
                      <p className="text-xs text-slate-500">Content</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500">5h left</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
