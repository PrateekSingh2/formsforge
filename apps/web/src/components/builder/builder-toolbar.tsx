// ============================================================================
// BUILDER TOOLBAR — Top bar
// ============================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { ArrowLeft, Undo2, Redo2, Eye, EyeOff, Save, Sparkles, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveFormToDatabase } from "@/lib/supabase-actions";
import { useAuth } from "@/providers/auth-provider";
import { QRShareModal } from "./qr-share-modal";
import { AIGenerateModal } from "./ai-generate-modal";

export function BuilderToolbar() {
  const { title, setFormMeta, previewMode, setPreviewMode, undo, redo, historyIndex, history, isDirty, status, fields, description, layoutType, themeConfig, formSettings, formId, formSlug } = useFormBuilderStore();
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePublish = async (isAutoSave = false) => {
    // Prevent multiple parallel saves
    if (isPublishing) return;
    setIsPublishing(!isAutoSave); // Only show spinner if manual save
    
    try {
      const result = await saveFormToDatabase(
        user?.uid || null,
        formId,
        title,
        description,
        layoutType,
        themeConfig,
        formSettings,
        fields
      );
      
      setFormMeta({ status: "Published", isDirty: false, formSlug: result.slug, formId: result.formId });
      setLastSaved(new Date());
      if (!isAutoSave) {
        toast.success("Form successfully published!");
      }
    } catch (error) {
      console.error(error);
      if (!isAutoSave) {
        toast.error("Failed to publish form. Please try again.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  // Autosave mechanism
  useEffect(() => {
    if (isDirty && user?.uid) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      // Auto-save after 3 seconds of inactivity
      autoSaveTimerRef.current = setTimeout(() => {
        handlePublish(true);
      }, 3000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [isDirty, fields, title, themeConfig, user]);

  return (
    <div className="h-16 border-b-2 border-[#333333] bg-white px-6 flex items-center justify-between shrink-0 shadow-[0_4px_0px_#333333] relative z-20">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-xl border-2 border-transparent hover:border-[#333333] hover:bg-[#FEF3C7] text-[#333333] transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-8 w-0.5 bg-gray-200" />
        <div className="flex items-center gap-2 group px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
          <Sparkles className="w-5 h-5 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
          <input type="text" value={title} onChange={(e) => setFormMeta({ title: e.target.value })}
            className="text-lg font-balsamiq font-bold text-[#333333] bg-transparent border-none outline-none focus:ring-0 max-w-[250px] placeholder:text-gray-300" placeholder="Untitled Form" />
        </div>
      </div>

      {/* Center — Undo/Redo */}
      <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border-2 border-gray-200">
        <motion.button whileTap={{ scale: 0.9 }} onClick={undo} disabled={historyIndex <= 0}
          className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 disabled:opacity-30 transition-all border border-transparent hover:border-gray-200">
          <Undo2 className="w-4 h-4" />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={redo} disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 disabled:opacity-30 transition-all border border-transparent hover:border-gray-200">
          <Redo2 className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end mr-2">
          {lastSaved && !isDirty && (
            <span className="text-[10px] font-comic text-gray-400">Saved {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          )}
          {isDirty && (
             <span className="text-[10px] font-comic text-[#F59E0B] flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Unsaved changes</span>
          )}
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => setIsAIModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-balsamiq font-bold rounded-xl border-2 border-transparent bg-[#F5F3FF] text-[#8B5CF6] hover:border-[#8B5CF6] transition-all group"
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          AI Create
        </motion.button>
        
        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPreviewMode(!previewMode)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-balsamiq font-bold rounded-xl border-2 transition-all ${previewMode ? "bg-[#8B5CF6] text-white border-[#333333] shadow-[2px_2px_0px_#333333]" : "bg-white text-gray-600 border-gray-200 hover:border-[#8B5CF6] hover:text-[#8B5CF6]"}`}>
          {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {previewMode ? "Edit" : "Preview"}
        </motion.button>
        
        {formSlug && (
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setIsShareModalOpen(true)}
            className="p-2.5 rounded-xl border-2 border-gray-200 hover:border-[#333333] hover:bg-[#D1FAE5] text-gray-600 hover:text-[#333333] transition-all group"
            title="Share Public Link"
          >
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}


        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => handlePublish(false)}
          disabled={isPublishing}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-balsamiq font-bold rounded-xl border-2 border-[#333333] transition-all disabled:opacity-70 ${status === 'Published' && !isDirty ? 'bg-[#34D399] text-[#333333] shadow-[2px_2px_0px_#333333]' : 'bg-[#F59E0B] text-[#333333] shadow-[4px_4px_0px_#333333] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#333333]'}`}>
          {isPublishing && !autoSaveTimerRef.current ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {status === 'Published' && !isDirty ? "Published" : isDirty ? "Save & Publish" : "Publish"}
        </motion.button>
      </div>

      <QRShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={formSlug ? `${window.location.origin}/f/${formSlug}` : ""} 
      />

      <AIGenerateModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}
