import React from 'react';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import Demo from './components/Demo';
import SmartGreeting from './components/SmartGreeting';
import Pricing from './components/Pricing';
import BlogSection from './components/BlogSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <Features />
      <Demo />
      <SmartGreeting />
      <BlogSection />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;