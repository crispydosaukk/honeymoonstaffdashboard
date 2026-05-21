import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0d1f45] to-[#071428] text-white font-sans flex flex-col">
      <div className="p-6 bg-[#0b1a3d]/80 border-b border-white/10 backdrop-blur-md flex items-center gap-4">
        <Link to="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-2xl font-bold">Terms and Conditions</h1>
      </div>
      <div className="flex-1 max-w-4xl mx-auto w-full p-8 text-white/80 leading-relaxed">
        <h2 className="text-3xl font-bold mb-6 text-white">Terms and Conditions for HoneyMoonStaff</h2>
        <p className="mb-4 text-white/60">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">1. Agreement to Terms</h3>
            <p>By accessing or using the HoneyMoonStaff application, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you must not use our application. These terms apply to all users, staff, and administrators of the system.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">2. User Accounts and Security</h3>
            <p>To use this application, you must be provided with an account by Honeymoon Events Ltd. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account or security breach.</p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">3. Acceptable Use Policy</h3>
            <p>You agree to use the application only for its intended purpose of managing staff, attendance, and internal business operations for Honeymoon Events Ltd. You must not:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-white/70">
              <li>Use the application for any unlawful purpose or in violation of any local, state, or international law.</li>
              <li>Attempt to gain unauthorized access to any portion of the application, other accounts, or networks connected to the application.</li>
              <li>Upload or transmit viruses, malware, or any other malicious code.</li>
              <li>Interfere with or disrupt the performance or security of the application.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">4. Intellectual Property Rights</h3>
            <p>The application, including its original content, features, and functionality, are and will remain the exclusive property of Honeymoon Events Ltd and its licensors. The application is protected by copyright, trademark, and other laws.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">5. Termination</h3>
            <p>We reserve the right to terminate or suspend your account and bar access to the application immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the application will immediately cease.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">6. Limitation of Liability</h3>
            <p>In no event shall Honeymoon Events Ltd, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the application.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-white">7. Contact Information</h3>
            <p>For any questions regarding these Terms and Conditions, please contact us:</p>
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
