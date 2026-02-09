import React from 'react';
import { MapPin, Phone, Mail, Globe, Clock, Truck, Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-[#f0fdf4] to-[#f0fdf4] pt-12 pb-6 border-t border-[#0e540b]/10 mt-auto font-sans">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                    {/* Brand & Contact Column */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#0e540b] flex items-center gap-2">
                            <img src="/vegbazar.svg" alt="VegBazar Logo" className="h-10 w-auto" />
                        </h2>
                        <p className="text-gray-600 text-sm mb-4 font-funnel">
                            Fresh vegetables delivered directly to your doorstep in Valsad. Quality and freshness guaranteed.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-gray-700 hover:text-[#0e540b] transition-colors group">
                                <MapPin className="w-5 h-5 text-[#0e540b] mt-0.5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">Vashiyar Valley, Valsad, Gujarat 396007</span>
                            </div>

                            <a href="tel:+918780564115" className="flex items-center gap-3 text-gray-700 hover:text-[#0e540b] transition-colors group">
                                <Phone className="w-5 h-5 text-[#0e540b] group-hover:scale-110 transition-transform" />
                                <span className="text-sm">+91-8780564115</span>
                            </a>

                            <a href="mailto:info.vegbazar@gmail.com" className="flex items-center gap-3 text-gray-700 hover:text-[#0e540b] transition-colors group">
                                <Mail className="w-5 h-5 text-[#0e540b] group-hover:scale-110 transition-transform" />
                                <span className="text-sm">info.vegbazar@gmail.com</span>
                            </a>

                            <a href="https://vegbazar.store" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-[#0e540b] transition-colors group">
                                <Globe className="w-5 h-5 text-[#0e540b] group-hover:scale-110 transition-transform" />
                                <span className="text-sm">https://vegbazar.store</span>
                            </a>
                        </div>
                    </div>

                    {/* Service Areas */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-[#0e540b]/20 pb-2 inline-block">
                            Service Areas
                        </h3>
                        <ul className="space-y-2">
                            {['Valsad', 'Abrama', 'Tithal Road', 'Halar', 'Parnera Pardi'].map((area) => (
                                <li key={area} className="flex items-center gap-2 text-gray-600 hover:text-[#0e540b] transition-colors">
                                    <span className="w-1.5 h-1.5 bg-[#0e540b] rounded-full"></span>
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Delivery Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-[#0e540b]/20 pb-2 inline-block">
                            Delivery Information
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#0e540b]/10 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2 text-[#0e540b] font-medium">
                                    <Clock className="w-5 h-5" />
                                    Delivery Hours
                                </div>
                                <p className="text-gray-600 text-sm ml-8">
                                    Monday - Sunday<br />
                                    7:00 AM - 11:00 AM
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-[#0e540b] to-[#063a06] p-4 rounded-xl shadow-md text-white transform hover:-translate-y-1 transition-transform duration-300">
                                <div className="flex items-center gap-3 font-bold mb-1">
                                    <Truck className="w-5 h-5 animate-bounce" />
                                    Free Delivery
                                </div>
                                <p className="text-green-50 text-sm ml-8 opacity-90">
                                    On all orders above <span className="font-bold text-white text-base">₹269+</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links & Social */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-[#0e540b]/20 pb-2 inline-block">
                            Quick Links
                        </h3>
                        <ul className="space-y-2 mb-6">
                            <li><Link to="/" className="text-gray-600 hover:text-[#0e540b] transition-colors hover:translate-x-1 inline-block">Home</Link></li>
                            <li><Link to="/offers" className="text-gray-600 hover:text-[#0e540b] transition-colors hover:translate-x-1 inline-block">Offers</Link></li>
                            <li><Link to="/support" className="text-gray-600 hover:text-[#0e540b] transition-colors hover:translate-x-1 inline-block">Support & Help</Link></li>
                            <li><Link to="/wallet" className="text-gray-600 hover:text-[#0e540b] transition-colors hover:translate-x-1 inline-block">My Wallet</Link></li>
                        </ul>

                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Follow Us</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm hover:shadow-md hover:bg-blue-50 transition-all border border-blue-100">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 shadow-sm hover:shadow-md hover:bg-pink-50 transition-all border border-pink-100">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sky-500 shadow-sm hover:shadow-md hover:bg-sky-50 transition-all border border-sky-100">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t font-funnel border-[#0e540b]/20 pt-6 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-center items-center gap-2">
                    <p>© {currentYear} VegBazar. All rights reserved.</p>
                    <span className="hidden md:inline">•</span>
                    <p>Made with 💚 in Valsad</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
