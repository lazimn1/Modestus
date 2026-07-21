import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import MissionSection from "@/components/MissionSection";
import FeaturesBanner from "@/components/FeaturesBanner";
import CollectionBuilder from "@/components/CollectionBuilder";
import GallerySection from "@/components/GallerySection";
import ReviewSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-lightgray w-full overflow-x-hidden">
      <Hero />
      <FeaturesBanner />
      <CollectionBuilder />        
      <CategorySection/>      
      <MissionSection />
      <GallerySection />
      <ReviewSection />
      <Footer />
    </main>
  );
}
