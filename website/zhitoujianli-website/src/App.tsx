import AutoDelivery from './components/AutoDelivery';
import BlogSection from './components/BlogSection';
import Contact from './components/Contact';
import Demo from './components/Demo';
import Features from './components/Features';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import JDMatching from './components/JDMatching';
import Navigation from './components/Navigation';
import Pricing from './components/Pricing';
import SEOHead from './components/SEOHead';
import SmartGreeting from './components/SmartGreeting';

function App() {
  return (
    <div className='min-h-screen bg-white'>
      {/* SEO优化：根据滚动位置动态更新页面标题和Meta标签 */}
      <SEOHead defaultPage='home' enableScrollTracking={true} />

      <Navigation />
      <HeroSection />
      <Features />
      <Demo />
      <AutoDelivery />
      <JDMatching />
      <SmartGreeting />
      <BlogSection />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
