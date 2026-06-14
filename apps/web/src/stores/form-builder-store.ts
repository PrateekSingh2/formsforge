// ============================================================================
// FORM BUILDER STORE — Zustand state management
// ============================================================================

import { create } from "zustand";
import type { FieldType } from "@formforge/types";

export interface BuilderField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  order: number;
  width: "full" | "half" | "third";
  config: Record<string, unknown>;
  validation: Record<string, unknown>;
}

interface FormBuilderState {
  // Form metadata
  formId: string | null;
  formSlug: string | null;
  title: string;
  description: string;
  layoutType: string;
  status: "Draft" | "Published";
  themeConfig: {
    fontFamily: string;
    backgroundColor: string;
    accentColor: string;
    borderStyle: string;
    rounded: string;
    formBgColor: string; // Used for solid background or fallback
    fieldBgColor: string;
    textColor: string;
    glassmorphism?: boolean;
    backgroundPattern?: string; // e.g. "aurora", "dots", "grid" or specific CSS string
  };
  formSettings: {
    successMessage: string;
    allowMultipleResponses: boolean;
    isAcceptingResponses?: boolean;
    automation?: {
      emailNotifications?: boolean;
      webhookUrl?: string;
    };
  };

  // Fields
  fields: BuilderField[];
  activeFieldId: string | null;

  // History for undo/redo
  history: BuilderField[][];
  historyIndex: number;

  // UI state
  previewMode: boolean;
  isDirty: boolean;

  // Actions
  resetStore: () => void;
  setFormMeta: (meta: Partial<Pick<FormBuilderState, "formId" | "title" | "description" | "layoutType" | "themeConfig" | "status" | "formSlug" | "formSettings" | "isDirty">>) => void;
  setFields: (fields: BuilderField[]) => void;
  addField: (type: FieldType, atIndex?: number) => void;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<BuilderField>) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  setActiveField: (id: string | null) => void;
  duplicateField: (id: string) => void;
  setPreviewMode: (mode: boolean) => void;
  publishForm: () => void;
  undo: () => void;
  redo: () => void;
  loadForm: (formId: string, title: string, description: string, fields: BuilderField[]) => void;
  reset: () => void;
}

const defaultFieldLabels: Record<string, string> = {
  short_text: "Short Text",
  long_text: "Long Text",
  email: "Email Address",
  phone: "Phone Number",
  number: "Number",
  date: "Date",
  time: "Time",
  rating: "Rating",
  stars: "Star Rating",
  slider: "Slider",
  file_upload: "File Upload",
  signature: "Signature",
  checkbox: "Checkbox",
  radio: "Radio Choice",
  dropdown: "Dropdown",
  multiple_select: "Multiple Select",
  image_choice: "Image Choice",
  video_choice: "Video Choice",
  matrix: "Matrix",
  ranking: "Ranking",
  likert: "Likert Scale",
  nps: "Net Promoter Score",
  address: "Address",
  url: "Website URL",
  social_links: "Social Links",
};

function generateId() {
  return crypto.randomUUID();
}

function pushHistory(state: FormBuilderState): Partial<FormBuilderState> {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push([...state.fields]);
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
    isDirty: true,
  };
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  formId: null,
  formSlug: null,
  title: "Untitled Form",
  description: "",
  layoutType: "single_page",
  status: "Draft",
  themeConfig: {
    fontFamily: "font-sans",
    backgroundColor: "bg-white",
    accentColor: "border-[#8B5CF6]",
    borderStyle: "border-2",
    rounded: "rounded-2xl",
    formBgColor: "#FCFBF8",
    fieldBgColor: "#ffffff",
    textColor: "#333333",
    glassmorphism: false,
    backgroundPattern: "solid"
  },
  formSettings: {
    successMessage: "Thank You! 🎉 Your response has been successfully recorded.",
    allowMultipleResponses: true,
    isAcceptingResponses: true,
  },
  fields: [],
  activeFieldId: null,
  history: [[]],
  historyIndex: 0,
  previewMode: false,
  isDirty: false,

  resetStore: () => set({
    formId: null,
    formSlug: null,
    title: "Untitled Form",
    description: "",
    layoutType: "single_page",
    status: "Draft",
    themeConfig: {
      fontFamily: "font-sans",
      backgroundColor: "bg-white",
      accentColor: "border-[#8B5CF6]",
      borderStyle: "border-2",
      rounded: "rounded-2xl",
      formBgColor: "#FCFBF8",
      fieldBgColor: "#ffffff",
      textColor: "#333333",
      glassmorphism: false,
      backgroundPattern: "solid"
    },
    formSettings: {
      successMessage: "Thank You! 🎉 Your response has been successfully recorded.",
      allowMultipleResponses: true,
      isAcceptingResponses: true,
    },
    fields: [],
    activeFieldId: null,
    history: [[]],
    historyIndex: 0,
    previewMode: false,
    isDirty: false,
  }),

  setFormMeta: (meta) => set((state) => ({ ...state, isDirty: true, ...meta })),

  setFields: (fields) =>
    set((state) => {
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), fields];
      return {
        fields,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      };
    }),

  addField: (type, atIndex) =>
    set((state) => {
      const newField: BuilderField = {
        id: generateId(),
        type,
        label: defaultFieldLabels[type] || "New Field",
        required: false,
        order: atIndex ?? state.fields.length,
        width: "full",
        config: {},
        validation: {},
      };

      const fields = [...state.fields];
      const insertAt = atIndex ?? fields.length;
      fields.splice(insertAt, 0, newField);

      // Reorder
      const reordered = fields.map((f, i) => ({ ...f, order: i }));

      return {
        fields: reordered,
        activeFieldId: newField.id,
        ...pushHistory({ ...state, fields: reordered }),
      };
    }),

  removeField: (id) =>
    set((state) => {
      const fields = state.fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i }));
      return {
        fields,
        activeFieldId: state.activeFieldId === id ? null : state.activeFieldId,
        ...pushHistory({ ...state, fields }),
      };
    }),

  updateField: (id, updates) =>
    set((state) => {
      const fields = state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
      return { fields, ...pushHistory({ ...state, fields }) };
    }),

  reorderFields: (fromIndex, toIndex) =>
    set((state) => {
      const fields = [...state.fields];
      const [removed] = fields.splice(fromIndex, 1);
      if (removed) {
        fields.splice(toIndex, 0, removed);
      }
      const reordered = fields.map((f, i) => ({ ...f, order: i }));
      return { fields: reordered, ...pushHistory({ ...state, fields: reordered }) };
    }),

  setActiveField: (id) => set({ activeFieldId: id }),

  duplicateField: (id) =>
    set((state) => {
      const field = state.fields.find((f) => f.id === id);
      if (!field) return {};
      const idx = state.fields.findIndex((f) => f.id === id);
      const dup: BuilderField = { ...field, id: generateId(), label: `${field.label} (copy)` };
      const fields = [...state.fields];
      fields.splice(idx + 1, 0, dup);
      const reordered = fields.map((f, i) => ({ ...f, order: i }));
      return { fields: reordered, activeFieldId: dup.id, ...pushHistory({ ...state, fields: reordered }) };
    }),

  setPreviewMode: (mode) => set({ previewMode: mode }),

  publishForm: () => 
    set((state) => {
      // Simulate saving to database
      console.log("Publishing form to database...", {
        title: state.title,
        fields: state.fields,
        theme: state.themeConfig
      });
      return { status: "Published", isDirty: false };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex <= 0) return {};
      const newIndex = state.historyIndex - 1;
      return { fields: state.history[newIndex] || [], historyIndex: newIndex };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return {};
      const newIndex = state.historyIndex + 1;
      return { fields: state.history[newIndex] || [], historyIndex: newIndex };
    }),

  loadForm: (formId, title, description, fields) =>
    set({ formId, title, description, fields, history: [fields], historyIndex: 0, isDirty: false, activeFieldId: null }),

  reset: () =>
    set({ formId: null, title: "Untitled Form", description: "", fields: [], history: [[]], historyIndex: 0, isDirty: false, activeFieldId: null, previewMode: false }),
}));
