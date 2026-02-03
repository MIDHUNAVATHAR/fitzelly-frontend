import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-[#00ffd5] rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl">F</div>
                            <span className="text-xl font-bold text-white tracking-tight">FITZELLY</span>
                        </div>
                        <p className="text-sm">
                            Complete gym management software to streamline operations and grow your business.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-[#00ffd5] transition-colors">Features</a></li>
                            <li><a href="#pricing" className="hover:text-[#00ffd5] transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/contact" className="hover:text-[#00ffd5] transition-colors">Contact Us</Link></li>
                            <li><Link to="/help" className="hover:text-[#00ffd5] transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/privacy" className="hover:text-[#00ffd5] transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-[#00ffd5] transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center">
                    &copy; {new Date().getFullYear()} Fitzelly. All rights reserved.
                </div>
            </div>
        </footer>
    );
}