import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const requiredUserFields = [
  "SANTINI_ADMIN_EMAIL",
  "SANTINI_ADMIN_PASSWORD",
  "SANTINI_ADMIN_NAME",
  "SANTINI_USER_EMAIL",
  "SANTINI_USER_PASSWORD",
  "SANTINI_USER_NAME",
];

const missingFields = requiredUserFields.filter((field) => !process.env[field]?.trim());

if (missingFields.length) {
  console.error(`Missing required user bootstrap env vars: ${missingFields.join(", ")}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  {
    email: process.env.SANTINI_ADMIN_EMAIL.trim().toLowerCase(),
    password: process.env.SANTINI_ADMIN_PASSWORD,
    displayName: process.env.SANTINI_ADMIN_NAME.trim(),
    isAdmin: true,
  },
  {
    email: process.env.SANTINI_USER_EMAIL.trim().toLowerCase(),
    password: process.env.SANTINI_USER_PASSWORD,
    displayName: process.env.SANTINI_USER_NAME.trim(),
    isAdmin: false,
  },
];

for (const user of users) {
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  const existing = existingUsers.users.find(
    (candidate) => candidate.email?.toLowerCase() === user.email,
  );

  const authUser =
    existing ??
    (
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.displayName,
        },
      })
    ).data.user;

  if (!authUser) {
    throw new Error(`Could not create or load ${user.email}`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: user.displayName,
      is_admin: user.isAdmin,
    })
    .eq("id", authUser.id);

  if (profileError) {
    throw profileError;
  }

  console.log(`Ready: ${user.displayName} (${user.isAdmin ? "admin" : "regular"})`);
}
