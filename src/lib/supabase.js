import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ifotfrkdjmlzccwczgry.supabase.co";
const supabaseAnonKey = "sb_publishable_x82UZ_ayz_n7W3DLmU40Tw_32lCeiR6";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
