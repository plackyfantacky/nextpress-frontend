import React from "react";

import Logo from "@/components/Logo";

const Header = () => {
    return (
        <header className="flex flex-row justify-between items-center bg-ariom text-black h-32 p-4 text-white">
            <Logo />
            <nav className="mt-2">
                <ul className="flex space-x-4">
                    <li><a href="/" className="text-black hover:text-white">Home</a></li>
                    <li><a href="/about" className="text-black hover:text-white">About</a></li>
                    <li><a href="/contact" className="text-black hover:text-white">Contact</a></li>
                </ul>
            </nav>
        </header>
    );
};
export default Header;