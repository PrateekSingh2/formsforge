import type { BuilderField } from "@/stores/form-builder-store";
import type { FieldType } from "@formforge/types";

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  themeConfig?: {
    fontFamily: string;
    backgroundColor: string;
    accentColor: string;
    borderStyle: string;
    rounded: string;
    formBgColor: string;
    fieldBgColor: string;
    textColor: string;
    glassmorphism?: boolean;
    backgroundPattern?: string;
  };
  fields: Partial<BuilderField>[];
}

function genId() {
  return crypto.randomUUID();
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "contact-form",
    title: "Contact Us",
    description: "A clean and simple contact form for customer inquiries.",
    icon: "✉️",
    themeConfig: {
      fontFamily: "font-sans",
      backgroundColor: "bg-white",
      accentColor: "border-[#8B5CF6]",
      borderStyle: "border-2",
      rounded: "rounded-2xl",
      formBgColor: "#FCFBF8",
      fieldBgColor: "#ffffff",
      textColor: "#333333",
    },
    fields: [
      { id: genId(), type: "short_text" as FieldType, label: "Full Name", required: true, width: "full", config: { placeholder: "Jane Doe" } },
      { id: genId(), type: "email" as FieldType, label: "Email Address", required: true, width: "full", config: { placeholder: "jane@example.com" } },
      { id: genId(), type: "short_text" as FieldType, label: "Subject", required: false, width: "full", config: { placeholder: "What is this regarding?" } },
      { id: genId(), type: "long_text" as FieldType, label: "Message", required: true, width: "full", config: { placeholder: "Type your message here..." } },
    ]
  },
  {
    id: "feedback-form",
    title: "Customer Feedback",
    description: "Gather valuable feedback from your recent customers.",
    icon: "⭐",
    themeConfig: {
      fontFamily: "font-comic",
      backgroundColor: "bg-white",
      accentColor: "border-[#F59E0B]",
      borderStyle: "border-2",
      rounded: "rounded-xl",
      formBgColor: "#FEF3C7",
      fieldBgColor: "#ffffff",
      textColor: "#333333",
    },
    fields: [
      { id: genId(), type: "stars" as FieldType, label: "How would you rate your experience?", required: true, width: "full", config: { maxRating: 5 } },
      { id: genId(), type: "radio" as FieldType, label: "Would you recommend us to a friend?", required: true, width: "full", config: { options: ["Definitely", "Maybe", "Not really"] } },
      { id: genId(), type: "long_text" as FieldType, label: "How can we improve?", required: false, width: "full", config: { placeholder: "Any specific suggestions?" } },
    ]
  },
  {
    id: "event-registration",
    title: "Event Registration",
    description: "Register attendees for your upcoming event.",
    icon: "🎫",
    themeConfig: {
      fontFamily: "font-balsamiq",
      backgroundColor: "bg-[#111827]",
      accentColor: "border-[#34D399]",
      borderStyle: "border-2",
      rounded: "rounded-[2rem]",
      formBgColor: "#111827",
      fieldBgColor: "#1F2937",
      textColor: "#F9FAFB",
    },
    fields: [
      { id: genId(), type: "short_text" as FieldType, label: "Attendee Name", required: true, width: "full", config: {} },
      { id: genId(), type: "email" as FieldType, label: "Email Address", required: true, width: "full", config: {} },
      { id: genId(), type: "multiple_select" as FieldType, label: "Which sessions will you attend?", required: false, width: "full", config: { options: ["Morning Keynote", "Afternoon Workshop", "Networking Dinner"] } },
      { id: genId(), type: "radio" as FieldType, label: "Dietary Restrictions", required: true, width: "full", config: { options: ["None", "Vegetarian", "Vegan", "Gluten-Free"] } },
    ]
  },
  {
    id: "tech-ticket",
    title: "Tech Troubleshooting",
    description: "A comprehensive IT support ticket form for technical issues.",
    icon: "💻",
    themeConfig: {
      fontFamily: "font-mono",
      backgroundColor: "bg-transparent",
      accentColor: "border-emerald-500",
      borderStyle: "border border-emerald-500/50",
      rounded: "rounded-sm",
      formBgColor: "#0f172a",
      fieldBgColor: "rgba(15, 23, 42, 0.8)",
      textColor: "#10b981",
      glassmorphism: true,
      backgroundPattern: "programmer"
    },
    fields: [
      { id: genId(), type: "dropdown" as FieldType, label: "Issue Category", required: true, width: "full", config: { options: ["Hardware", "Software", "Network", "Access/Permissions"] } },
      { id: genId(), type: "short_text" as FieldType, label: "System OS", required: true, width: "half", config: { placeholder: "e.g. Windows 11, macOS" } },
      { id: genId(), type: "short_text" as FieldType, label: "Error Code", required: false, width: "half", config: { placeholder: "If applicable" } },
      { id: genId(), type: "long_text" as FieldType, label: "Steps to Reproduce", required: true, width: "full", config: { placeholder: "1. Open app\n2. Click button..." } },
      { id: genId(), type: "file_upload" as FieldType, label: "Screenshot", required: false, width: "full", config: {} },
    ]
  },
  {
    id: "patient-intake",
    title: "Patient Intake Form",
    description: "Secure, structured medical history collection for new patients.",
    icon: "🩺",
    themeConfig: {
      fontFamily: "font-sans",
      backgroundColor: "bg-blue-50",
      accentColor: "border-red-500",
      borderStyle: "border-2",
      rounded: "rounded-2xl",
      formBgColor: "#f0f9ff",
      fieldBgColor: "rgba(255, 255, 255, 0.9)",
      textColor: "#0f172a",
      glassmorphism: true,
      backgroundPattern: "healthcare"
    },
    fields: [
      { id: genId(), type: "short_text" as FieldType, label: "Full Legal Name", required: true, width: "full", config: {} },
      { id: genId(), type: "date" as FieldType, label: "Date of Birth", required: true, width: "half", config: {} },
      { id: genId(), type: "phone" as FieldType, label: "Emergency Contact", required: true, width: "half", config: {} },
      { id: genId(), type: "checkboxes" as FieldType, label: "Existing Conditions", required: false, width: "full", config: { options: ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "None"] } },
      { id: genId(), type: "long_text" as FieldType, label: "Current Medications", required: false, width: "full", config: { placeholder: "List all current medications..." } },
      { id: genId(), type: "signature" as FieldType, label: "Patient Signature", required: true, width: "full", config: {} },
    ]
  },
  {
    id: "course-registration",
    title: "Course Registration",
    description: "Enrollment form for students selecting their semester classes.",
    icon: "📚",
    themeConfig: {
      fontFamily: "font-comic",
      backgroundColor: "bg-orange-50",
      accentColor: "border-orange-500",
      borderStyle: "border-4",
      rounded: "rounded-xl",
      formBgColor: "#fff7ed",
      fieldBgColor: "rgba(255,255,255,0.95)",
      textColor: "#9a3412",
      glassmorphism: true,
      backgroundPattern: "education"
    },
    fields: [
      { id: genId(), type: "short_text" as FieldType, label: "Student ID", required: true, width: "half", config: {} },
      { id: genId(), type: "dropdown" as FieldType, label: "Year", required: true, width: "half", config: { options: ["Freshman", "Sophomore", "Junior", "Senior"] } },
      { id: genId(), type: "multiple_select" as FieldType, label: "Select Electives", required: true, width: "full", config: { options: ["Creative Writing 101", "Intro to Psychology", "Data Structures", "World History"] } },
      { id: genId(), type: "long_text" as FieldType, label: "Special Accommodations", required: false, width: "full", config: {} },
    ]
  },
  {
    id: "playful-rsvp",
    title: "Party RSVP",
    description: "A fun and interactive party invitation response form.",
    icon: "🎉",
    themeConfig: {
      fontFamily: "font-balsamiq",
      backgroundColor: "bg-[#fdf4ff]",
      accentColor: "border-[#d946ef]",
      borderStyle: "border-2 border-dashed",
      rounded: "rounded-full",
      formBgColor: "#fdf4ff",
      fieldBgColor: "rgba(255,255,255,0.6)",
      textColor: "#701a75",
      glassmorphism: true,
      backgroundPattern: "playful"
    },
    fields: [
      { id: genId(), type: "short_text" as FieldType, label: "What's your name?", required: true, width: "full", config: {} },
      { id: genId(), type: "radio" as FieldType, label: "Are you coming?", required: true, width: "full", config: { options: ["Heck yes! 🥳", "Sadly no 😭", "Maybe? 🤔"] } },
      { id: genId(), type: "number" as FieldType, label: "+1s", required: false, width: "half", config: {} },
      { id: genId(), type: "short_text" as FieldType, label: "Song Request", required: false, width: "full", config: { placeholder: "What gets you dancing?" } },
    ]
  }
];
