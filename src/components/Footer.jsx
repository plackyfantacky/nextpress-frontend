import React from 'react';

import LogoMono from '@/components/LogoMono';
import SocialIcons from '@/components/SocialIcons';

const Footer = () => {

    const currentYear = new Date().getFullYear();

    return (
        <footer className="flex flex-row justify-between items-center bg-inkwell text-white p-4">
            <div className="footer-icons flex flex-row space-x-4">
                <SocialIcons.LinkedInIcon url="https://www.linkedin.com/in/adamtrickett/" />
                <SocialIcons.GitHubIcon url="https://github.com/plackyfantacky/" />
                <SocialIcons.BehanceIcon url="https://www.behance.net/ariom_" />
                <SocialIcons.InstagramIcon url="https://www.instagram.com/adam.lj.trickett/" />
            </div>
            <div className="footer-copyright">
                <p>Site and original content: Copyright © {currentYear} Adam Trickett</p>
                <small>3rd party content copyright belongs to their respective owners</small>
            </div>
            <div className="footer-logo h-16">
                <LogoMono />
            </div>
        </footer>
    );
}

export default Footer;