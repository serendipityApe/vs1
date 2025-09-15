"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Link } from "@heroui/link";
import { Lightbulb, AlertTriangle } from "lucide-react";

import { ImageUpload } from "@/components/ui/image-upload";
import { FailureTypeSelector } from "@/components/ui/failure-type-selector";
import { handleApiError, showSuccessToast } from "@/lib/toast";
import { uploadFiles } from "@/lib/upload";

export default function SubmitPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    url: "",
    confession: "",
    tags: [] as string[],
    currentTag: "",
    failureType: "",
    logoFiles: [] as File[],
    galleryFiles: [] as File[],
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-4">Login Required</h1>
            <p className="text-foreground-600 mb-6">
              Please log in to submit your shit project
            </p>
            <Button as={Link} color="primary" href="/api/auth/signin" size="lg">
              Login with GitHub
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleAddTag = () => {
    if (formData.currentTag.trim() && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: "",
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 上传Logo
      let logoUrl = null;

      if (formData.logoFiles.length > 0) {
        const logoUrls = await uploadFiles(formData.logoFiles);

        logoUrl = logoUrls[0];
      }

      // 上传图片库
      let galleryUrls: string[] = [];

      if (formData.galleryFiles.length > 0) {
        galleryUrls = await uploadFiles(formData.galleryFiles);
      }

      const response = await fetch("/api/projects/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          tagline: formData.tagline,
          url: formData.url || undefined,
          confession: formData.confession,
          logoUrl,
          galleryUrls,
          tags: formData.tags,
          failureType: formData.failureType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(
          "Submission Success!",
          "Your shit project has been submitted successfully"
        );
        router.push(`/projects/${data.project.id}`);
      } else {
        handleApiError(
          { response: { status: 400, data: { message: data.errors?.[0] } } },
          data.errors?.[0] || "Submission failed"
        );
      }
    } catch (error) {
      handleApiError(error, "Submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <section className="text-center py-6 mb-8">
        <h2 className="text-3xl font-bold mb-3 text-balance">
          Share Your <span className="text-primary">Glorious Failure</span>
        </h2>
        <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
          Turn your coding disasters into community entertainment. Every bug is
          a feature, every crash is a story, and every abandoned project is a
          badge of honor.
        </p>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Project Details</h2>
            </div>
            <p className="text-sm text-foreground-500">
              Tell us about your magnificent disaster
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              isRequired
              description={`${formData.title.length}/100 字符`}
              label="Project Name *"
              maxLength={100}
              placeholder="e.g., AI Recipe Generator That Only Makes Sandwiches"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <Input
              isRequired
              description={`${formData.tagline.length}/60 characters`}
              label="One-line Description *"
              maxLength={60}
              placeholder="e.g: Trained on 10,000 recipes, only outputs PB&J variations"
              value={formData.tagline}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tagline: e.target.value }))
              }
            />

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="failureType">
                Failure Type
              </label>
              <FailureTypeSelector
                value={formData.failureType}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, failureType: value }))
                }
              />
            </div>
          </CardBody>
        </Card>

        {/* Confession */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">The Confession</h2>
            </div>
            <p className="text-sm text-foreground-500">
              Tell us the full story - what went wrong and why?
            </p>
          </CardHeader>
          <CardBody>
            <Textarea
              isRequired
              description={`Be honest, funny, and detailed. The community loves good disaster stories. ${formData.confession.length}/2000`}
              label="Confession *"
              maxLength={2000}
              minRows={6}
              placeholder="I spent 3 months training a recipe neural network, only to discover it learned bread + filling = food. Now it suggests 47 different sandwich variations..."
              value={formData.confession}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, confession: e.target.value }))
              }
            />
          </CardBody>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Tags</h2>
            <p className="text-sm text-foreground-500">
              Choose up to 5 tags that describe your failure
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                label="Add Tag"
                placeholder="e.g: React, TypeScript, abandoned..."
                value={formData.currentTag}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentTag: e.target.value,
                  }))
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                className="mt-2"
                isDisabled={
                  !formData.currentTag.trim() || formData.tags.length >= 5
                }
                type="button"
                variant="bordered"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  color="primary"
                  variant="flat"
                  onClose={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-foreground-500">
              Selected: {formData.tags.length}/5
            </p>
          </CardBody>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Links (Optional)</h2>
            <p className="text-sm text-foreground-500">
              If you dare, share your project and code
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Project URL"
              placeholder="https://my-failed-project.com"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
            />
          </CardBody>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Project Logo (Optional)</h2>
            <p className="text-sm text-foreground-500">
              Upload a square logo (recommended 64x64px)
            </p>
          </CardHeader>
          <CardBody>
            <ImageUpload
              images={formData.logoFiles}
              type="logo"
              onImagesChange={(files) =>
                setFormData((prev) => ({ ...prev, logoFiles: files }))
              }
            />
          </CardBody>
        </Card>

        {/* Gallery Upload */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Project Gallery (Optional)
            </h2>
            <p className="text-sm text-foreground-500">
              Upload up to 5 screenshots or images to showcase your project
            </p>
          </CardHeader>
          <CardBody>
            <ImageUpload
              images={formData.galleryFiles}
              type="gallery"
              onImagesChange={(files) =>
                setFormData((prev) => ({ ...prev, galleryFiles: files }))
              }
            />
          </CardBody>
        </Card>

        {/* Submit */}
        <Card>
          <CardBody className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-sm text-foreground-500">
                By submitting, you agree to let the community (lovingly) mock
                your code.
              </p>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button
                  className="flex-1 sm:flex-none"
                  size="lg"
                  variant="bordered"
                  onPress={() => router.push("/")}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 sm:flex-none"
                  color="primary"
                  isDisabled={
                    !formData.title || !formData.tagline || !formData.confession
                  }
                  isLoading={isLoading}
                  size="lg"
                  type="submit"
                >
                  {isLoading ? "Submitting..." : "Submit My Failure"}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
