import { Check } from 'lucide-react';
import { useState } from 'react';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function Pricing() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const features = [
    "Unlimited clients & trainers",
    "All portal features (Client & Trainer)",
    "GPS check-in/check-out",
    "Equipment slot booking",
    "Automatic notifications",
    "BMI calculator & tracking",
    "Weekly exercise plans",
    "Revenue analytics dashboard",
    "Regular feature updates"
  ];

  return (
    <section id="pricing" className="py-24 px-4 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-zinc-400">One powerful plan giving you access to everything.</p>
        </div>

        <div className="max-w-md mx-auto relative group">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>

          <div className="relative bg-zinc-900 p-8 rounded-2xl border border-zinc-800">

            <h3 className="text-2xl font-bold text-white mb-2">Professional Plan</h3>
            <p className="text-zinc-400 text-sm mb-6">Everything you need to manage your gym</p>

            <div className="flex items-end gap-2 mb-6">
              <span className="text-5xl font-bold text-white">₹1499</span>
              <span className="text-zinc-400 mb-2">/month</span>
            </div>

            <div className="bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-lg py-2 px-4 text-sm font-medium mb-8 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> 30-day free trial included
            </div>

            <button
              onClick={() => setIsSignUpModalOpen(true)}
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] mb-8 cursor-pointer"
            >
              Start Free Trial
            </button>

            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">What's Included:</p>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 min-w-5">
                      <div className="w-5 h-5 bg-emerald-400/10 rounded-full flex items-center justify-center border border-emerald-400/20">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                    </div>
                    <span className="text-zinc-300 text-sm hover:text-white transition-colors">{feature}</span>
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
        onForgotPassword={() => {
          setIsSignInModalOpen(false);
          setIsForgotPasswordModalOpen(true);
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

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
        onSwitchToSignIn={() => {
          setIsForgotPasswordModalOpen(false);
          setIsSignInModalOpen(true);
        }}
      />
    </section>
  );
}