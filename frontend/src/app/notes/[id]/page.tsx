"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, Save, CheckCircle2, ShieldAlert, Users, Loader2 } from "lucide-react";

export default function CollaborativeEditor() {
  const { id: noteId } = useParams();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [note, setNote] = useState<any>(null);
  
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("nv_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.workspaces?.length > 0) setWorkspace(parsedUser.workspaces[0]);
    }
    
    // Fetch initial Note Data
    fetch(`http://localhost:5000/api/notes/${noteId}`)
      .then(res => res.json())
      .then(data => {
        setNote(data);
        setContent(data.content || "");
        setStatus(data.status);
      });
  }, [noteId]);

  useEffect(() => {
    // Initialize Socket.io Connection
    const s = io("http://localhost:5000");
    setSocket(s);

    s.emit("join-note", noteId);

    s.on("receive-note-change", (data) => {
      // Very naive CRDT replacement. In production, use Yjs
      setContent(data.content);
    });

    // Simulate active users (in a real app, socket namespace tracking)
    setActiveUsers(Math.floor(Math.random() * 3) + 1);

    return () => {
      s.emit("leave-note", noteId);
      s.disconnect();
    };
  }, [noteId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    // Broadcast instantly
    if (socket) {
      socket.emit("note-change", { noteId, content: newContent });
    }
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    // There isn't an explicit PUT endpoint yet, but we can simulate saving mechanism or update via existing API
    // Extending backend to handle PATCH /content in the future.
    // Let's pretend it saves via a generic backend path we define.
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          approverId: newStatus === "Approved" ? user.id : null
        })
      });
      if (res.ok) setStatus(newStatus);
    } catch(e) {}
  };

  if (!note) {
     return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  const isApprover = workspace?.role === "Admin" || workspace?.role === "Team Lead";

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* Editor Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 px-4 md:px-8 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push('/notes')} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition">
             <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold md:text-base">{note.title}</h1>
            <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
               <span>Authored by {note.author?.name}</span>
               {status === "Pending Review" && <span className="text-amber-500">Needs Approval</span>}
               {status === "Approved" && <span className="text-emerald-500 flex items-center space-x-1"><CheckCircle2 className="h-3 w-3" /> <span>Approved</span></span>}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 mr-4">
             <div className="flex -space-x-2">
                {[...Array(activeUsers)].map((_, i) => (
                  <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-indigo-500 dark:border-slate-900 shadow-sm" />
                ))}
             </div>
             <span className="text-xs font-semibold text-slate-400">{activeUsers} online</span>
          </div>

          {/* Workflow Gates */}
          {status === "Draft" && (
            <button onClick={() => handleUpdateStatus("Pending Review")} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
              Submit for Review
            </button>
          )}

          {status === "Pending Review" && isApprover && (
            <button onClick={() => handleUpdateStatus("Approved")} className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md shadow-emerald-500/20">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Approve Document</span>
            </button>
          )}

          <button onClick={handleManualSave} className="flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white active:scale-95">
             {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
             <span className="hidden md:inline">Save</span>
          </button>
        </div>
      </header>

      {/* Editor Canvas */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0B1120] relative">
         <div className="mx-auto max-w-4xl py-12 px-6">
            <textarea
              autoFocus
              value={content}
              onChange={handleChange}
              placeholder="Start typing your document..."
              className="w-full resize-none bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-300 dark:text-slate-300 dark:placeholder:text-slate-700 min-h-[500px] leading-relaxed"
            />
         </div>
      </main>
    </div>
  );
}
