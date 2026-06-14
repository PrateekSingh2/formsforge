// ============================================================================
// FORM BUILDER PAGE — /builder
// ============================================================================

"use client";

import { motion } from "framer-motion";
import { FieldPalette } from "@/components/builder/field-palette";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import { FieldConfig } from "@/components/builder/field-config";
import { BuilderToolbar } from "@/components/builder/builder-toolbar";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { AuthGuard } from "@/components/auth-guard";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchFormById } from "@/lib/supabase-actions";
import { Loader2 } from "lucide-react";
import { FORM_TEMPLATES } from "@/lib/templates";

export default function BuilderPage() {
  const { previewMode, themeConfig, loadForm, formId } = useFormBuilderStore();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const templateId = searchParams.get("template");
  const [loading, setLoading] = useState(!!id && id !== formId);

  useEffect(() => {
    async function load() {
      if (id && id !== formId) {
        try {
          const { form, fields } = await fetchFormById(id);
          loadForm(
            form.id,
            form.title,
            form.description || "",
            fields as any // Hydrate fields
          );
        } catch (error) {
          console.error("Failed to load form:", error);
        }
      } else if (templateId && !id && !formId) {
        // Load template
        const template = FORM_TEMPLATES.find(t => t.id === templateId);
        if (template) {
          useFormBuilderStore.getState().resetStore();
          loadForm(
            "", // New form
            template.title,
            template.description,
            template.fields as any
          );
          // Force apply theme config
          useFormBuilderStore.getState().setFormMeta({ themeConfig: template.themeConfig as any });
        }
      } else if (!id && !templateId && !formId) {
        // Brand new form, check for global defaults
        const saved = localStorage.getItem("formforge_global_defaults");
        if (saved) {
          const defaults = JSON.parse(saved);
          useFormBuilderStore.getState().setFormMeta({
            themeConfig: {
              fontFamily: defaults.fontFamily,
              textColor: defaults.textColor,
              backgroundColor: defaults.backgroundColor,
              formBgColor: "#FCFBF8",
              fieldBgColor: "#ffffff",
              accentColor: "border-[#8B5CF6]",
              borderStyle: "border-2",
              rounded: "rounded-2xl"
            },
            formSettings: {
              successMessage: defaults.successMessage,
              allowMultipleResponses: true
            }
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [id, templateId, formId, loadForm]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        <BuilderToolbar />

      <div className="flex-1 flex overflow-hidden">
        {!previewMode && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-64 border-r border-gray-200 bg-white overflow-y-auto shrink-0"
          >
            <FieldPalette />
          </motion.aside>
        )}

        <main className="flex-1 overflow-y-auto p-8 transition-colors" style={{ backgroundColor: themeConfig?.formBgColor || "#FCFBF8" }}>
          <BuilderCanvas />
        </main>

        {!previewMode && (
          <motion.aside
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0"
          >
            <FieldConfig />
          </motion.aside>
        )}
      </div>
      </div>
    </AuthGuard>
  );
}
