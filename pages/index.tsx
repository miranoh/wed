import Head from "next/head";
import React from "react";

import Home from "@/components/home";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Denny ♡ Miran</title>
        <meta
          name="description"
          content="We are getting married! (2025.9.21)"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        
        <meta property="og:title" content="Denny ♡ Miran's Wedding Invitation" />
        <meta name="twitter:title" content="Denny ♡ Miran's Wedding Invitation" />
            
        <meta
          property="og:description"
          content="2025.09.21 SUN 5:30PM @ Bonelli Garden"
        />
        <meta 
          name="twitter:description"
          content="2025.09.21 SUN 5:30PM @ Bonelli Garden"
        />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/miranoh/wed/refs/heads/main/public/photos/cover_min.jpg"
        />
        <meta
          name="twitter:image"
          content="https://raw.githubusercontent.com/miranoh/wed/refs/heads/main/public/photos/cover_min.jpg"
        />
      </Head>
      <Home />
    </>
  );
};

export default HomePage;
