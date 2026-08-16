// src/components/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ChevronRight } from "lucide-react";

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

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] font-body">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-6 font-mono">
          <Link to="/" className="hover:text-[var(--color-brand-green)] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-text-primary)]">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--color-tint-green)] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[var(--color-brand-green)]" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xl text-[var(--color-text-primary)] mb-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">
              Last updated: June 2025 &nbsp;·&nbsp; Applies to all VegBazar users
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[12px] p-6">

          <Section title="1. Introduction">
            <p>VegBazar (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform at vegbazar.store.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-[var(--color-text-primary)]">Account Information:</strong> Name, email address, phone number, and password (stored securely hashed).</p>
            <p><strong className="text-[var(--color-text-primary)]">Delivery Information:</strong> Delivery addresses you save for placing orders.</p>
            <p><strong className="text-[var(--color-text-primary)]">Order Data:</strong> Items ordered, order history, payment method used, and transaction status.</p>
            <p><strong className="text-[var(--color-text-primary)]">Device &amp; Usage Data:</strong> IP address, browser type, device type, pages visited, and time spent — collected via server logs.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Process and deliver your orders</li>
              <li>Send order confirmations and delivery updates via SMS or email</li>
              <li>Manage your VegBazar Wallet and cashback rewards</li>
              <li>Provide customer support</li>
              <li>Improve our platform and personalize your experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Data Sharing">
            <p>We do <strong className="text-[var(--color-text-primary)]">not</strong> sell your personal data. We may share data with:</p>
            <p><strong className="text-[var(--color-text-primary)]">Payment Processors:</strong> Razorpay processes payments on our behalf under their own privacy policy.</p>
            <p><strong className="text-[var(--color-text-primary)]">Delivery Partners:</strong> Your name and address may be shared with our delivery staff to fulfil orders.</p>
            <p><strong className="text-[var(--color-text-primary)]">Legal Requirements:</strong> We may disclose data to authorities when required by law.</p>
          </Section>

          <Section title="5. Cookies &amp; Local Storage">
            <p>We use browser local storage to keep you logged in and to cache session data (e.g., product lists) for a faster experience. We do not use third-party advertising cookies.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your account and order data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us.</p>
          </Section>

          <Section title="7. Security">
            <p>We implement industry-standard security measures including HTTPS, hashed passwords, and HTTP-only refresh token cookies. However, no method of transmission over the internet is 100% secure.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Under applicable Indian data protection law, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent for marketing communications</li>
            </ul>
            <p>To exercise these rights, email us at <a href="mailto:info.vegbazar@gmail.com" className="text-[var(--color-brand-green)] underline underline-offset-2">info.vegbazar@gmail.com</a>.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Our Service is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us immediately.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes by posting a notice on our platform. Continued use of the Service after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>For privacy-related questions or concerns, reach us at:</p>
            <p><a href="mailto:info.vegbazar@gmail.com" className="text-[var(--color-brand-green)] underline underline-offset-2">info.vegbazar@gmail.com</a> &nbsp;|&nbsp; <a href="tel:+918780564115" className="text-[var(--color-brand-green)] underline underline-offset-2">+91-8780564115</a></p>
            <p>Vashiyar Valley, Valsad, Gujarat 396007</p>
          </Section>

        </div>

        {/* Footer nav */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--color-text-muted)] font-body">
          <Link to="/terms" className="hover:text-[var(--color-brand-green)] transition-colors">Terms &amp; Conditions</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-[var(--color-brand-green)] transition-colors">Support &amp; Help</Link>
          <span>·</span>
          <Link to="/" className="hover:text-[var(--color-brand-green)] transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
