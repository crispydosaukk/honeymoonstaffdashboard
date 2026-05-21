import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function ContactAndSupport() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071428] via-[#0d1f45] to-[#071428] text-white font-sans flex flex-col">
      <div className="p-6 bg-[#0b1a3d]/80 border-b border-white/10 backdrop-blur-md flex items-center gap-4">
        <Link to="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-2xl font-bold">Contact and Support</h1>
      </div>
      <div className="flex-1 max-w-4xl mx-auto w-full p-8 text-white/80 flex items-center justify-center">
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-xl w-full max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Get in Touch</h2>
            <p className="mb-8 text-white/60">We're here to help! Reach out to us through any of the channels below.</p>
            
            <div className="space-y-6 flex flex-col items-center">
                <a href="mailto:admin@honeymoonevents.uk" className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all group">
                    <div className="p-4 bg-[#00f2ff]/10 rounded-full group-hover:scale-110 transition-transform">
                        <Mail className="text-[#00f2ff]" size={28} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm text-white/50 mb-1">Email Us</p>
                        <p className="text-lg font-semibold text-white">admin@honeymoonevents.uk</p>
                    </div>
                </a>

                <a href="tel:07774981575" className="w-full flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-6 transition-all group">
                    <div className="p-4 bg-[#00f2ff]/10 rounded-full group-hover:scale-110 transition-transform">
                        <Phone className="text-[#00f2ff]" size={28} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm text-white/50 mb-1">Call Us</p>
                        <p className="text-lg font-semibold text-white">07774981575</p>
                    </div>
                </a>

                <div className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="p-4 bg-[#00f2ff]/10 rounded-full">
                        <MapPin className="text-[#00f2ff]" size={28} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm text-white/50 mb-1">Visit Us</p>
                        <p className="text-lg font-semibold text-white">50-52 Bell Rd, Hounslow TW3 3PB, UK</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
