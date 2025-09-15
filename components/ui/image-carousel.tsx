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
    <Card className={className}>
      <CardBody className="p-0">
        {/* Main Image */}
        <div className="relative aspect-video bg-content2 overflow-hidden rounded-t-lg">
          <Image
            fill
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={images[currentIndex]}
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                isIconOnly
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                variant="flat"
                onPress={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                variant="flat"
                onPress={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-4">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-12 bg-content3 rounded overflow-hidden transition-opacity relative ${
                    index === currentIndex
                      ? "ring-2 ring-primary opacity-100"
                      : "opacity-60 hover:opacity-80"
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
