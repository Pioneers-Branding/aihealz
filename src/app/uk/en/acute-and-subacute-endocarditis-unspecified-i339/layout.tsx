import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Acute & Subacute Endocarditis (I33.9) | Symptoms, Diagnosis & NHS Treatment | AIHealz UK',
    description:
        'Complete guide to acute and subacute infective endocarditis (ICD-10 I33.9) in the UK — causative organisms, Modified Duke Criteria, antibiotic regimens (NICE NG63), surgical indications, complications, and prevention.',
    keywords:
        'infective endocarditis UK, bacterial endocarditis NHS, endocarditis symptoms, Duke Criteria, IE treatment antibiotics, endocarditis surgery, prosthetic valve endocarditis, NICE NG63 endocarditis, I33.9 ICD-10, cardiology UK',
    openGraph: {
        title: 'Acute & Subacute Endocarditis — Complete NHS Guide | AIHealz UK',
        description:
            'Comprehensive guide: causative organisms, Modified Duke Criteria, NICE-compliant antibiotic therapy, surgical indications, and prevention of infective endocarditis.',
        url: 'https://aihealz.com/uk/en/acute-and-subacute-endocarditis-unspecified-i339',
        siteName: 'AIHealz',
        type: 'article',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1200&q=80',
                width: 1200,
                height: 630,
                alt: 'Cardiologist performing echocardiography to detect heart valve vegetation in endocarditis',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Acute & Subacute Endocarditis (I33.9) | AIHealz UK',
        description:
            'Symptoms, Duke Criteria, antibiotic regimens, surgical indications, and prevention of infective endocarditis.',
    },
    alternates: {
        canonical: 'https://aihealz.com/uk/en/acute-and-subacute-endocarditis-unspecified-i339',
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
