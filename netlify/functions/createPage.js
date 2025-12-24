import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// YOUR custom slug logic
function generateSlug(title) {
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "") // keep letters, numbers, spaces
    .trim();

  const spaceCount = (clean.match(/ /g) || []).length;

  if (spaceCount === 0) {
    // no spaces → fivenightsatfredies
    return clean;
  }

  if (spaceCount === 1) {
    // one space → five-nights
    return clean.replace(" ", "-");
  }

  // two or more spaces → five_nights_at_freddies
  return clean.replace(/ /g, "_");
}

export async function handler(event) {
  const { title, contentType, usageType } = JSON.parse(event.body);

  if (!title) {
    return {
      statusCode: 400,
      body: "Title is required"
    };
  }

  const slug = generateSlug(title);

  const { error } = await supabase.from("pages").insert({
    title,
    slug,
    content_type: contentType,
    usage_type: usageType
  });

  if (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      url: `/l/${slug}`
    })
  };
}
