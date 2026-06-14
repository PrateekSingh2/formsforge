// ============================================================================
// RIGHT SIDEBAR — Field Properties & Theme Configuration
// ============================================================================

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { Settings2, Palette, Paintbrush, SlidersHorizontal, Plus, X } from "lucide-react";

export function FieldConfig() {
  const { fields, activeFieldId, updateField, themeConfig, formSettings, setFormMeta } = useFormBuilderStore();
  const field = fields.find((f) => f.id === activeFieldId);
  const [activeTab, setActiveTab] = useState<"field" | "theme" | "settings">("field");

  return (
    <div className="flex flex-col h-full bg-[#FCFBF8]">

      {/* Tabs */}
      <div className="flex border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab("field")}
          className={`flex-1 py-4 text-sm font-balsamiq font-bold flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'field' ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Settings2 className="w-4 h-4" /> Properties
        </button>
        <button
          onClick={() => setActiveTab("theme")}
          className={`flex-1 py-4 text-sm font-balsamiq font-bold flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'theme' ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Palette className="w-4 h-4" /> Theme
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-4 text-xs font-balsamiq font-bold flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Settings
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {activeTab === "field" ? (
          <AnimatePresence mode="wait">
            {field ? (
              <motion.div key={field.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="space-y-5 font-comic">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Label</label>
                  <input type="text" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-all text-[#333333] font-bold" />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                  <textarea value={field.description || ""} onChange={(e) => updateField(field.id, { description: e.target.value })} rows={2}
                    className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-all resize-none text-[#333333]" placeholder="Add a help text..." />
                </div>

                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-bold text-[#333333]">Required Field</label>
                  <button onClick={() => updateField(field.id, { required: !field.required })}
                    className={`w-12 h-6 rounded-full transition-colors relative border-2 border-[#333333] ${field.required ? "bg-[#34D399]" : "bg-gray-200"}`}>
                    <motion.div animate={{ x: field.required ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm border border-[#333333]" />
                  </button>
                </div>

                {["short_text", "long_text", "email", "phone", "number", "url"].includes(field.type) && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Placeholder</label>
                    <input type="text" value={(field.config?.placeholder as string) || ""} onChange={(e) => updateField(field.id, { config: { ...field.config, placeholder: e.target.value } })}
                      className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-all text-gray-500" placeholder="Enter placeholder text..." />
                  </div>
                )}

                {["multiple_select", "radio", "checkbox", "dropdown"].includes(field.type) && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Options</label>
                    {((field.config?.options as string[]) || ['Option 1', 'Option 2']).map((opt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...((field.config?.options as string[]) || ['Option 1', 'Option 2'])];
                            newOptions[idx] = e.target.value;
                            updateField(field.id, { config: { ...field.config, options: newOptions } });
                          }}
                          className="flex-1 px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-all text-[#333333] font-bold"
                        />
                        <button
                          onClick={() => {
                            const newOptions = [...((field.config?.options as string[]) || ['Option 1', 'Option 2'])];
                            newOptions.splice(idx, 1);
                            updateField(field.id, { config: { ...field.config, options: newOptions } });
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const currentOpts = (field.config?.options as string[]) || ['Option 1', 'Option 2'];
                        const newOptions = [...currentOpts, `Option ${currentOpts.length + 1}`];
                        updateField(field.id, { config: { ...field.config, options: newOptions } });
                      }}
                      className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t-2 border-dashed border-gray-200 mt-6">
                  <span className="text-xs font-bold text-gray-400">Type: </span>
                  <span className="text-xs font-bold text-[#8B5CF6] bg-[#E9D5FF] px-2.5 py-1 rounded-full ml-1 border border-[#8B5CF6]">{field.type.replace("_", " ")}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <Settings2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-comic font-bold text-gray-500">Select a field to edit its properties</p>
              </motion.div>
            )}
          </AnimatePresence>
        ) : activeTab === "theme" ? (
          /* THEME TAB */
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 font-comic">

            {/* Quick Themes */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Quick Themes</label>
              <div className="grid grid-cols-2 gap-3">
                {/* Programmer */}
                <button
                  onClick={() => setFormMeta({ themeConfig: { fontFamily: "font-mono", backgroundColor: "bg-transparent", accentColor: "border-emerald-500", borderStyle: "border border-emerald-500/50", rounded: "rounded-sm", formBgColor: "#0f172a", fieldBgColor: "rgba(15, 23, 42, 0.8)", textColor: "#10b981", glassmorphism: true, backgroundPattern: "programmer" } })}
                  className="p-3 border border-emerald-500/30 rounded-sm text-left relative overflow-hidden group transition-all bg-[#0f172a] hover:border-emerald-500"
                >
                  <div className="relative z-10 flex gap-1 mb-2">
                    <div className="w-4 h-4 rounded-sm bg-emerald-500 border border-emerald-400/50"></div>
                    <div className="w-4 h-4 rounded-sm bg-[#1e293b] border border-emerald-500/30"></div>
                  </div>
                  <span className="relative z-10 font-mono text-xs text-emerald-500">&lt;Programmer/&gt;</span>
                </button>

                {/* Healthcare */}
                <button
                  onClick={() => setFormMeta({ themeConfig: { fontFamily: "font-sans", backgroundColor: "bg-blue-50", accentColor: "border-red-500", borderStyle: "border-2", rounded: "rounded-2xl", formBgColor: "#f0f9ff", fieldBgColor: "rgba(255, 255, 255, 0.9)", textColor: "#0f172a", glassmorphism: true, backgroundPattern: "healthcare" } })}
                  className="p-3 border-2 border-red-200 rounded-2xl text-left bg-blue-50 hover:border-red-500 transition-all"
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <div className="w-4 h-4 rounded-full bg-white border border-red-200"></div>
                  </div>
                  <span className="font-sans font-bold text-xs text-slate-800">Healthcare</span>
                </button>

                {/* Education */}
                <button
                  onClick={() => setFormMeta({ themeConfig: { fontFamily: "font-comic", backgroundColor: "bg-orange-50", accentColor: "border-orange-500", borderStyle: "border-4", rounded: "rounded-xl", formBgColor: "#fff7ed", fieldBgColor: "rgba(255,255,255,0.95)", textColor: "#9a3412", glassmorphism: true, backgroundPattern: "education" } })}
                  className="p-3 border-4 border-orange-200 rounded-xl text-left transition-all hover:border-orange-500 bg-orange-50"
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-4 h-4 rounded-md bg-orange-500"></div>
                    <div className="w-4 h-4 rounded-md bg-white border-2 border-orange-200"></div>
                  </div>
                  <span className="font-comic font-bold text-xs text-orange-800">Education</span>
                </button>

                {/* Playful */}
                <button
                  onClick={() => setFormMeta({ themeConfig: { fontFamily: "font-balsamiq", backgroundColor: "bg-[#fdf4ff]", accentColor: "border-[#d946ef]", borderStyle: "border-2 border-dashed", rounded: "rounded-full", formBgColor: "#fdf4ff", fieldBgColor: "rgba(255,255,255,0.6)", textColor: "#701a75", glassmorphism: true, backgroundPattern: "playful" } })}
                  className="p-3 border-2 border-dashed border-[#d946ef] rounded-3xl text-left bg-[#fdf4ff] hover:bg-[#fae8ff] transition-all"
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#d946ef]"></div>
                    <div className="w-4 h-4 rounded-full bg-white border border-[#d946ef]"></div>
                  </div>
                  <span className="font-balsamiq text-xs text-[#701a75] font-bold">Playful</span>
                </button>
              </div>
            </div>

            {/* Customization */}
            <div className="pt-6 border-t-2 border-dashed border-gray-200">
              <h4 className="font-balsamiq font-bold text-[#333333] mb-4 flex items-center gap-2"><Paintbrush className="w-4 h-4" /> Custom Styling</h4>

              <div className="space-y-4">

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Form Background Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeConfig?.formBgColor || "#FCFBF8"}
                      onChange={(e) => setFormMeta({ themeConfig: { ...themeConfig!, formBgColor: e.target.value } })}
                      className="w-10 h-10 p-1 bg-white border-2 border-[#333333] rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-bold text-[#333333] uppercase">{themeConfig?.formBgColor || "#FCFBF8"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Field Background Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeConfig?.fieldBgColor || "#ffffff"}
                      onChange={(e) => setFormMeta({ themeConfig: { ...themeConfig!, fieldBgColor: e.target.value } })}
                      className="w-10 h-10 p-1 bg-white border-2 border-[#333333] rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-bold text-[#333333] uppercase">{themeConfig?.fieldBgColor || "#ffffff"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Text Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={themeConfig?.textColor || "#333333"}
                      onChange={(e) => setFormMeta({ themeConfig: { ...themeConfig!, textColor: e.target.value } })}
                      className="w-10 h-10 p-1 bg-white border-2 border-[#333333] rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-bold text-[#333333] uppercase">{themeConfig?.textColor || "#333333"}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Font Style</label>
                  <select
                    value={themeConfig?.fontFamily || "font-balsamiq"}
                    onChange={(e) => setFormMeta({ themeConfig: { ...themeConfig!, fontFamily: e.target.value } })}
                    className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl font-bold text-[#333333] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="font-balsamiq">Balsamiq (Marker)</option>
                    <option value="font-comic">Comic (Handwriting)</option>
                    <option value="font-sans">Inter (Modern)</option>
                    <option value="font-mono">Monospace (Code)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Border Style</label>
                  <select
                    value={themeConfig?.borderStyle || "border-2"}
                    onChange={(e) => setFormMeta({ themeConfig: { ...themeConfig!, borderStyle: e.target.value } })}
                    className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl font-bold text-[#333333] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <option value="border-2">Thick Solid</option>
                    <option value="border">Thin Solid</option>
                    <option value="border-2 border-dashed">Dashed</option>
                    <option value="border-0 shadow-sm">No Border (Shadow Only)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Corners</label>
                  <div className="flex gap-2">
                    {["rounded-none", "rounded-md", "rounded-2xl", "rounded-full"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setFormMeta({ themeConfig: { ...themeConfig!, rounded: r } })}
                        className={`flex-1 py-2 border-2 ${themeConfig?.rounded === r ? 'border-[#8B5CF6] bg-[#E9D5FF] text-[#8B5CF6]' : 'border-gray-200 bg-white text-gray-500'} ${r} transition-colors flex justify-center`}
                      >
                        <div className={`w-4 h-4 border-2 border-current ${r}`}></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        ) : activeTab === "settings" ? (
          /* SETTINGS TAB */
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 font-comic">
            <div>
              <h4 className="font-balsamiq font-bold text-[#333333] mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Form Settings</h4>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Success Message</label>
                  <textarea
                    value={formSettings?.successMessage || ""}
                    onChange={(e) => setFormMeta({ formSettings: { ...formSettings!, successMessage: e.target.value } })}
                    rows={3}
                    placeholder="Thank You! Your response has been recorded."
                    className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-[#8B5CF6] focus:outline-none transition-all resize-none text-[#333333] font-bold"
                  />
                  <p className="text-xs text-gray-400 mt-1 font-sans">Message shown to users after they submit the form.</p>
                </div>

                <div className="flex items-center justify-between py-2 border-t-2 border-dashed border-gray-200 pt-6">
                  <div>
                    <label className="text-sm font-bold text-[#333333] block">Accept Responses</label>
                    <p className="text-xs text-gray-400 mt-1 font-sans">Turn off to stop accepting new submissions.</p>
                  </div>
                  <button onClick={() => setFormMeta({ formSettings: { ...formSettings!, isAcceptingResponses: formSettings?.isAcceptingResponses === false ? true : false } })}
                    className={`w-12 h-6 rounded-full transition-colors relative border-2 border-[#333333] ${formSettings?.isAcceptingResponses !== false ? "bg-[#34D399]" : "bg-red-500"}`}>
                    <motion.div animate={{ x: formSettings?.isAcceptingResponses !== false ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm border border-[#333333]" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-t-2 border-dashed border-gray-200 pt-6">
                  <div>
                    <label className="text-sm font-bold text-[#333333] block">Allow Multiple Responses</label>
                    <p className="text-xs text-gray-400 mt-1 font-sans">If disabled, users can only submit once.</p>
                  </div>
                  <button onClick={() => setFormMeta({ formSettings: { ...formSettings!, allowMultipleResponses: !formSettings?.allowMultipleResponses } })}
                    className={`w-12 h-6 rounded-full transition-colors relative border-2 border-[#333333] ${formSettings?.allowMultipleResponses ? "bg-[#34D399]" : "bg-gray-200"}`}>
                    <motion.div animate={{ x: formSettings?.allowMultipleResponses ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm border border-[#333333]" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
