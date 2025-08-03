import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ghbujcapyusvzgtcqdju.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoYnVqY2FweXVzdnpndGNxZGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Nzg5NTMsImV4cCI6MjA2NTU1NDk1M30.ZgzSZvOjxUCK2H_5ujXdDspo88U5VXCUt4c9-RGA74k"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
