import './global.css';

import Header from '@/partials/Header';
import Footer from '@/partials/Footer';

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="overscroll-none">
            <body className="flex flex-col w-full h-screen bg-white font-source-sans">
                <Header />
                <main className="flex flex-col flex-1 @container/main">{children}</main>
                <Footer />
            </body>
        </html>
    );
}