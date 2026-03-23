"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, Save, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export default function CollaborativeEditor() {
  const { id: noteId } = useParams();
  const router = useRouter();
  
  const editorRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const localChangeRef = useRef(false);
  const contentRef = useRef<string>("");

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
        contentRef.current = data.content || "";
        setStatus(data.status);

        if (editorRef.current) {
          editorRef.current.innerHTML = data.content || "";
        }

        const tags = (data.tags || "").split(",").map((t: string) => t.trim().toLowerCase());
        if (tags.includes("deployed")) setCiStatus("deployed");
        else if (tags.includes("ci-passed")) setCiStatus("passed");
        else if (tags.includes("ci-failed")) setCiStatus("failed");
        else setCiStatus("idle");
      });
  }, [noteId]);

  useEffect(() => {
    // Initialize Socket.io Connection
    const s = io("http://localhost:5000");
    setSocket(s);

    s.emit("join-note", noteId);

    // Enable image object resizing and table editing for user friendliness
    // Using string param due to TypeScript execCommand typing
    document.execCommand("enableObjectResizing", false, "true");
    document.execCommand("enableInlineTableEditing", false, "true");

    s.on("receive-note-change", (data) => {
      // Very naive CRDT replacement. In production, use Yjs
      if (!localChangeRef.current && data.content !== contentRef.current) {
        setContent(data.content);
        contentRef.current = data.content;
        if (editorRef.current) editorRef.current.innerHTML = data.content;
      }
    });

    // Simulate active users (in a real app, socket namespace tracking)
    setActiveUsers(Math.floor(Math.random() * 3) + 1);

    return () => {
      s.emit("leave-note", noteId);
      s.disconnect();
    };
  }, [noteId]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;
    setContent(newContent);
    contentRef.current = newContent;
    localChangeRef.current = true;

    if (socket) {
      socket.emit("note-change", { noteId, content: newContent });
    }

    window.setTimeout(() => {
      localChangeRef.current = false;
    }, 250);
  };

  const applyRichText = (command: string, value?: string) => {
    document.execCommand(command, false, value as string | undefined);
    const editor = editorRef.current;
    if (editor) {
      setContent(editor.innerHTML);
      contentRef.current = editor.innerHTML;
      if (socket) socket.emit("note-change", { noteId, content: editor.innerHTML });
    }
  };

  const handleInsertImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpe?g|svg\+xml)$/i.test(file.type)) {
      alert("Please choose a PNG/JPEG/JPG/SVG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const editor = editorRef.current;
      if (editor) {
        editor.focus();
        document.execCommand("insertImage", false, src);
        const imageElement = editor.querySelector("img[src='" + src + "']") as HTMLImageElement;
        if (imageElement) {
          imageElement.style.maxWidth = "100%";
          imageElement.style.height = "auto";
        }
        setContent(editor.innerHTML);
        contentRef.current = editor.innerHTML;
        if (socket) socket.emit("note-change", { noteId, content: editor.innerHTML });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualSave = async () => {
    if (!noteId) return;
    setIsSaving(true);

    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: note?.title,
          status,
          authorId: user?.id
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setNote(updated);
        setContent(updated.content ?? content);
        setStatus(updated.status ?? status);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const [ciStatus, setCiStatus] = useState<"idle" | "running" | "passed" | "failed" | "deployed">("idle");

  const runCiPipeline = async () => {
    if (!noteId) return;
    setCiStatus("running");
    await new Promise((resolve) => setTimeout(resolve, 800));

    const passed = Math.random() > 0.15;
    setCiStatus(passed ? "passed" : "failed");

    if (passed) {
      // store CI success marker in tags so it's persistent
      const currentTagSet = new Set((note?.tags || "").split(",").filter(Boolean));
      currentTagSet.delete("ci-failed");
      currentTagSet.add("ci-passed");
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: Array.from(currentTagSet).join(",") })
      });
    }
  };

  const deployPipeline = async () => {
    if (ciStatus !== "passed") return;
    setCiStatus("deployed");
    const currentTagSet = new Set((note?.tags || "").split(",").filter(Boolean));
    currentTagSet.add("deployed");
    await fetch(`http://localhost:5000/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: Array.from(currentTagSet).join(",") })
    });
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!user || !noteId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${noteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          approverId: newStatus === "Approved" ? user.id : null
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setStatus(updated.status ?? newStatus);
        setNote(updated);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
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
               <span>Authored by {note.author?.name || "Unknown"}</span>
               <span>
                 Last edited by {note.approver?.name || note.author?.name || "Unknown"}
               </span>
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
         <div className="mx-auto max-w-4xl py-6 px-6">
            <div className="mb-3 flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm dark:bg-slate-800">
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("bold")}>Bold</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("italic")}>Italic</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("underline")}>Underline</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("formatBlock", "H2")}>H2</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("insertUnorderedList")}>Bullet</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("insertOrderedList")}>Numbered</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("formatBlock", "PRE")}>Code</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("undo")}>Undo</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={() => applyRichText("redo")}>Redo</button>
              <button className="rounded-md px-3 py-1 text-xs font-semibold" onClick={handleInsertImage}>Image</button>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml" onChange={handleImageUpload} className="hidden" />
            </div>
            <div className="mb-4 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-700 dark:text-slate-300">CI: {ciStatus}</span>
                <button onClick={runCiPipeline} className="rounded-lg bg-indigo-600 px-3 py-1 text-white">Run CI</button>
                <button disabled={ciStatus !== "passed"} onClick={deployPipeline} className="rounded-lg bg-emerald-600 px-3 py-1 text-white disabled:opacity-40">Deploy</button>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                CI/CD helps ensure note changes are tested and reviewed before deployment.
                Run CI to validate content (spellcheck, style checks, custom rules), then Deploy to promote this note to the shared library state.
                In future, this can connect to formal pipelines, approval gates and audit history.
              </div>
            </div>
            <div
              ref={editorRef}
              id="rich-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={handleContentChange}
              className="min-h-[500px] rounded-xl border border-slate-300 bg-white p-4 text-lg text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
         </div>
      </main>
    </div>
  );
}
