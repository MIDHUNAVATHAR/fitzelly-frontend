import { Check } from 'lucide-react';
import { useState } from 'react';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

export default function Pricing() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  
  const features = [
    "Unlimited clients & trainers",
    "All portal features (Client & Trainer)",
    "GPS check-in/check-out",
    "Equipment slot booking",
    "Automatic notifications",
    "Zelly Exercise Library",
    "BMI calculator & tracking",
    "Weekly exercise plans",
    "Revenue analytics dashboard",
    "Personal training subscriptions",
    "Priority email support",
    "Regular feature updates"
  ];

  return (
    <section id="pricing" className="py-24 px-4 bg-[#050b14]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-md mx-auto relative group">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ffd5] to-[#009e86] rounded-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>

          <div className="relative bg-[#0c1220] p-8 rounded-2xl border border-slate-800">
            <div className="absolute top-0 right-0 -mt-3 mr-4">
              <span className="bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                ✨ Most Popular
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Professional Plan</h3>
            <p className="text-slate-400 text-sm mb-6">Everything you need to manage your gym</p>

            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-bold text-white">₹1499</span>
              <span className="text-slate-400 mb-2">/month</span>
            </div>

            <div className="bg-[#00ffd5]/10 text-[#00ffd5] border border-[#00ffd5]/20 rounded-lg py-2 px-4 text-sm font-medium mb-8 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> 30-day free trial included
            </div>

            <button
              onClick={() => setIsSignUpModalOpen(true)}
              className="w-full bg-[#00ffd5] hover:bg-[#00e6c0] text-slate-900 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,213,0.3)] hover:shadow-[0_0_30px_rgba(0,255,213,0.5)] mb-8 cursor-pointer"
            >
              Start Free Trial
            </button>

            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">What's Included:</p>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 min-w-5">
                      <div className="w-5 h-5 bg-[#00ffd5]/10 rounded-full flex items-center justify-center border border-[#00ffd5]/20">
                        <Check className="w-3 h-3 text-[#00ffd5]" />
                      </div>
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInModalOpen(false);
          setIsSignUpModalOpen(true);
        }}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpModalOpen(false);
          setIsSignInModalOpen(true);
        }}
      />
    </section>
  );
}