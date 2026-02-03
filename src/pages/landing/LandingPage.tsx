import Header from "./components/Header";
import Home from "./components/Home";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";


export default function LandingPage() {
    return (
        <div className="min-h-screen font-sans selection:bg-teal-500/30">
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