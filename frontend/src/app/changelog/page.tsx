"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  GitCommit, GitMerge, GitPullRequest, Search, Play, StopCircle, 
  CheckCircle2, XCircle, Clock, Server, Activity, Terminal, Code2, 
  Box, Eye, MoreHorizontal
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function ChangelogPage() {
  const releases = [
    {
      id: "rel-4.2.1",
      version: "v4.2.1",
      title: "Authentication Hardening & RBAC Overhaul",
      date: "Oct 24, 2023",
      status: "Deployed",
      env: "Production",
      coverage: "94.2%",
      hash: "a8d29f1",
      author: "Suhas Thammysetty",
      authorImage: "U",
      pipelines: [
        { name: "Linting & Typecheck", duration: "1m 12s", status: "success" },
        { name: "Unit & Integration Tests", duration: "4m 05s", status: "success" },
        { name: "E2E Cypress Suite", duration: "8m 42s", status: "success" },
        { name: "Docker Image Build", duration: "2m 15s", status: "success" }
      ],
      commits: [
         { msg: "feat(auth): implement aggressive JWT rotation strategy", hash: "a8d29f1" },
         { msg: "fix(rbac): resolve privilege escalation vulnerability", hash: "b7e40c2" }
      ]
    },
    {
      id: "rel-4.2.2-rc",
      version: "v4.2.2-rc.1",
      title: "Real-time Collaboration Engine Alpha",
      date: "Today, 10:45 AM",
      status: "Building",
      env: "Staging",
      coverage: "88.5%",
      hash: "c51a0b3",
      author: "CI Bot",
      authorImage: "CB",
      pipelines: [
        { name: "Linting & Typecheck", duration: "1m 10s", status: "success" },
        { name: "Unit & Integration Tests", duration: "2m 45s", status: "building" },
        { name: "E2E Cypress Suite", duration: "-", status: "pending" },
        { name: "Docker Image Build", duration: "-", status: "pending" }
      ],
      commits: [
         { msg: "feat(ws): initialize socket.io adapter for CRDTs", hash: "c51a0b3" },
         { msg: "chore(deps): bump yjs from 13.5.52 to 13.6.0", hash: "8f902ea" }
      ]
    },
    {
      id: "rel-4.2.0",
      version: "v4.2.0",
      title: "Memory Leak Hotfix in Redis Cache",
      date: "Oct 20, 2023",
      status: "Failed",
      env: "Production",
      coverage: "92.0%",
      hash: "e9f01bc",
      author: "Suhas Thammysetty",
      authorImage: "U",
      pipelines: [
        { name: "Linting & Typecheck", duration: "1m 05s", status: "success" },
        { name: "Unit & Integration Tests", duration: "1m 30s", status: "failed" },
        { name: "E2E Cypress Suite", duration: "-", status: "canceled" },
        { name: "Docker Image Build", duration: "-", status: "canceled" }
      ],
      commits: [
         { msg: "fix(cache): limit max heap size for redis publisher", hash: "e9f01bc" }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Deployed": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "Building": return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "Failed": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  const getPipeIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "building": return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <StopCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100 md:flex-row">
      <Sidebar activePage="Changelog" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col justify-between space-y-4 md:flex-row md:items-end md:space-y-0 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                 <Terminal className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">CI/CD & Releases</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Advanced deployment pipelines, continuous integration status, and real-time Git repository synchronization for the NoteVault Engine.
            </p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search branches, SHAs, pipelines..."
                className="w-full md:w-80 rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <button className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
               <GitPullRequest className="h-4 w-4" />
               <span>New Deploy</span>
            </button>
          </div>
        </header>

        {/* System Health Metric Overlay */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
           {[
             { label: "Production Health", val: "99.99%", desc: "Uptime across 4 regions", icon: <Server className="h-5 w-5" />, color: "text-emerald-500" },
             { label: "Active Deployments", val: "3", desc: "1 Prod, 2 Staging envs", icon: <Box className="h-5 w-5" />, color: "text-blue-500" },
             { label: "Global Coverage", val: "92.4%", desc: "+0.3% since last week", icon: <Code2 className="h-5 w-5" />, color: "text-purple-500" },
             { label: "Avg Build Time", val: "4m 12s", desc: "P90 duration across master", icon: <Clock className="h-5 w-5" />, color: "text-amber-500" }
           ].map((metric, i) => (
             <motion.div key={i} initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: i * 0.1}} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800/40">
                <div className="mb-3 flex items-center justify-between">
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{metric.label}</span>
                   <div className={metric.color}>{metric.icon}</div>
                </div>
                <div className="text-2xl font-black">{metric.val}</div>
                <div className="mt-1 text-xs font-medium text-slate-400">{metric.desc}</div>
             </motion.div>
           ))}
        </div>

        {/* Release Pipelines */}
        <div className="space-y-6">
          <AnimatePresence>
            {releases.map((release, i) => (
              <motion.div 
                key={release.id} 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.2 + (i * 0.1) }} 
                className={`overflow-hidden rounded-2xl border ${
                  release.status === "Failed" ? "border-red-200 dark:border-red-900/30" :
                  release.status === "Building" ? "border-blue-200 dark:border-blue-900/40 border-2" :
                  "border-slate-200 dark:border-slate-800"
                } bg-white shadow-sm dark:bg-slate-800/20`}
              >
                {/* Header Strip */}
                <div className={`px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b ${
                  release.status === "Failed" ? "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20" :
                  release.status === "Building" ? "bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30" :
                  "bg-slate-50/50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
                }`}>
                   <div className="flex items-center space-x-4 mb-3 md:mb-0">
                      {getStatusIcon(release.status)}
                      <div>
                         <div className="flex items-center space-x-2">
                           <h2 className="text-lg font-bold">{release.title}</h2>
                           <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-widest text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                             {release.version}
                           </span>
                         </div>
                         <div className="flex items-center space-x-3 text-xs font-medium text-slate-500 mt-1">
                            <span className="flex items-center space-x-1"><GitCommit className="h-3 w-3" /> <span>{release.hash}</span></span>
                            <span>•</span>
                            <span>{release.date}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1"><Server className="h-3 w-3" /> <span>{release.env} Env</span></span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                         <div className="h-4 w-4 rounded-full bg-blue-100 text-[8px] flex items-center justify-center font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                           {release.authorImage}
                         </div>
                         <span className="font-medium">{release.author}</span>
                      </div>
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300">
                         <MoreHorizontal className="h-4 w-4" />
                      </button>
                   </div>
                </div>

                {/* Pipeline visualizer */}
                <div className="p-6">
                   <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">CI/CD Pipeline Stages</h4>
                      <div className="relative flex items-center justify-between before:absolute before:inset-0 before:top-1/2 before:h-0.5 before:-translate-y-1/2 before:bg-slate-100 dark:before:bg-slate-800 max-w-3xl">
                         {release.pipelines.map((pipe, idx) => (
                           <div key={idx} className="relative z-10 flex flex-col items-center group cursor-pointer">
                              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white shadow-sm dark:bg-slate-900 transition-transform group-hover:scale-110 ${
                                pipe.status === "success" ? "border-emerald-500" :
                                pipe.status === "building" ? "border-blue-500 ring-4 ring-blue-500/20" :
                                pipe.status === "failed" ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                              }`}>
                                 {getPipeIcon(pipe.status)}
                              </div>
                              <div className="text-center absolute top-10 w-24 left-1/2 -translate-x-1/2">
                                <p className={`text-[10px] font-bold leading-tight ${
                                  pipe.status === "building" ? "text-blue-600 dark:text-blue-400" :
                                  pipe.status === "failed" ? "text-red-500" : "text-slate-600 dark:text-slate-300"
                                }`}>{pipe.name}</p>
                                <p className="text-[9px] font-medium text-slate-400 mt-0.5">{pipe.duration}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Commits / Diff Data */}
                   <div className="mt-14 pt-6 border-t border-slate-100 dark:border-slate-800/80 rounded-b-2xl flex flex-col md:flex-row md:items-start justify-between">
                     <div className="flex-1 space-y-2 max-w-2xl">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Code Inclusions</h4>
                        {release.commits.map((commit, j) => (
                          <div key={j} className="flex items-start space-x-3 text-sm">
                             <GitMerge className="h-4 w-4 text-slate-400 mt-0.5" />
                             <div>
                                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 mr-2">{commit.hash}</span>
                                <span className="text-slate-700 dark:text-slate-300">{commit.msg}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                     <div className="mt-4 md:mt-0 flex items-center space-x-4 border-l border-slate-100 dark:border-slate-800 pl-6 h-full">
                        <div className="text-center">
                           <div className="text-xl font-black text-emerald-500">{release.coverage}</div>
                           <div className="text-[10px] font-bold uppercase text-slate-400">Test Coverage</div>
                        </div>
                        <button className="flex items-center justify-center p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                           <Eye className="h-5 w-5" />
                        </button>
                     </div>
                   </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
