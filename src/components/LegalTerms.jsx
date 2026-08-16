// src/components/TermsAndConditions.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FileText, ChevronRight } from "lucide-react";

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-display font-semibold text-base text-[var(--color-text-primary)] mb-3 pb-2 border-b border-[var(--color-border)]">
      {title}
    </h2>
    <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed space-y-2 font-body">
      {children}
    </div>
  </div>
);

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] font-body">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-6 font-mono">
          <Link to="/" className="hover:text-[var(--color-brand-green)] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text-primary)]">Terms &amp; Conditions</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--color-tint-green)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[var(--color-brand-green)]" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xl text-[var(--color-text-primary)] mb-1">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              Last updated: June 2025 &nbsp;·&nbsp; Effective for all users of VegBazar
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-6">

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using VegBazar (&ldquo;the Service&rdquo;) at vegbazar.store, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, you may not use our Service.</p>
          </Section>

          <Section title="2. Service Description">
            <p>VegBazar is an online platform that enables customers in Valsad, Gujarat to order fresh vegetables and bundles directly from local farms for home delivery.</p>
            <p>We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.</p>
          </Section>

          <Section title="3. Eligibility">
            <p>You must be at least 18 years of age to use this Service. By creating an account, you represent that you meet this requirement.</p>
          </Section>

          <Section title="4. Orders &amp; Payments">
            <p><strong className="text-[var(--color-text-primary)]">Order Placement:</strong> All orders are subject to availability. We reserve the right to cancel or limit quantities of any order.</p>
            <p><strong className="text-[var(--color-text-primary)]">Pricing:</strong> Prices are listed in Indian Rupees (₹) and are subject to change without notice. The price at the time of order confirmation is the price you will pay.</p>
            <p><strong className="text-[var(--color-text-primary)]">Payment:</strong> We accept online payments via Razorpay and VegBazar Wallet. By providing payment details, you authorize us to charge the total amount.</p>
            <p><strong className="text-[var(--color-text-primary)]">Delivery Charges:</strong> A delivery fee of ₹20 applies to orders below ₹269. Orders of ₹269 or above qualify for free delivery.</p>
          </Section>

          <Section title="5. Delivery Policy">
            <p>Deliveries are available Monday through Sunday, 7:00 AM to 11:00 AM, within our serviceable areas (Valsad, Abrama, Tithal Road, Halar, Parnera Pardi).</p>
            <p>Delivery times are estimates and may vary due to traffic, weather, or high demand. VegBazar is not liable for delays beyond our control.</p>
          </Section>

          <Section title="6. Cancellations &amp; Refunds">
            <p>Orders may be cancelled before they are dispatched for delivery. Once dispatched, cancellations will not be accepted.</p>
            <p>Refunds for valid cancellations or quality complaints will be processed to your original payment method or VegBazar Wallet within 3–7 business days.</p>
          </Section>

          <Section title="7. Product Quality">
            <p>We strive to deliver the freshest produce. In case of quality issues, please contact us within 2 hours of delivery with photos. We will offer a replacement or refund at our discretion.</p>
          </Section>

          <Section title="8. User Account">
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
            <p>We reserve the right to terminate accounts that violate these Terms or engage in fraudulent activity.</p>
          </Section>

          <Section title="9. Prohibited Conduct">
            <p>You agree not to: use the Service for any unlawful purpose; attempt to gain unauthorized access to any part of the Service; post false, misleading, or defamatory content; or interfere with the proper functioning of the platform.</p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>To the fullest extent permitted by law, VegBazar and its owners shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </Section>

          <Section title="11. Governing Law">
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Valsad, Gujarat.</p>
          </Section>

          <Section title="12. Contact">
            <p>For questions about these Terms, contact us at <a href="mailto:info.vegbazar@gmail.com" className="text-[var(--color-brand-green)] underline underline-offset-2">info.vegbazar@gmail.com</a> or call <a href="tel:+918780564115" className="text-[var(--color-brand-green)] underline underline-offset-2">+91-8780564115</a>.</p>
          </Section>

        </div>

        {/* Footer nav */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-text-muted)] font-body">
          <Link to="/privacy-policy" className="hover:text-[var(--color-brand-green)] transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-[var(--color-brand-green)] transition-colors">Support &amp; Help</Link>
          <span>·</span>
          <Link to="/" className="hover:text-[var(--color-brand-green)] transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
