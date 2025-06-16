import './global.css';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="flex flex-col w-full h-screen bg-white">
                <Header />
                <main className="flex flex-col flex-1 gap-4 @container/main">{children}</main>
                <Footer />
            </body>
        </html>
    );
}