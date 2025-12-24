import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Custom slug logic
function generateSlug(title) {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "") // keep letters, numbers, spaces
    .trim();

  const spaceCount = (clean.match(/ /g) || []).length;

  if (spaceCount === 0) return clean;
  if (spaceCount === 1) return clean.replace(" ", "-");
  return clean.replace(/ /g, "_");
}

export async function handler(event) {
  try {
    const { title, contentType, usageType } = JSON.parse(event.body);

    if (!title || !contentType || !usageType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: title, contentType, or usageType" })
      };
    }

    const slug = generateSlug(title);

    const { data, error } = await supabase
      .from("pages")
      .insert({
        title,
        slug,
        content_type: contentType,
        usage_type: usageType
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Supabase insert failed",
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || null
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: `/l/${slug}`,
        page: data[0]
      })
    };

  } catch (err) {
    console.error("Function execution error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Function failed",
        message: err.message,
        stack: err.stack
      })
    };
  }
}
