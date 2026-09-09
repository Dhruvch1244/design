"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import type { EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { Button } from "../button/button";
import { cn } from "../../lib/utils";

type CarouselApi = UseEmblaCarouselType[1];

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
}

interface CarouselContextValue {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: "horizontal" | "vertical";
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("Carousel subcomponents must be rendered inside <Carousel>.");
  return context;
}

/** Reads live scroll-boundary state off embla's imperative api without a
 * setState-in-effect (embla has no reactive state of its own to select
 * from — its api is exactly the kind of external system useSyncExternalStore
 * exists for, same reasoning as this repo's voice-picker.tsx). */
function useCanScroll(api: CarouselApi, direction: "prev" | "next") {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      if (!api) return () => {};
      api.on("reInit", callback);
      api.on("select", callback);
      return () => {
        api.off("reInit", callback);
        api.off("select", callback);
      };
    },
    [api],
  );
  const getSnapshot = React.useCallback(
    () => (api ? (direction === "prev" ? api.canScrollPrev() : api.canScrollNext()) : false),
    [api, direction],
  );
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ orientation = "horizontal", opts, plugins, setApi, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
      plugins,
    );
    const canScrollPrev = useCanScroll(api, "prev");
    const canScrollNext = useCanScroll(api, "next");

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) return;
      setApi(api);
    }, [api, setApi]);

    return (
      <CarouselContext.Provider
        value={{ carouselRef, api, scrollPrev, scrollNext, canScrollPrev, canScrollNext, orientation }}
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
  },
);
Carousel.displayName = "Carousel";

export const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();
    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "vertical" ? "-mt-4 flex-col" : "-ml-4", className)}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

export const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "vertical" ? "pt-4" : "pl-4", className)}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

export const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "vertical"
            ? "-top-10 left-1/2 -translate-x-1/2 rotate-90"
            : "-left-10 top-1/2 -translate-y-1/2",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

export const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "vertical"
            ? "-bottom-10 left-1/2 -translate-x-1/2 rotate-90"
            : "-right-10 top-1/2 -translate-y-1/2",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export type { CarouselApi };
