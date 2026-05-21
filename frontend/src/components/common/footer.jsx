import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-transparent mt-auto py-6">
      <div className="mx-auto max-w-7xl px-4 flex justify-center text-xs sm:text-sm text-white/60">
        <div className="flex items-center gap-3">
          <span>© {new Date().getFullYear()} HoneyMoonStaff. All rights reserved.</span>
          <span className="hidden sm:inline">|</span>
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="hidden sm:inline">|</span>
          <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <span className="hidden sm:inline">|</span>
          <Link to="/contact-and-support" className="hover:text-white transition-colors">Contact & Support</Link>
        </div>
      </div>
    </footer>
  );
}

