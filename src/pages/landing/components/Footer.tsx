import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-zinc-900 text-zinc-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded bg-emerald-400 flex items-center justify-center">
                                <div className="w-5 h-5 text-black">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6M18.65 9.35A9 9 0 1 1 5.35 18.65L18.65 9.35M6.34 17.66l-1.41 1.41" /></svg>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-white tracking-wider">FITZ<span className="text-emerald-400">ELLY</span></span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Complete gym management software to streamline operations and grow your business.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                            <li><Link to="/help" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-900 text-sm text-center text-zinc-500">
                    &copy; {new Date().getFullYear()} Fitzelly. All rights reserved.
                </div>
            </div>
        </footer>
    );
}