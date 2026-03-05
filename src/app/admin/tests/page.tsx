import { redirect } from 'next/navigation';

export default function AdminTestsRedirect() {
    redirect('/admin/diagnostics/tests');
}
