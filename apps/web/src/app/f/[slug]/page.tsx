"use client";

import React, { useEffect, useState, useRef } from "react";
import { fetchFormBySlug, submitFormResponse } from "@/lib/supabase-actions";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Star, Upload, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/builder/animated-background";
import { useAuth } from "@/providers/auth-provider";

// ============================================================================
// Interactive Signature Pad
// ============================================================================
function SignaturePad({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#8B5CF6";
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate the scale difference between actual size and CSS size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return { 
      x: (clientX - rect.left) * scaleX, 
      y: (clientY - rect.top) * scaleY 
    };
  };

  const startDrawing = (e: any) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    const coords = getCoordinates(e);
    if (!coords) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white group hover:border-[#8B5CF6] transition-colors">
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full h-32 cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      {value ? (
        <button 
          type="button" 
          onClick={clear}
          className="absolute top-2 right-2 px-3 py-1 bg-gray-100 text-xs font-bold text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors shadow-sm"
        >
          Clear Signature
        </button>
      ) : (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-300 font-comic group-hover:text-gray-400 transition-colors">
          <span className="font-bold text-sm">✍️ Draw your signature here</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Field renderer for all supported types
// ============================================================================
function FieldInput({
  field,
  value,
  onChange,
  textColor,
}: {
  field: any;
  value: any;
  onChange: (val: any) => void;
  textColor: string;
}) {
  const baseInput =
    "w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#8B5CF6] transition-colors font-comic text-[#333333] placeholder-gray-400";
  const opts: string[] = (field.config?.options as string[]) || ["Option 1", "Option 2"];

  switch (field.type) {
    case "short_text":
      return (
        <input
          type="text"
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.config?.placeholder || "Type your answer here..."}
          className={baseInput}
        />
      );

    case "long_text":
      return (
        <textarea
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.config?.placeholder || "Type your answer here..."}
          rows={4}
          className={`${baseInput} resize-y`}
        />
      );

    case "email":
      return (
        <input
          type="email"
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.config?.placeholder || "name@example.com"}
          className={baseInput}
        />
      );

    case "phone":
      return (
        <input
          type="tel"
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.config?.placeholder || "+1 234 567 8900"}
          className={baseInput}
        />
      );

    case "number":
      return (
        <input
          type="number"
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.config?.placeholder || "0"}
          className={baseInput}
        />
      );

    case "url":
      return (
        <input
          type="url"
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.config?.placeholder || "https://example.com"}
          className={baseInput}
        />
      );

    case "date":
      return (
        <input
          type="date"
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      );

    case "time":
      return (
        <input
          type="time"
          required={field.required}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
        />
      );

    case "dropdown":
      return (
        <div className="relative">
          <select
            required={field.required}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInput} appearance-none pr-10`}
          >
            <option value="">Select an option...</option>
            {opts.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      );

    case "radio":
      return (
        <div className="space-y-3">
          {opts.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                required={field.required}
                className="w-5 h-5 text-[#8B5CF6] border-2 border-gray-300 focus:ring-[#8B5CF6]"
              />
              <span className="font-comic text-[#333333] group-hover:text-[#8B5CF6] transition-colors">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "checkbox":
    case "checkboxes":
      return (
        <div className="space-y-3">
          {opts.map((opt, i) => {
            const selected: string[] = value || [];
            const isChecked = selected.includes(opt);
            return (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      onChange(selected.filter((v) => v !== opt));
                    } else {
                      onChange([...selected, opt]);
                    }
                  }}
                  className="w-5 h-5 rounded text-[#8B5CF6] border-2 border-gray-300 focus:ring-[#8B5CF6]"
                />
                <span className="font-comic text-[#333333] group-hover:text-[#8B5CF6] transition-colors">{opt}</span>
              </label>
            );
          })}
        </div>
      );

    case "multiple_select":
      return (
        <div className="space-y-3">
          {opts.map((opt, i) => {
            const selected: string[] = value || [];
            const isChecked = selected.includes(opt);
            return (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      onChange(selected.filter((v) => v !== opt));
                    } else {
                      onChange([...selected, opt]);
                    }
                  }}
                  className="w-5 h-5 rounded text-[#8B5CF6] border-2 border-gray-300 focus:ring-[#8B5CF6]"
                />
                <span className="font-comic text-[#333333] group-hover:text-[#8B5CF6] transition-colors">{opt}</span>
              </label>
            );
          })}
        </div>
      );

    case "rating":
    case "stars": {
      const maxRating = field.config?.maxRating || 5;
      const currentVal = Number(value) || 0;
      return (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star === currentVal ? 0 : star)}
              className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 text-xl transition-all hover:scale-110 ${star <= currentVal
                ? "border-[#8B5CF6] bg-[#E9D5FF] grayscale-0"
                : "border-gray-200 bg-white grayscale"
                }`}
            >
              ⭐
            </button>
          ))}
        </div>
      );
    }

    case "slider": {
      const min = field.config?.sliderMin ?? 0;
      const max = field.config?.sliderMax ?? 100;
      const step = field.config?.sliderStep ?? 1;
      const current = value ?? min;
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-[#8B5CF6]"
          />
          <div className="flex justify-between text-sm text-gray-500 font-comic font-bold">
            <span>{min}</span>
            <span className="text-[#8B5CF6] text-base font-bold">{current}</span>
            <span>{max}</span>
          </div>
        </div>
      );
    }

    case "nps": {
      const currentNps = Number(value);
      return (
        <div className="space-y-3">
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 11 }, (_, i) => i).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={`w-10 h-10 rounded-lg border-2 font-bold font-comic text-sm transition-all hover:scale-105 ${currentNps === num
                  ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                  : "border-gray-200 bg-white text-[#333333] hover:border-[#8B5CF6]"
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-comic">
            <span>{field.config?.npsLeftLabel || "Not likely"}</span>
            <span>{field.config?.npsRightLabel || "Very likely"}</span>
          </div>
        </div>
      );
    }

    case "ranking": {
      const rankOpts: string[] = value || [...opts];
      return (
        <div className="space-y-2">
          {rankOpts.map((opt, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="font-comic text-[#333333] flex-1">{opt}</span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => {
                    const newRank = [...rankOpts];
                    [newRank[i - 1], newRank[i]] = [newRank[i], newRank[i - 1]];
                    onChange(newRank);
                  }}
                  className="text-gray-400 hover:text-[#8B5CF6] disabled:opacity-30 text-xs leading-none"
                >▲</button>
                <button
                  type="button"
                  disabled={i === rankOpts.length - 1}
                  onClick={() => {
                    const newRank = [...rankOpts];
                    [newRank[i], newRank[i + 1]] = [newRank[i + 1], newRank[i]];
                    onChange(newRank);
                  }}
                  className="text-gray-400 hover:text-[#8B5CF6] disabled:opacity-30 text-xs leading-none"
                >▼</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "address":
      return (
        <div className="space-y-3">
          <input type="text" placeholder="Street address" onChange={(e) => onChange({ ...(value || {}), street: e.target.value })} className={baseInput} />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="City" onChange={(e) => onChange({ ...(value || {}), city: e.target.value })} className={baseInput} />
            <input type="text" placeholder="State / Province" onChange={(e) => onChange({ ...(value || {}), state: e.target.value })} className={baseInput} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="ZIP / Postal code" onChange={(e) => onChange({ ...(value || {}), zip: e.target.value })} className={baseInput} />
            <input type="text" placeholder="Country" onChange={(e) => onChange({ ...(value || {}), country: e.target.value })} className={baseInput} />
          </div>
        </div>
      );

    case "social_links":
      return (
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <span className="w-8 flex justify-center text-xl">🐦</span>
            <input type="url" placeholder="Twitter / X profile URL" onChange={(e) => onChange({ ...(value || {}), twitter: e.target.value })} className={baseInput} />
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-8 flex justify-center text-xl">💼</span>
            <input type="url" placeholder="LinkedIn profile URL" onChange={(e) => onChange({ ...(value || {}), linkedin: e.target.value })} className={baseInput} />
          </div>
          <div className="flex gap-3 items-center">
            <span className="w-8 flex justify-center text-xl">📸</span>
            <input type="url" placeholder="Instagram profile URL" onChange={(e) => onChange({ ...(value || {}), instagram: e.target.value })} className={baseInput} />
          </div>
        </div>
      );

    case "file_upload":
      return (
        <label className="block">
          <div className="h-32 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 font-comic cursor-pointer hover:border-[#8B5CF6] hover:bg-[#F5F3FF] transition-colors">
            <Upload className="w-6 h-6 mb-2 text-[#8B5CF6]" />
            <span className="font-bold text-sm">Click to upload a file</span>
            <span className="text-xs mt-1">Max 10MB</span>
          </div>
          <input
            type="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file.name);
            }}
          />
        </label>
      );

    case "signature":
      return <SignaturePad value={value || ""} onChange={(val) => onChange(val)} />;

    case "matrix": {
      const rows: string[] = field.config?.rows || ["Row 1", "Row 2"];
      const cols: string[] = field.config?.columns || ["Col 1", "Col 2", "Col 3"];
      const matrixVal = value || {};
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-comic">
            <thead>
              <tr>
                <th className="py-2 pr-4"></th>
                {cols.map((col, ci) => (
                  <th key={ci} className="py-2 px-3 text-center text-[#333333] font-bold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="py-3 pr-4 font-bold text-[#333333]">{row}</td>
                  {cols.map((col, ci) => (
                    <td key={ci} className="py-3 px-3 text-center">
                      <input
                        type="radio"
                        name={`${field.id}_${row}`}
                        checked={matrixVal[row] === col}
                        onChange={() => onChange({ ...matrixVal, [row]: col })}
                        className="w-4 h-4 text-[#8B5CF6] border-gray-300 focus:ring-[#8B5CF6]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    default:
      return (
        <p className="text-sm text-gray-400 italic font-comic">
          Field type <strong>{field.type}</strong> is not yet supported in the preview.
        </p>
      );
  }
}

function linkify(text: string) {
  if (!text) return "";
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#8B5CF6] hover:underline">${url}</a>`;
  });
}

// ============================================================================
// Main Published Form View
// ============================================================================
export default function PublicFormView() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { user } = useAuth();
  const [respondentEmail, setRespondentEmail] = useState<string>("");
  const [respondentName, setRespondentName] = useState<string>("");
  const [hasEnteredEmail, setHasEnteredEmail] = useState<boolean>(false);

  // Auto-fill if user is logged in
  useEffect(() => {
    if (user) {
      if (user.email && !respondentEmail) setRespondentEmail(user.email);
      if (user.displayName && !respondentName) setRespondentName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    async function loadForm() {
      try {
        const { form, fields } = await fetchFormBySlug(slug);
        setFormData(form);
        setFields(fields);

        if (typeof window !== "undefined") {
          const submitted = localStorage.getItem(`form_submitted_${slug}`);
          if (submitted) setAlreadySubmitted(true);
        }
      } catch (err: any) {
        console.error(err);
        setErrorDetails(err.message || String(err));
        toast.error("Failed to load form. It may not exist.");
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setSubmitting(true);
    try {
      const payload = { ...responses };
      if (respondentName) payload.__respondent_name = respondentName;
      
      await submitFormResponse(formData.id, payload, respondentEmail);
      setSuccess(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(`form_submitted_${slug}`, "true");
      }
      toast.success("Response submitted successfully!");
    } catch {
      toast.error("Failed to submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  if (!formData && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8] font-comic">
        <div className="text-center">
          <p className="text-6xl mb-4">🕵️‍♂️</p>
          <h1 className="text-2xl font-bold text-[#333333]">Form not found!</h1>
          <p className="text-gray-500 mt-2">This link may be invalid or the form has been removed.</p>
          {errorDetails && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-sans border border-red-200 inline-block max-w-md text-left">
              <strong>Error Details:</strong> {errorDetails}
            </div>
          )}
        </div>
      </div>
    );
  }

  const theme = formData?.settings?.themeConfig || {};
  const settings = formData?.settings?.formSettings || {
    successMessage: "Thank You! 🎉 Your response has been recorded.",
    allowMultipleResponses: true,
    isAcceptingResponses: true,
  };

  if (settings.isAcceptingResponses === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF8] font-comic p-4 text-center">
        <p className="text-6xl mb-4">⛔</p>
        <h1 className="text-3xl font-bold text-[#333333] mb-2 font-balsamiq">Form Closed</h1>
        <p className="text-gray-500">This form is currently not accepting new responses. Kindly contact to publisher</p>
      </div>
    );
  }

  if (alreadySubmitted && settings.allowMultipleResponses === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF8] font-comic p-4 text-center">
        <p className="text-6xl mb-4">✋</p>
        <h1 className="text-3xl font-bold text-[#333333] mb-2 font-balsamiq">Already responded!</h1>
        <p className="text-gray-500">This form only allows one submission per person.</p>
      </div>
    );
  }

  const textColor = theme.textColor || "#333333";
  const formBg = theme.formBgColor || "#FCFBF8";
  const fieldBg = theme.fieldBgColor || "#ffffff";
  const fontClass = theme.fontFamily || "font-comic";
  const roundedClass = theme.rounded || "rounded-2xl";
  const borderClass = theme.borderStyle || "border-2";
  const isGlass = theme.glassmorphism;

  // Email Gate
  if (!hasEnteredEmail && !success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${theme.backgroundColor || "bg-[#FCFBF8]"}`}>
        <AnimatedBackground pattern={theme.backgroundPattern || "solid"} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-md p-8 rounded-2xl border-2 border-[#333333] shadow-[8px_8px_0px_#333333]"
        >
          <div className="w-16 h-16 bg-[#F5F3FF] border-2 border-[#8B5CF6] rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="text-2xl">👋</span>
          </div>
          
          <h2 className="text-2xl font-balsamiq font-bold text-center text-[#333333] mb-2">Welcome!</h2>
          <p className="text-gray-500 font-comic text-center text-sm mb-8">
            Before we begin, please provide your email address to continue to the form.
          </p>

          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(respondentEmail)) {
              toast.error("Please enter a valid email address.");
              return;
            }
            if (respondentEmail) setHasEnteredEmail(true); 
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold font-comic text-[#333333] mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-[#8B5CF6] font-comic transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold font-comic text-[#333333] mb-2">Email Address *</label>
                <input 
                  type="email" 
                  required
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-[#8B5CF6] font-comic transition-colors"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full py-3 bg-[#8B5CF6] text-white rounded-xl border-2 border-[#333333] font-balsamiq font-bold text-lg shadow-[4px_4px_0px_#333333] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#333333] transition-all"
              >
                Continue to Form
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  const pattern = theme.backgroundPattern;

  // Background styling mapping
  const bgStyles: any = {};
  if (["programmer", "healthcare", "education", "playful"].includes(pattern || "")) {
    // These themes are handled by AnimatedBackground but we need a base color
    if (pattern === "programmer") bgStyles.backgroundColor = "#0f172a";
    if (pattern === "healthcare") bgStyles.backgroundColor = "#f0f9ff";
    if (pattern === "education") bgStyles.backgroundColor = "#fff7ed";
    if (pattern === "playful") bgStyles.backgroundColor = "#fdf4ff";
  } else if (pattern === "aurora") {
    bgStyles.background = "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)";
    bgStyles.backgroundAttachment = "fixed";
  } else if (pattern === "zen") {
    bgStyles.background = "linear-gradient(120deg, #ecfccb 0%, #d9f99d 100%)";
    bgStyles.backgroundAttachment = "fixed";
  } else if (pattern === "cybergrid") {
    bgStyles.backgroundColor = "#000000";
    bgStyles.backgroundImage = "linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)";
    bgStyles.backgroundSize = "20px 20px";
    bgStyles.backgroundPosition = "center center";
    bgStyles.backgroundAttachment = "fixed";
  } else if (pattern === "neo-grid") {
    bgStyles.backgroundColor = formBg;
    bgStyles.backgroundImage = "radial-gradient(#000 1px, transparent 1px)";
    bgStyles.backgroundSize = "20px 20px";
    bgStyles.backgroundAttachment = "fixed";
  } else {
    bgStyles.backgroundColor = formBg;
  }

  // Parse accent color for inline styles if needed
  const accentHex = theme.accentColor?.includes('[') 
    ? theme.accentColor.replace('border-[', '').replace(']', '') 
    : theme.accentColor?.replace('border-', '') || '#8B5CF6';

  return (
    <div
      className={`min-h-screen py-16 px-4 transition-colors ${fontClass} relative`}
      style={bgStyles}
    >
      <AnimatedBackground pattern={pattern || "solid"} />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Header */}
              <div className="mb-10 text-center">
                <h1
                  className="text-4xl font-bold mb-3 font-balsamiq"
                  style={{ color: textColor }}
                >
                  {formData.title || "Untitled Form"}
                </h1>
                {formData.description && (
                  <div 
                    className="text-base opacity-70 whitespace-pre-line" 
                    style={{ color: textColor }}
                    dangerouslySetInnerHTML={{ __html: linkify(formData.description) }}
                  />
                )}
              </div>

              {/* Fields */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map((field, index) => {
                  const isFocused = focusedField === field.id;
                  const isDimmed = focusedField !== null && focusedField !== field.id;

                  // Statement is a display-only block
                  if (field.type === "statement") {
                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5 }}
                        className={`p-8 ${roundedClass} ${borderClass} transition-all duration-500 ${isDimmed ? "opacity-40" : ""} ${isGlass ? "backdrop-blur-xl border-white/20" : "border-gray-200"}`}
                        style={{ backgroundColor: isGlass ? fieldBg.replace('rgb', 'rgba').replace(')', ', 0.6)').replace('a(a(', 'a(') : fieldBg }}
                      >
                        <h2 className="text-2xl font-bold font-balsamiq" style={{ color: textColor }}>
                          {field.label}
                        </h2>
                        {field.description && (
                          <p className="mt-2 opacity-80 text-base" style={{ color: textColor }}>
                            {field.description}
                          </p>
                        )}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4 }}
                      onFocus={() => setFocusedField(field.id)}
                      onBlur={(e) => {
                        // Only remove focus if the new focus target is outside this field
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setFocusedField(null);
                        }
                      }}
                      tabIndex={-1}
                      className={`p-8 ${roundedClass} ${borderClass} transition-all duration-500 relative ${
                        isFocused ? "scale-[1.02] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] z-10" : 
                        isDimmed ? "opacity-40 scale-[0.98] z-0" : "shadow-sm z-0"
                      } ${isGlass ? "backdrop-blur-xl border-white/20" : "border-gray-200"}`}
                      style={{ 
                        backgroundColor: isGlass ? fieldBg.replace('rgb', 'rgba').replace(')', ', 0.6)').replace('a(a(', 'a(') : fieldBg,
                        borderColor: isFocused ? accentHex : undefined
                      }}
                    >
                      <label
                        className={`block text-xl font-bold mb-2 font-balsamiq transition-colors`}
                        style={{ color: isFocused ? accentHex : textColor }}
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.description && (
                        <p className="text-sm mb-3 opacity-60" style={{ color: textColor }}>
                          {field.description}
                        </p>
                      )}
                      <FieldInput
                        field={field}
                        value={responses[field.id]}
                        onChange={(val) =>
                          setResponses((prev) => ({ ...prev, [field.id]: val }))
                        }
                        textColor={textColor}
                      />
                    </motion.div>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-4 bg-[#8B5CF6] border-2 border-[#333333] rounded-2xl font-balsamiq text-lg font-bold text-white shadow-[4px_4px_0px_#333333] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#333333] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Form ✨"}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-[#333333] p-12 rounded-[2rem] shadow-[8px_8px_0px_#8B5CF6] text-center"
            >
              <CheckCircle2 className="w-20 h-20 text-[#34D399] mx-auto mb-6" />
              <h2 className="text-4xl font-bold font-balsamiq text-[#333333] mb-4">Success! 🎉</h2>
              <p className="text-lg text-gray-500 font-bold mb-8 whitespace-pre-line">
                {settings.successMessage}
              </p>
              {settings.allowMultipleResponses && (
                <button
                  onClick={() => {
                    setSuccess(false);
                    setResponses({});
                  }}
                  className="text-[#8B5CF6] font-bold hover:underline font-comic"
                >
                  Submit another response
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 font-comic">
            Powered by <span className="font-balsamiq text-[#8B5CF6]">FormForge</span>
          </p>
        </div>
      </div>
    </div>
  );
}
