import React from "react";

const Header = () => (
  <header className="relative rounded-b-3xl p-6 md:p-12 mx-4 md:mx-16">
    <div className="absolute inset-0 rounded-b-3xl 
                    bg-white/20 
                    backdrop-blur-md 
                    border border-white/30"></div>

    <div className="relative z-10 text-center md:text-left max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-sans">
        Intellica
        </h1>
        <p className="mt-2 text-gray-700/80 text-sm md:text-base font-sans leading-relaxed">
        Upload documents, images, or audio, then ask questions in plain language.
        Receive accurate answers with full citation transparency from your local knowledge base.
        </p>
    </div>
    </header>
);

export default Header;
