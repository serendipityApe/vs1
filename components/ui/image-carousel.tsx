"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  title?: string;
  className?: string;
}

export function ImageCarousel({
  images,
  title,
  className,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Card className={`${className || ""} rounded-none`} radius="none">
      <CardBody className="p-0">
        {/* Main Image */}
        <div className="relative aspect-video bg-content2 overflow-hidden border-2 border-foreground">
          <Image
            fill
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-contain bg-black/5"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={images[currentIndex]}
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                isIconOnly
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-background/80 text-foreground border-r-2 border-y-2 border-foreground hover:bg-foreground hover:text-background h-12 w-12 rounded-none"
                radius="none"
                variant="flat"
                onPress={prevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                isIconOnly
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-background/80 text-foreground border-l-2 border-y-2 border-foreground hover:bg-foreground hover:text-background h-12 w-12 rounded-none"
                radius="none"
                variant="flat"
                onPress={nextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-0 right-0 bg-foreground text-background text-xs font-mono px-2 py-1 border-l-2 border-t-2 border-foreground">
              IDX: {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-4 border-x-2 border-b-2 border-foreground">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-12 border-2 transition-all relative ${
                    index === currentIndex
                      ? "border-primary opacity-100 grayscale-0"
                      : "border-foreground/30 opacity-60 grayscale hover:grayscale-0"
                  }`}
                  onClick={() => goToImage(index)}
                >
                  <Image
                    fill
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    sizes="64px"
                    src={image}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
