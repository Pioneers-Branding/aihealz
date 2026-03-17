import { redirect } from 'next/navigation';

/**
 * Provider Index Page
 *
 * Redirects to the provider login page.
 * Users who are already authenticated will be redirected to dashboard from there.
 */
export default function ProviderIndexPage() {
    redirect('/provider/login');
}
