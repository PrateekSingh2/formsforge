import { supabase } from "./supabase";
import type { BuilderField } from "@/stores/form-builder-store";

export async function saveFormToDatabase(
  firebaseUid: string | null,
  formId: string | null,
  formTitle: string,
  formDescription: string,
  layoutType: string,
  themeConfig: any,
  formSettings: any,
  fields: BuilderField[]
) {
  try {
    let userId = null;

    if (firebaseUid) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('firebase_uid', firebaseUid)
        .single();
        
      if (!userError && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      const dummyUid = firebaseUid || `mock-uid-${Date.now()}`;
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          firebase_uid: dummyUid,
          email: `${dummyUid}@example.com`,
          name: "Test User",
        })
        .select('id')
        .single();

      if (insertError) {
        console.error("Failed to provision test user:", insertError);
        throw new Error("Could not link form to a user.");
      }
      userId = newUser.id;
    }

    const settingsObj = { themeConfig, formSettings };
    let formRecord;

    if (formId) {
      // Update existing form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .update({
          title: formTitle,
          description: formDescription,
          status: 'published',
          layout_type: layoutType,
          settings: settingsObj,
        })
        .eq('id', formId)
        .select('id, slug')
        .single();

      if (formError || !form) {
        console.error("Form update error:", formError);
        throw new Error("Failed to update form metadata.");
      }
      formRecord = form;

      // Delete existing fields so we can recreate them clean (easier than complex diffing)
      await supabase.from('form_fields').delete().eq('form_id', formId);
    } else {
      // Insert new form
      const slug = Math.random().toString(36).substring(2, 10);
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: userId,
          title: formTitle,
          description: formDescription,
          slug: slug,
          status: 'published',
          layout_type: layoutType,
          settings: settingsObj,
        })
        .select('id, slug')
        .single();

      if (formError || !form) {
        console.error("Form insert error:", formError);
        throw new Error("Failed to save form metadata.");
      }
      formRecord = form;
    }

    // 4. Insert into form_fields table
    const fieldsToInsert = fields.map((f, index) => ({
      form_id: formRecord.id,
      type: f.type,
      label: f.label,
      description: f.description || null,
      order: index,
      required: f.required,
      config: f.config || {},
      validation: f.validation || {},
      width: f.width || 'full',
    }));

    if (fieldsToInsert.length > 0) {
      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error("Fields insert error:", fieldsError);
        throw new Error("Failed to save form fields.");
      }
    }

    return { slug: formRecord.slug, formId: formRecord.id };

  } catch (error) {
    console.error("saveFormToDatabase failed:", error);
    throw error;
  }
}

export async function fetchFormBySlug(slug: string) {
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .single();

  if (formError || !form) throw new Error("Form not found");

  // Increment view count in background (fire and forget)
  supabase.rpc('increment_form_views', { form_slug: slug }).then(({ error }) => {
    if (error) console.error("Failed to increment views:", error);
  });

  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', form.id)
    .order('order', { ascending: true });

  if (fieldsError) throw new Error("Could not load form fields");

  return { form, fields };
}

export async function fetchFormById(id: string) {
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (formError || !form) throw new Error("Form not found");

  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', form.id)
    .order('order', { ascending: true });

  if (fieldsError) throw new Error("Could not load form fields");

  return { form, fields };
}

export async function submitFormResponse(formId: string, responseData: any, respondentEmail?: string) {
  const { error } = await supabase
    .from('submissions')
    .insert({
      form_id: formId,
      data: responseData,
      status: 'completed',
      respondent_email: respondentEmail || null,
    });

  if (error) throw new Error("Failed to submit form");
  return true;
}

export async function fetchUserForms(firebaseUid: string | null) {
  if (!firebaseUid) return [];

  // Find the user ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .single();

  if (userError || !user) return [];

  // Fetch their forms along with submissions count
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('*, submissions(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (formsError) throw new Error("Could not load forms");

  // Format the data to match the dashboard's expected structure
  return forms.map((form: any) => ({
    id: form.id,
    slug: form.slug,
    title: form.title,
    status: form.status === 'published' ? 'Published' : 'Draft',
    responses: form.submissions?.[0]?.count || 0,
    views: form.views || 0,
    lastUpdated: new Date(form.updated_at || form.created_at).toLocaleDateString(),
    theme: form.settings?.themeConfig?.fontFamily || form.settings?.fontFamily || "Scribble"
  }));
}

export async function fetchFormSubmissions(formId: string) {
  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        id,
        started_at,
        data
      `)
      .eq('form_id', formId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    
    // Get form fields to map responses to actual questions
    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('id, label, type')
      .eq('form_id', formId)
      .order('order', { ascending: true });
      
    if (fieldsError) throw fieldsError;

    // Get form metadata for views (fallback if views column doesn't exist)
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    // Don't throw on form metadata error just to allow submissions to load
    // in case the views column hasn't been added to the database yet.
    return { 
      submissions: submissions || [], 
      fields: fields || [], 
      form: form || { title: "Form Analytics", views: 0 } 
    };
  } catch (error) {
    console.error("fetchFormSubmissions failed:", error);
    throw error;
  }
}

export async function deleteForm(formId: string) {
  // Supabase RLS policies should allow the owner to delete, and cascade delete should handle form_fields and submissions
  // If not cascade, we need to delete fields and submissions first. 
  // Let's assume cascade is set up or we can delete them explicitly if not.
  const { error: fieldsError } = await supabase.from('form_fields').delete().eq('form_id', formId);
  const { error: subsError } = await supabase.from('submissions').delete().eq('form_id', formId);
  
  const { error } = await supabase.from('forms').delete().eq('id', formId);
  if (error) throw new Error("Failed to delete form");
  return true;
}

export async function fetchAudienceData(firebaseUid: string | null) {
  if (!firebaseUid) return [];

  // Find the user ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .single();

  if (userError || !user) return [];

  // Fetch their forms
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('id')
    .eq('user_id', user.id);

  if (formsError || !forms || forms.length === 0) return [];

  const formIds = forms.map((f: any) => f.id);

  // Fetch all submissions for these forms
  const { data: submissions, error: subsError } = await supabase
    .from('submissions')
    .select('data, started_at, respondent_email')
    .in('form_id', formIds)
    .order('started_at', { ascending: false });

  if (subsError || !submissions) return [];

  const audiences = new Map();
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700"
  ];

  submissions.forEach((sub: any) => {
    let email = sub.respondent_email || "";
    let name = "Anonymous";
    
    // Explicitly grab name if injected from the Welcome Gate
    if (sub.data && sub.data.__respondent_name) {
      name = sub.data.__respondent_name;
    }
    
    // We still search data for fallback name or fallback email
    for (const [key, value] of Object.entries(sub.data || {})) {
      if (typeof value === "string") {
        if (!email && value.includes("@") && value.includes(".") && !value.includes(" ")) {
          email = value.toLowerCase().trim();
        } else if (value.length >= 2 && value.length <= 40 && value.includes(" ") && !value.includes("@")) {
          // Heuristic: looks like a name
          if (name === "Anonymous") name = value;
        }
      }
    }

    if (email) {
      if (!audiences.has(email)) {
        // Format relative time (basic)
        let dateStr = sub.started_at;
        
        // Supabase often returns 'timestamp without time zone' strings like "2024-06-14T10:00:00"
        // If it doesn't end with Z or have a + offset, force it to be evaluated as UTC.
        if (dateStr && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
          dateStr += 'Z';
        }
        
        let lastActiveStr = "Recently";
        let diffDays = 0;
        
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));
            
            if (diffDays > 0) lastActiveStr = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
            else if (diffHours > 0) lastActiveStr = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
            else if (diffMins > 0) lastActiveStr = `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
            else lastActiveStr = "Just now";
          }
        }

        // Calculate a random color consistently based on email
        let hash = 0;
        for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
        const color = colors[Math.abs(hash) % colors.length];

        audiences.set(email, {
          id: email,
          name: name,
          email: email,
          forms: 1,
          lastActive: lastActiveStr,
          status: diffDays > 30 ? "Inactive" : "Active",
          avatar: name !== "Anonymous" ? name.substring(0, 2).toUpperCase() : email.substring(0, 2).toUpperCase(),
          color: color
        });
      } else {
        const existing = audiences.get(email);
        existing.forms += 1;
      }
    }
  });

  return Array.from(audiences.values());
}
