// src/components/Footer.jsx — Rebuilt with v2 1px hairline cards, Fraunces titles, and Inter typography
import React from 'react';
import { MapPin, Phone, Mail, Globe, Clock, Truck, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[var(--color-bg-surface)] pt-12 pb-24 md:pb-8 border-t border-[var(--color-border)] mt-auto font-body transition-colors duration-150">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                    {/* Brand & Contact Column */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-display font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                            <img src="/vegbazar.svg" alt="VegBazar Logo" className="h-8 w-auto" />
                            <span>VegBazar</span>
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed font-body mb-4">
                            Fresh vegetables delivered directly to your doorstep in Valsad. Quality and freshness guaranteed.
                        </p>

                        <div className="space-y-2.5">
                            <div className="flex items-start gap-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                <MapPin className="w-4 h-4 text-[var(--color-brand-green)] mt-0.5 shrink-0" />
                                <span className="text-xs">Vashiyar Valley, Valsad, Gujarat 396007</span>
                            </div>

                            <a href="tel:+918780564115" className="flex items-center gap-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                <Phone className="w-4 h-4 text-[var(--color-brand-green)] shrink-0" />
                                <span className="text-xs font-mono">+91-8780564115</span>
                            </a>

                            <a href="mailto:info.vegbazar@gmail.com" className="flex items-center gap-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                <Mail className="w-4 h-4 text-[var(--color-brand-green)] shrink-0" />
                                <span className="text-xs font-mono">info.vegbazar@gmail.com</span>
                            </a>

                            <a href="https://vegbazar.store" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                <Globe className="w-4 h-4 text-[var(--color-brand-green)] shrink-0" />
                                <span className="text-xs font-mono">https://vegbazar.store</span>
                            </a>
                        </div>
                    </div>

                    {/* Service Areas */}
                    <div>
                        <h3 className="text-sm font-display font-semibold text-[var(--color-text-primary)] mb-3 pb-1 border-b border-[var(--color-border)] inline-block">
                            Service Areas
                        </h3>
                        <ul className="space-y-2">
                            {['Valsad', 'Abrama', 'Tithal Road', 'Halar', 'Parnera Pardi'].map((area) => (
                                <li key={area} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    <span className="w-1.5 h-1.5 bg-[var(--color-brand-green)] rounded-full" />
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Delivery Info */}
                    <div>
                        <h3 className="text-sm font-display font-semibold text-[var(--color-text-primary)] mb-3 pb-1 border-b border-[var(--color-border)] inline-block">
                            Delivery Information
                        </h3>
                        <div className="space-y-3">
                            <div className="bg-[var(--color-bg-app)] p-3.5 rounded-[10px] border border-[var(--color-border)]">
                                <div className="flex items-center gap-2 mb-1.5 text-[var(--color-brand-green)] font-medium text-xs">
                                    <Clock className="w-4 h-4" />
                                    Delivery Hours
                                </div>
                                <p className="text-[var(--color-text-secondary)] text-xs ml-6 font-mono">
                                    Monday - Sunday<br />
                                    7:00 AM - 11:00 AM
                                </p>
                            </div>

                            <div className="bg-[var(--color-brand-green)] p-3.5 rounded-[10px] text-white">
                                <div className="flex items-center gap-2 font-display font-semibold text-xs mb-1">
                                    <Truck className="w-4 h-4" />
                                    Free Delivery
                                </div>
                                <p className="text-white/90 text-xs ml-6 font-body">
                                    On all orders above <span className="font-mono font-medium text-white">₹269+</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links & Social */}
                    <div>
                        <h3 className="text-sm font-display font-semibold text-[var(--color-text-primary)] mb-3 pb-1 border-b border-[var(--color-border)] inline-block">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 mb-6 text-xs font-body">
                            <li><Link to="/" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] transition-colors">Home</Link></li>
                            <li><Link to="/offers" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] transition-colors">Offers &amp; Baskets</Link></li>
                            <li><Link to="/support" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] transition-colors">Support &amp; Help</Link></li>
                            <li><Link to="/wallet" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] transition-colors">My Wallet</Link></li>
                            <li><Link to="/terms" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] transition-colors">Terms &amp; Conditions</Link></li>
                            <li><Link to="/privacy-policy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] transition-colors">Privacy Policy</Link></li>
                        </ul>

                        <h4 className="text-xs font-display font-semibold text-[var(--color-text-primary)] mb-2.5">Follow Us</h4>
                        <div className="flex gap-2.5">
                            <a href="https://www.facebook.com/vegbazar" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[var(--color-bg-app)] rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="https://www.instagram.com/vegbazar.store" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[var(--color-bg-app)] rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="https://www.twitter.com/vegbazar.store" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[var(--color-bg-app)] rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-brand-green)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-[var(--color-border)] pt-5 text-center text-[var(--color-text-muted)] text-xs font-mono">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 mb-3">
                        <p>© {currentYear} VegBazar. All rights reserved.</p>
                        <span className="hidden md:inline">•</span>
                        <p className="font-body">Made with 💚 in Valsad</p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-3 font-body">
                        <Link to="/terms" className="hover:text-[var(--color-brand-green)] transition-colors">Terms &amp; Conditions</Link>
                        <span>·</span>
                        <Link to="/privacy-policy" className="hover:text-[var(--color-brand-green)] transition-colors">Privacy Policy</Link>
                        <span>·</span>
                        <Link to="/support" className="hover:text-[var(--color-brand-green)] transition-colors">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
