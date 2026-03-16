-- Seed data for todos table
INSERT INTO public.todos (task, completed) VALUES 
  ('Welcome to Local Supabase!', false),
  ('This is a real PostgreSQL database', false),
  ('Your data persists across restarts', true),
  ('Try adding a new task from the frontend', false);

-- Enable RLS policies
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Enable read access for all users" ON public.todos FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.todos FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.todos FOR DELETE USING (true);
