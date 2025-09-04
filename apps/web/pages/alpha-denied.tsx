import type { NextPage } from 'next';
import Head from 'next/head';

const AlphaDeniedPage: NextPage = () => {
  return (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'sans-serif', 
        textAlign: 'center' 
    }}>
      <Head>
        <title>Alpha Access</title>
      </Head>
      <div>
        <h1>Alpha Access Required</h1>
        <p>This application is currently in a private alpha.</p>
        <p>We appreciate your interest! Access is limited to whitelisted addresses at this time.</p>
      </div>
    </div>
  );
};

export default AlphaDeniedPage;
