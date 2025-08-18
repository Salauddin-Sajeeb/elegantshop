import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&h=600",
    title: "Discover Amazing Products",
    subtitle: "Shop the latest trends with premium quality and unbeatable prices",
    buttonText: "Shop Now",
    overlay: "from-slate-900/70 to-slate-900/30",
    textAlign: "left"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&h=600",
    title: "Fashion Forward",
    subtitle: "Curated collections from top designers worldwide",
    buttonText: "Explore Fashion",
    overlay: "from-primary-900/70 to-primary-900/30",
    textAlign: "right"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2126&h=600",
    title: "Tech Innovation",
    subtitle: "Latest gadgets and electronics for modern living",
    buttonText: "Shop Electronics",
    overlay: "from-slate-900/80 to-slate-900/20",
    textAlign: "center"
  }
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
      <div className="relative w-full h-full">
        {/* Slides */}
        <div 
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay} flex items-center ${
                slide.textAlign === 'center' ? 'justify-center' : 
                slide.textAlign === 'right' ? 'justify-end' : 'justify-start'
              }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className={`max-w-lg ${
                    slide.textAlign === 'center' ? 'text-center mx-auto' : 
                    slide.textAlign === 'right' ? 'ml-auto text-right' : ''
                  }`}>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-500">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-slate-200 mb-8 animate-in slide-in-from-bottom-4 duration-700">
                      {slide.subtitle}
                    </p>
                    <Button 
                      size="lg"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-semibold transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-bottom-4 duration-1000"
                      onClick={() => {
                        const productsSection = document.getElementById('products');
                        productsSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {slide.buttonText}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-white/75 scale-110" 
                  : "bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
