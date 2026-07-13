import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from('todos').select();

  return (
    <div className="p-8 text-white min-h-screen bg-[#02020a] font-sans">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-[#82c8e5] bg-clip-text text-transparent">
        Todos (SSR Server Component)
      </h1>
      {todos && todos.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="text-[#6d8196] hover:text-white transition-colors">
              {todo.name || todo.title || JSON.stringify(todo)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No todos found in your 'todos' table. Add some rows in Supabase to see them here.</p>
      )}
    </div>
  );
}
