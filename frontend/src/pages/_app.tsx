// _app.tsx

import { AppProps } from 'next/app';
import React, { ReactNode } from 'react';
import '../styles/globals.css';
import { PopupProvider } from '@/components/Context/PopupContext';
import { UserProvider } from '@auth0/nextjs-auth0/client';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div>
            <main>{children}</main>
        </div>
    );
};

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Layout>
            <UserProvider>
                <PopupProvider>
                    <Component {...pageProps} />
                </PopupProvider>
            </UserProvider>
        </Layout>
    );
}

export default MyApp;