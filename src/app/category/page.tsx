import { redirect } from 'next/navigation';

// /category redirects to the AI category as a sensible default
export default function CategoryIndexPage() {
  redirect('/category/ai');
}
