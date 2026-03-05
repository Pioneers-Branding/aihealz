import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'For Doctors | aihealz | Claim Your Free Profile',
    description: 'Join 10,000+ verified doctors on aihealz. Get a free AI-structured profile, receive high-intent patient leads globally, and scale your medical practice.',
    keywords: 'aihealz for doctors, medical marketing, claim doctor profile, patient leads, grow medical practice, AI health directory, telemedicine',
    openGraph: {
        title: 'aihealz For Doctors | Practice Growth OS',
        description: 'Get verified. Get patients. Scale your practice.',
    }
};

export default function ForDoctorsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
