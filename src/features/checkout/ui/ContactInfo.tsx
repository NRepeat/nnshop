import React from 'react';

import { User } from 'lucide-react';
import ContactInfoForm from './ContactInfoForm';

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#325039] flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contact Information
          </h1>
          <p className="text-gray-600">Please provide your contact details</p>
        </div>
      </div>

      <ContactInfoForm />
    </div>
  );
}
