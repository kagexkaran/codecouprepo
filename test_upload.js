import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.storage.from('codecoup').upload('test.json', JSON.stringify({ hello: "world" }), {
    contentType: 'application/json',
    upsert: true
  });
  console.log("UPLOAD:", data, error);
}
test();
