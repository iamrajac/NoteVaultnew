"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Shield, Bell, Key, Palette } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100 md:flex-row">
      <Sidebar activePage="Settings" />

      <main className="flex-1 p-4 md:p-8">
        <header className="mb-8 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your preferences and workspace configuration.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-1">
            {[
              { id: "General", icon: SettingsIcon, active: true },
              { id: "Security", icon: Shield, active: false },
              { id: "Notifications", icon: Bell, active: false },
              { id: "Appearance", icon: Palette, active: false },
              { id: "API Keys", icon: Key, active: false },
            ].map((tab) => (
              <button key={tab.id} className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${tab.active ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
                <tab.icon className="h-4 w-4" />
                <span>{tab.id}</span>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 lg:col-span-3">
            <h2 className="mb-6 text-lg font-bold">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Workspace Name</label>
                <input type="text" defaultValue="suhas's Workspace" className="w-full max-w-md rounded-xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:focus:border-blue-500" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Workspace URL</label>
                <div className="flex max-w-md items-center rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                  <span className="pl-4 pr-2 text-sm text-slate-500">notevault.app/ws/</span>
                  <input type="text" defaultValue="suhas" className="w-full flex-1 rounded-r-xl border-none bg-transparent py-2 pr-4 text-sm outline-none focus:ring-0" />
                </div>
              </div>

              <div className="pt-4">
                <button className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
