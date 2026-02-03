export default function Home() {
    return (
        <section id="home" className="pt-40 pb-20 px-4 bg-white">
            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block bg-[#00ffd5]/10 text-[#009e86] px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
                    Powerful Features
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                    Everything You Need to <span className="text-[#00ffd5]">Run Your Gym</span>
                </h1>

                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    From client management to revenue tracking, FITZELLY provides all the tools you need to streamline operations and grow your fitness business.
                </p>
            </div>
        </section>
    );
}