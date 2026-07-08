import { Link } from 'react-router-dom';
import Logo from '../../../components/ui/Logo';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-zinc-900 text-zinc-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Logo/>
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