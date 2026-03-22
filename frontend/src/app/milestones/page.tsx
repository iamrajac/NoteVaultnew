"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Plus, Calendar, CheckCircle2, Clock, MapPin } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function MilestonesPage() {
  const [workspace, setWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const loadData = async () => {
    setLoading(true);
    const storedUser = localStorage.getItem("nv_user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.workspaces?.length > 0) {
        const ws = parsed.workspaces[0];
        setWorkspace(ws);
        
        try {
           const pRes = await fetch(`http://localhost:5000/api/projects/${ws.workspaceId}?userId=${parsed.id}&userRole=${ws.role}`);
           if (pRes.ok) {
              const pData = await pRes.json();
              setProjects(pData);
              if (pData.length > 0) setSelectedProjectId(pData[0].id);
           }

           const mRes = await fetch(`http://localhost:5000/api/milestones/workspace/${ws.workspaceId}`);
           if (mRes.ok) setMilestones(await mRes.json());
        } catch(e) {}
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !selectedProjectId) return;
    try {
      const res = await fetch("http://localhost:5000/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          dueDate: newDate,
          projectId: selectedProjectId
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewName("");
        setNewDesc("");
        setNewDate("");
        loadData();
      }
    } catch(e) {}
  };

  const handleComplete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/milestones/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" })
      });
      loadData();
    } catch(e) {}
  };

  const isLeader = workspace?.role === "Admin" || workspace?.role === "Team Lead";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 duration-300 dark:bg-slate-900 dark:text-slate-100 md:flex-row">
      <Sidebar activePage="Milestones" />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
             <h1 className="text-3xl font-black tracking-tight flex items-center space-x-2">
                <Flag className="h-6 w-6 text-orange-500" />
                <span>Milestones</span>
             </h1>
             <p className="mt-1 text-sm text-slate-500 max-w-lg">Track cross-project roadmaps, delivery schedules, and massive feature goals.</p>
          </div>
          
          {isLeader && projects.length > 0 && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Plant Milestone</span>
            </button>
          )}
        </header>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading timeline...</div>
        ) : milestones.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
             <MapPin className="h-10 w-10 mx-auto text-slate-300 mb-4" />
             <p className="font-semibold text-lg">No Milestones Set</p>
             <p className="text-sm text-slate-500">Plant the first flag to guide your operations.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-4 space-y-8">
             {milestones.map((m, i) => {
               const isCompleted = m.status === "Completed";
               const isOverdue = !isCompleted && new Date(m.dueDate) < new Date();
               
               return (
                 <motion.div 
                   key={m.id} 
                   initial={{ opacity: 0, x: -20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   transition={{ delay: i * 0.1 }} 
                   className="relative pl-8"
                 >
                    {/* Timeline Node */}
                    <div className={`absolute -left-[11px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-4 border-slate-50 dark:border-slate-900 ${
                       isCompleted ? "bg-emerald-500" : isOverdue ? "bg-red-500" : "bg-orange-500"
                    }`}>
                        {isCompleted && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                    </div>

                    <div className={`rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-800/40 ${
                       isCompleted ? "border-emerald-200 dark:border-emerald-900/30" : 
                       isOverdue ? "border-red-200 dark:border-red-900/30 ring-1 ring-red-500/20" : 
                       "border-slate-200 dark:border-slate-800"
                    }`}>
                       <div className="flex flex-col md:flex-row md:items-start justify-between">
                          <div>
                             <div className="flex items-center space-x-2 mb-1.5">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                   {m.project?.name || "Global"}
                                </span>
                                {isOverdue && <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:bg-red-900/30 dark:text-red-400">Overdue</span>}
                             </div>
                             <h3 className={`text-lg font-bold ${isCompleted ? "text-slate-400 line-through decoration-slate-300" : "text-slate-900 dark:text-white"}`}>{m.name}</h3>
                             {m.description && <p className={`mt-1 text-sm ${isCompleted ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>{m.description}</p>}
                          </div>
                          
                          <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end space-y-3">
                             {m.dueDate && (
                               <div className={`flex items-center space-x-1.5 text-xs font-semibold ${isOverdue ? "text-red-500" : "text-slate-500"}`}>
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{new Date(m.dueDate).toLocaleDateString()}</span>
                               </div>
                             )}
                             {!isCompleted && isLeader && (
                                <button onClick={() => handleComplete(m.id)} className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800">
                                   <CheckCircle2 className="h-3.5 w-3.5" />
                                   <span>Mark Complete</span>
                               </button>
                             )}
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )
             })}
          </div>
        )}
      </main>

      {/* New Milestone Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
            >
              <div className="p-6">
                <h2 className="mb-4 text-xl font-bold flex items-center space-x-2">
                   <Flag className="h-5 w-5 text-orange-500" />
                   <span>Plant Milestone</span>
                </h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Target Project</label>
                     <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-slate-700">
                       {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Milestone Title</label>
                    <input required autoFocus type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-slate-700" placeholder="e.g. Beta Release 1.0" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
                    <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full resize-none rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-slate-700" rows={2} placeholder="Optional delivery specs..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Due Date</label>
                    <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-slate-700" />
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                    <button type="submit" className="rounded-xl bg-orange-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-700">Set Milestone</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
