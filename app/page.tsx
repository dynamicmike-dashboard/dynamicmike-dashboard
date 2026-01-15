import { redirect } from 'next/navigation';

export default function RootPage() {
  // If someone hits the main URL, send them to the admin area
  redirect('/admin/dashboard/breath-of-life'); 
}