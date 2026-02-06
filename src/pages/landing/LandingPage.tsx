import Header from "./components/Header";
import Home from "./components/Home";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";


export default function LandingPage() {
    return (
        <div className="min-h-screen font-sans selection:bg-emerald-400/30 bg-black text-slate-200">
            <Header />
            <main className="flex-grow">
                <Home />
                <Features />
                <Pricing />
            </main>
            <Footer />
        </div>
    )
}