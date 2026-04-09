import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import { AlertCircle, LogOut } from "lucide-react";

const SubscriptionExpiredModal: React.FC = () => {
  const { user, isSubscriptionExpired, logout } = useAuth();

  if (!isSubscriptionExpired) return null;

  const isGym = user?.role === "gym";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-red-100 dark:border-red-900/30"
        >
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {isGym ? "Subscription Expired" : "Access Restricted"}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {isGym 
                ? "Your gym subscription has expired. Please renew your subscription to continue managing your gym."
                : "You are unable to access the dashboard because your gym's subscription has expired. Please contact your gym administrator."
              }
            </p>

            <div className="flex flex-col gap-3">
              {isGym && (
                <button
                  onClick={() => {
                    // Redirect to subscription page if it exists, or contact support
                    window.location.href = "/gym/settings/subscription";
                  }}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                >
                  Renew Subscription
                </button>
              )}
              
              <button
                onClick={logout}
                className="w-full py-3.5 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubscriptionExpiredModal;
