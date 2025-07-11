import React from 'react';

import LogoMono from '@/partials/LogoMono';
import SocialIcons from '@/partials/SocialIcons';

const Footer = () => {

    const currentYear = new Date().getFullYear();

    return (
        <footer className="flex flex-row justify-between items-center bg-inkwell-inception text-white pl-6 pr-4 py-4 mt-16">
            <div className="footer-icons flex flex-row space-x-4 flex-1">
                <SocialIcons.LinkedInIcon url="https://www.linkedin.com/in/adamtrickett/" />
                <SocialIcons.GitHubIcon url="https://github.com/plackyfantacky/" />
                <SocialIcons.BehanceIcon url="https://www.behance.net/ariom_" />
                <SocialIcons.InstagramIcon url="https://www.instagram.com/adam.lj.trickett/" />
            </div>
            <div className="footer-copyright flex-1 flex flex-col justify-center text-center gap-0">
                <p className="m-0">Site and original content: Copyright © {currentYear} Adam Trickett</p>
                <small>3rd party content copyright belongs to their respective owners</small>
            </div>
            <div className="footer-logo h-16 flex-1 flex justify-end">
                <LogoMono className="w-min" />
            </div>
        </footer>
    );
}

export default Footer;