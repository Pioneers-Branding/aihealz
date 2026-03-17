'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type FormData = {
    patientName: string;
    condition: string;
    travelDates: string;
    passengers: string;
    accommodation: string;
    assistance: string;
};

export default function MedicalTravelBot() {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        patientName: '',
        condition: '',
        travelDates: '',
        passengers: '1',
        accommodation: 'premium',
        assistance: 'yes'
    });

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generatePDF = () => {
        setIsGenerating(true);
        setTimeout(() => {
            window.print();
            setIsGenerating(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-surface-50 pt-24 pb-16 font-sans">
            <div className="max-w-3xl mx-auto px-6 print:px-0">

                {/* Back Link (Hidden on Print) */}
                <div className="mb-8 print:hidden">
                    <Link href="/medical-travel" className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Medical Travel
                    </Link>
                </div>

                {/* Progress Bar (Hidden on Print) */}
                {step < 4 && (
                    <div className="mb-10 print:hidden">
                        <div className="flex justify-between text-xs font-bold text-surface-400 uppercase tracking-widest mb-3">
                            <span className={step >= 1 ? 'text-primary-600' : ''}>1. Patient</span>
                            <span className={step >= 2 ? 'text-primary-600' : ''}>2. Travel</span>
                            <span className={step >= 3 ? 'text-primary-600' : ''}>3. Stay & Care</span>
                        </div>
                        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
                        </div>
                    </div>
                )}

                {/* Wizard Container (Hidden on Print if step < 4) */}
                {step < 4 ? (
                    <div className="bg-white rounded-[2rem] shadow-xl border border-surface-200 p-8 md:p-12 print:hidden relative overflow-hidden">

                        {/* Interactive Steps */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Patient Details</h1>
                                <p className="text-surface-500 mb-8">Let's start with who needs care and what procedures you are looking for.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-surface-700 uppercase tracking-widest mb-2">Patient Full Name</label>
                                        <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-surface-50 border border-surface-200 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 font-medium" placeholder="E.g., John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-surface-700 uppercase tracking-widest mb-2">Medical Condition or Procedure</label>
                                        <input type="text" name="condition" value={formData.condition} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-surface-50 border border-surface-200 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 font-medium" placeholder="E.g., Knee Replacement, Cardiac Bypass..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Travel Itinerary</h1>
                                <p className="text-surface-500 mb-8">When are you planning to travel and how many people will accompany you?</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-surface-700 uppercase tracking-widest mb-2">Expected Travel Dates</label>
                                        <input type="text" name="travelDates" value={formData.travelDates} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-surface-50 border border-surface-200 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 font-medium" placeholder="E.g., October 2026 or Next Month" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-surface-700 uppercase tracking-widest mb-2">Total Passengers (including patient)</label>
                                        <select name="passengers" value={formData.passengers} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-surface-50 border border-surface-200 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 font-medium appearance-none">
                                            <option value="1">1 (Patient Only)</option>
                                            <option value="2">2 (Patient + 1 Companion)</option>
                                            <option value="3">3 (Patient + 2 Companions)</option>
                                            <option value="4+">4 or more</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Stay & Concierge</h1>
                                <p className="text-surface-500 mb-8">Customize your recovery experience with our premium partners.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-surface-700 uppercase tracking-widest mb-2">Accommodation Preference</label>
                                        <select name="accommodation" value={formData.accommodation} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-surface-50 border border-surface-200 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 font-medium appearance-none">
                                            <option value="premium">5-Star Premium Hotel / Resort</option>
                                            <option value="standard">4-Star Comfort Hotel</option>
                                            <option value="budget">Service Apartment</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-surface-700 uppercase tracking-widest mb-2">Airport Post-Op Assistance?</label>
                                        <select name="assistance" value={formData.assistance} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-surface-50 border border-surface-200 focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 font-medium appearance-none">
                                            <option value="yes">Yes, include wheelchair/ambulance transfers</option>
                                            <option value="no">No, standard airport pickup is fine</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-10 pt-6 border-t border-surface-100 flex items-center justify-between">
                            <button
                                onClick={handlePrev}
                                disabled={step === 1}
                                className={`px-6 py-3 rounded-xl font-bold transition-colors ${step === 1 ? 'opacity-0' : 'text-surface-600 bg-surface-100 hover:bg-surface-200'}`}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={step === 1 && !formData.patientName}
                                className="px-8 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                            >
                                {step === 3 ? 'Generate Estimate PDF' : 'Continue →'}
                            </button>
                        </div>
                    </div>
                ) : (

                    /* =========================================
                       PRINT VISIBLE & ACTIVE DOM PDF ESTIMATE
                       ========================================= */
                    <div className="animate-in fade-in zoom-in-95 duration-500 bg-white shadow-2xl rounded-2xl print:shadow-none print:rounded-none overflow-hidden border border-surface-200 print:border-none p-10 md:p-14 relative print:p-0">

                        {/* Print Action Bar (Hidden on Print) */}
                        <div className="absolute top-6 right-6 flex gap-3 print:hidden">
                            <button onClick={() => setStep(3)} className="px-4 py-2 bg-surface-100 text-surface-600 rounded-lg text-sm font-bold hover:bg-surface-200 transition-colors">
                                Edit
                            </button>
                            <button onClick={generatePDF} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                {isGenerating ? 'Prepping Doc...' : 'Download / Print Form'}
                            </button>
                        </div>

                        {/* Document Header */}
                        <div className="flex justify-between items-start border-b-2 border-primary-600 pb-8 mb-8">
                            <div>
                                <h1 className="text-4xl font-black text-surface-900 tracking-tight">aihealz<span className="text-primary-600">.</span></h1>
                                <p className="text-sm text-surface-500 font-semibold mt-1 uppercase tracking-widest">Medical Travel Concierge</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-surface-900">Official Estimate Sheet</h2>
                                <p className="text-surface-500 text-sm mt-1">Ref ID: {(Math.random() * 100000).toFixed(0)}-{new Date().getFullYear()}</p>
                                <p className="text-surface-500 text-sm mt-0.5">Date: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Patient & Clinical Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Patient Info Block */}
                            <div className="bg-surface-50 rounded-xl p-6 border border-surface-200">
                                <h3 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-4">Patient Profile</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-surface-500 uppercase font-semibold">Primary Patient</p>
                                        <p className="text-lg font-bold text-surface-900">{formData.patientName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-surface-500 uppercase font-semibold">Travel Dates</p>
                                        <p className="text-base font-bold text-surface-900">{formData.travelDates || 'Flexible'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-surface-500 uppercase font-semibold">Total Party Size</p>
                                        <p className="text-base font-bold text-surface-900">{formData.passengers} Passenger(s)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Pathway Block */}
                            <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                                <h3 className="text-xs font-black text-primary-400 uppercase tracking-widest mb-4">Clinical Pathway</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-primary-600 uppercase font-bold">Primary Procedure</p>
                                        <p className="text-xl font-black text-primary-900">{formData.condition || 'Pending Diagnosis'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-primary-600 uppercase font-bold">Success Plan / Prognosis</p>
                                        <p className="text-sm font-semibold text-primary-800">Highly Favorable (Based on AI Similarity Match)</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-primary-600 uppercase font-bold">Estimated Timeline</p>
                                        <p className="text-sm font-semibold text-primary-800">3 Days Hospital + 7 Days Local Recovery</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Cost Breakdown Table */}
                        <div className="mb-10">
                            <h3 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                                Estimated Cost Breakdown (USD)
                                <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">AI Estimate</span>
                            </h3>
                            <div className="rounded-xl border border-surface-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-surface-50 border-b border-surface-200">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Item / Category</th>
                                            <th className="px-6 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">Est. Range</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-200">
                                        <tr className="bg-white">
                                            <td className="px-6 py-4 text-sm font-bold text-surface-900">1. Medical Procedure</td>
                                            <td className="px-6 py-4 text-sm text-surface-600">{formData.condition || 'Pending'} — Surgeon, OT, Anesthesia</td>
                                            <td className="px-6 py-4 text-sm font-black text-primary-600 text-right">$4,500 - $6,000</td>
                                        </tr>
                                        <tr className="bg-surface-50 border-t border-surface-200">
                                            <td className="px-6 py-4 text-sm font-bold text-surface-900">2. Travel & Flights</td>
                                            <td className="px-6 py-4 text-sm text-surface-600">Roundtrip for {formData.passengers} pax + Airport Transfers</td>
                                            <td className="px-6 py-4 text-sm font-black text-primary-600 text-right">$800 - $1,500</td>
                                        </tr>
                                        <tr className="bg-white border-t border-surface-200">
                                            <td className="px-6 py-4 text-sm font-bold text-surface-900">3. Accommodation</td>
                                            <td className="px-6 py-4 text-sm text-surface-600 capitalize">{formData.accommodation} Level — 10 Days Post-Op Stay</td>
                                            <td className="px-6 py-4 text-sm font-black text-primary-600 text-right">$600 - $1,200</td>
                                        </tr>
                                        <tr className="bg-surface-50 border-t border-surface-200">
                                            <td className="px-6 py-4 text-sm font-bold text-surface-900">4. Medical Visa & Legal</td>
                                            <td className="px-6 py-4 text-sm text-surface-600">Fast-track Medical Visa Processing</td>
                                            <td className="px-6 py-4 text-sm font-black text-primary-600 text-right">$150 - $250</td>
                                        </tr>
                                        <tr className="bg-white border-t-2 border-surface-800">
                                            <td className="px-6 py-4 text-sm font-black text-surface-900 uppercase tracking-widest">Total Estimated Package</td>
                                            <td className="px-6 py-4 text-sm text-surface-600">Complete End-to-End Care</td>
                                            <td className="px-6 py-4 text-lg font-black text-emerald-600 text-right">$6,050 - $8,950</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Estimate Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-14">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Disclaimer & Next Steps</p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                This document is an AI-generated preliminary requirement sheet and estimate. Exact medical pricing requires a formal review of recent clinical reports by our board-certified surgeons. Please submit this sheet along with your reports to the concierge desk to lock in your exact quote.
                            </p>
                        </div>

                        {/* Footer / Signature Box */}
                        <div className="flex justify-between items-end border-t border-surface-200 pt-8">
                            <div className="max-w-xs">
                                <p className="text-xs text-surface-400 font-bold mb-1">Generated by</p>
                                <p className="text-sm font-bold text-surface-900">ATZ Medappz Pvt Ltd.</p>
                                <p className="text-xs text-surface-500">84, Supreme Coworks, Sector 32
                                    Gurgaon, Haryana, India</p>
                            </div>
                            <div className="text-center">
                                <div className="w-48 border-b border-surface-400 border-dashed pb-8 mb-2"></div>
                                <p className="text-xs text-surface-400 font-bold">Patient Signature / Authorization</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
