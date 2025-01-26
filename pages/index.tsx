import Head from "next/head";
import React from "react";

import Home from "@/components/home";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>오현규 ♡ 오미란</title>
        <meta
          name="description"
          content="오미란 ♡ 오현규 2025년 9월 21일에 결혼합니다."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        
        <meta property="og:title" content="오현규 ♡ 오미란 청첩장" />
        <meta name="twitter:title" content="오현규 ♡ 오미란 청첩장" />
            
        <meta
          property="og:description"
          content="오미란 ♡ 오현규 2025년 9월 21일 5시, 보넬리가든에서 결혼합니다."
        />
        <meta 
          name="twitter:description"
          content="오미란 ♡ 오현규 2025년 9월 21일 5시, 보넬리가든에서 결혼합니다."
        />
        <meta
          property="og:image"
          content="https://yunseok-paula-wedding.vercel.app/photos/cover_min.jpg"
        />
        <meta
          name="twitter:image"
          content="https://yunseok-paula-wedding.vercel.app/photos/cover_min.jpg"
        />
      </Head>
      <Home />
    </>
  );
};

export default HomePage;
