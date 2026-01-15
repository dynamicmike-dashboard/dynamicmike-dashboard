import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically send users to your main site's dashboard
  redirect('/admin/dashboard/breath-of-life');
}