import React, { useState } from 'react';
import { Landmark, FileCheck, ShieldAlert, CheckCircle2, User, Send } from 'lucide-react';

interface GovServicesPageProps {
  onFormSubmitted?: (data: Record<string, any>) => void;
}

export const GovServicesPage: React.FC<GovServicesPageProps> = ({ onFormSubmitted }) => {
  const [formData, setFormData] = useState({
    certType: 'degree',
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    deliveryMethod: 'digital',
    agreed: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      alert('Please check the statutory declaration checkbox.');
      return;
    }
    const ref = `GOV-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(ref);
    setIsSubmitted(true);
    if (onFormSubmitted) {
      onFormSubmitted({ ...formData, refNumber: ref });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto text-[#2B2825]">
      {/* Header */}
      <div className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0E8A9A] text-white flex items-center justify-center font-bold">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#2B2825]">
                GovDirect — Citizen Registry Portal
              </h2>
              <span className="text-[10px] font-semibold bg-[#0E8A9A]/10 text-[#0E8A9A] px-2 py-0.5 rounded-full">
                Public Gateway
              </span>
            </div>
            <p className="text-xs text-[#6E6860]">
              Official public service requests and civil certificate verification
            </p>
          </div>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-[#FFFDF9] border border-[#4A7C59]/30 rounded-xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2B2825]">
            Application Successfully Lodged!
          </h3>
          <p className="text-xs text-[#6E6860] max-w-md mx-auto">
            Your application for the <strong>{formData.certType.toUpperCase()} Certificate</strong> has been registered with the Civil Registry Office.
          </p>
          <div className="p-3 bg-[#F7F3EC] rounded-lg inline-block border border-[#E5DEC9] text-xs font-mono">
            Tracking Reference: <strong className="text-[#0E8A9A]">{submittedRef}</strong>
          </div>
          <div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-3 px-4 py-2 rounded-lg bg-[#2B2825] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Start New Request
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#FFFDF9] border border-[#E5DEC9] rounded-xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#2B2825]">
              Certificate Application & Record Verification
            </h3>
            <p className="text-xs text-[#6E6860] mt-0.5">
              Complete the required citizen information below or use OneStep to autofill.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Certificate Type */}
            <div className="space-y-1">
              <label htmlFor="gov-cert-type" className="text-xs font-semibold text-[#2B2825] block">
                Certificate Type *
              </label>
              <select
                id="gov-cert-type"
                value={formData.certType}
                onChange={(e) => setFormData({ ...formData, certType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#0E8A9A]"
              >
                <option value="degree">Degree & Academic Attestation</option>
                <option value="birth">Birth Registry Record</option>
                <option value="residency">Permanent Residency Certificate</option>
                <option value="police">Good Standing / Clearance Certificate</option>
              </select>
            </div>

            {/* Full Legal Name */}
            <div className="space-y-1">
              <label htmlFor="gov-full-name" className="text-xs font-semibold text-[#2B2825] block">
                Full Legal Name *
              </label>
              <input
                id="gov-full-name"
                type="text"
                required
                placeholder="e.g. Ananya Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#0E8A9A]"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="gov-email" className="text-xs font-semibold text-[#2B2825] block">
                Email Address *
              </label>
              <input
                id="gov-email"
                type="email"
                required
                placeholder="citizen@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#0E8A9A]"
              />
            </div>

            {/* Mobile / Phone Number */}
            <div className="space-y-1">
              <label htmlFor="gov-phone" className="text-xs font-semibold text-[#2B2825] block">
                Mobile Telephone *
              </label>
              <input
                id="gov-phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#0E8A9A]"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label htmlFor="gov-dob" className="text-xs font-semibold text-[#2B2825] block">
                Date of Birth *
              </label>
              <input
                id="gov-dob"
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#0E8A9A]"
              />
            </div>

            {/* Delivery Method (Radio) */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#2B2825] block">
                Delivery Preference *
              </span>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-[#2B2825] cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="digital"
                    checked={formData.deliveryMethod === 'digital'}
                    onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                    className="accent-[#0E8A9A]"
                  />
                  <span>Digital Secure PDF</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#2B2825] cursor-pointer">
                  <input
                    type="radio"
                    name="delivery"
                    value="postal"
                    checked={formData.deliveryMethod === 'postal'}
                    onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
                    className="accent-[#0E8A9A]"
                  />
                  <span>Physical Postal Courier</span>
                </label>
              </div>
            </div>
          </div>

          {/* Postal Address */}
          <div className="space-y-1">
            <label htmlFor="gov-address" className="text-xs font-semibold text-[#2B2825] block">
              Residential Address
            </label>
            <textarea
              id="gov-address"
              rows={2}
              placeholder="House/Apt, Street, City, Pincode"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#E5DEC9] bg-[#F7F3EC] text-xs text-[#2B2825] focus:outline-none focus:ring-1 focus:ring-[#0E8A9A]"
            />
          </div>

          {/* Statutory Declaration Checkbox */}
          <div className="p-3.5 bg-[#F7F3EC]/80 border border-[#E5DEC9] rounded-lg">
            <label className="flex items-start gap-2.5 text-xs text-[#2B2825] cursor-pointer">
              <input
                type="checkbox"
                required
                id="gov-agree-checkbox"
                checked={formData.agreed}
                onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                className="mt-0.5 accent-[#0E8A9A]"
              />
              <span className="leading-snug">
                I hereby declare under penalty of perjury that the submitted information is true, accurate, and corresponds to my legal identity records.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E5DEC9]">
            <span className="text-[11px] text-[#6E6860]">
              Fields marked with * are mandatory
            </span>
            <button
              type="submit"
              id="gov-submit-btn"
              className="px-5 py-2.5 rounded-lg bg-[#0E8A9A] hover:bg-[#0C7380] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Certificate Application</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
