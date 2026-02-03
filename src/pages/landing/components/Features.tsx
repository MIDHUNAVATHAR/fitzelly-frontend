import { Users, UserCheck, MapPin, TrendingUp, Calendar, Bell, Dumbbell, Activity, ClipboardList } from 'lucide-react';

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
        description: "Enable trainers to offer personal training subscriptions and increase your gym's income."
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
        icon: Dumbbell,
        title: "Zelly Exercise Library",
        description: "Comprehensive exercise library with video guides accessible to all clients."
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
        <section id="features" className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 bg-[#00ffd5]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00ffd5]/20 transition-colors text-[#00c4a4]">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}