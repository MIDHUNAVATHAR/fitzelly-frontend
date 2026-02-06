import { Users, UserCheck, MapPin, TrendingUp, Calendar, Bell, CreditCard, Activity, ClipboardList } from 'lucide-react';

const features = [
    {
        icon: Users,
        title: "Client & Trainer Tracking",
        description: "Track clients, trainers, attendance, and monthly revenue in real-time dashboards."
    },
    {
        icon: UserCheck,
        title: "Separate Portals",
        description: "Dedicated portals for Clients and Trainers with role-based access and personalized views."
    },
    {
        icon: MapPin,
        title: "Location Check-in/out",
        description: "GPS-based check-in and check-out system for accurate attendance tracking."
    },
    {
        icon: TrendingUp,
        title: "Boost Revenue",
        description: "Track clients and track enquiries for increase your gym's income."
    },
    {
        icon: Calendar,
        title: "Equipment Booking",
        description: "Smart slot booking system for equipment to prevent crowding and improve experience."
    },
    {
        icon: Bell,
        title: "Auto Notifications",
        description: "Automatic membership expiry notifications to reduce churn and improve retention."
    },
    {
        icon: CreditCard,
        title: "Membership & Payments",
        description: "Manage memberships, track payments, and renewals with clear billing history."
    },

    {
        icon: Activity,
        title: "BMI Tracking",
        description: "Built-in BMI calculator with progress tracking to help clients reach their goals."
    },
    {
        icon: ClipboardList,
        title: "Weekly Exercise Plans",
        description: "Create and assign personalized weekly exercise plans for each client."
    }
];

export default function Features() {
    return (
        <section id="features" className="py-20 px-4 bg-black/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Powerful Features for Modern Gyms</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">Everything you need to manage your gym efficiently and increase member retention.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 hover:border-emerald-400/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
                        >
                            <div className="w-12 h-12 bg-emerald-400/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-400/20 transition-colors text-emerald-400">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed text-sm group-hover:text-zinc-300">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}