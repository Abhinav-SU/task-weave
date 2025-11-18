import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Comparison } from "@/components/landing/Comparison";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  // Update the "Install Extension" button to navigate to dashboard
  useEffect(() => {
    const handleInstallClick = () => {
      navigate('/dashboard');
    };

    // Add click listeners to install buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (button.textContent?.includes('Install Extension')) {
        button.addEventListener('click', handleInstallClick);
      }
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('click', handleInstallClick);
      });
    };
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
