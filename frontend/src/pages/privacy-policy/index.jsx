import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0d1f45] to-[#071428] text-white font-sans flex flex-col">
      <div className="p-6 bg-[#0b1a3d]/80 border-b border-white/10 backdrop-blur-md flex items-center gap-4">
        <Link to="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </div>
      <div className="flex-1 max-w-4xl mx-auto w-full p-8 text-white/80 leading-relaxed">
        <h2 className="text-3xl font-bold mb-6 text-white">Privacy Policy for HoneyMoonStaff</h2>
        <p className="mb-4 text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">1. Introduction</h3>
            <p>Welcome to the HoneyMoonStaff application, provided by Honeymoon Events Ltd. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you use our mobile application and website, and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. Data We Collect</h3>
            <p>We collect and process the following data to provide and improve our services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-white/70">
              <li><strong>Identity & Contact Data:</strong> Includes first name, last name, email address, and telephone numbers used for account creation and communication.</li>
              <li><strong>Usage Data:</strong> Information about how you use our application, including timestamps, interactions, and attendance records (if applicable).</li>
              <li><strong>Device Data:</strong> Includes internet protocol (IP) address, browser/device type and version, and operating system information for security and troubleshooting.</li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">3. How We Use Your Data</h3>
            <p>Your personal data is used exclusively to operate the HoneyMoonStaff application and fulfill our business obligations:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-white/70">
              <li>To manage your account, authenticate your login, and provide appropriate access permissions.</li>
              <li>To process internal staff scheduling, attendance, and business administration.</li>
              <li>To communicate important notices, updates, or support responses to you.</li>
              <li>To ensure the security of our application and prevent fraudulent activities.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">4. Data Sharing and Security</h3>
            <p>We do not sell your personal data to third parties. Data may be shared with trusted third-party service providers (such as cloud hosting or database providers like Google Firebase) solely for the purpose of operating the application. We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">5. Account Deletion and Data Retention</h3>
            <p>You have the right to request the deletion of your account and associated personal data. To initiate an account deletion request, please contact your system administrator or email us directly at the contact details provided below. We retain personal data only for as long as necessary to fulfill the purposes we collected it for, including any legal, accounting, or reporting requirements.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">6. Changes to this Policy</h3>
            <p>We may update our Privacy Policy from time to time to reflect changes in our practices or legal obligations. We will notify you of any significant changes by updating the "Last updated" date of this Privacy Policy.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">7. Contact Details</h3>
            <p>If you have any questions about this privacy policy, your rights, or our privacy practices, please contact us at:</p>
            <ul className="mt-2 space-y-1 text-white/70">
              <li><strong>Company:</strong> Honeymoon Events Ltd</li>
              <li><strong>Email:</strong> admin@honeymoonevents.uk</li>
              <li><strong>Phone:</strong> 07774981575</li>
              <li><strong>Address:</strong> 50-52 Bell Rd, Hounslow TW3 3PB, UK</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
