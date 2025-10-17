import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

const Carousel = React.forwardRef(({
  orientation = "horizontal",
  className,
  children,
  ...props
}, ref) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [totalSlides, setTotalSlides] = React.useState(0);
  const contentRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const scrollTo = React.useCallback((index) => {
    if (!contentRef.current || totalSlides === 0) return;
    
    const newIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentIndex(newIndex);
    
    const container = containerRef.current;
    const content = contentRef.current;
    const children = Array.from(content.children);
    
    if (orientation === "horizontal") {
      const scrollLeft = children[newIndex].offsetLeft;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    } else {
      const scrollTop = children[newIndex].offsetTop;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [totalSlides, orientation]);

  const scrollPrev = React.useCallback(() => {
    scrollTo(currentIndex - 1);
  }, [currentIndex, scrollTo]);

  const scrollNext = React.useCallback(() => {
    scrollTo(currentIndex + 1);
  }, [currentIndex, scrollTo]);

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < totalSlides - 1;

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  }, [scrollPrev, scrollNext]);

  React.useEffect(() => {
    if (!contentRef.current) return;
    setTotalSlides(contentRef.current.children.length);
  }, [children]);

  return (
    <CarouselContext.Provider
      value={{
        currentIndex,
        totalSlides,
        scrollTo,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        orientation,
        contentRef,
        containerRef
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation, containerRef } = useCarousel();
  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden",
        className
      )}
      style={{
        scrollSnapType: orientation === "horizontal" ? "x mandatory" : "y mandatory",
        display: "flex",
        flexDirection: orientation === "horizontal" ? "row" : "column"
      }}
    >
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      style={{
        scrollSnapAlign: "start"
      }}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};