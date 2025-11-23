"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

import { useSupabase } from "@/app/supabase-provider";
import { ImageUpload } from "@/components/ui/image-upload";
import { FailureTypeSelector } from "@/components/ui/failure-type-selector";
import { handleApiError, showSuccessToast } from "@/lib/toast";
import { uploadFiles } from "@/lib/upload";

export default function SubmitPage() {
  const router = useRouter();
  const { user, signInWithOAuth, signInWithEmail } = useSupabase();
  // using `user` directly for auth gating
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card
          className="max-w-md w-full border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
          radius="none"
        >
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-mono font-bold mb-4 uppercase">
              ACCESS_DENIED
            </h1>
            <p className="text-foreground-600 mb-6 font-mono">
              Auth token missing. Please authenticate to proceed.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                className="font-bold font-mono uppercase border-2 border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                color="primary"
                radius="none"
                size="lg"
                onPress={async () => {
                  await signInWithOAuth("github");
                }}
              >
                Login with GitHub
              </Button>
            </div>
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
      // 上传Logo -> 返回 storage id (e.g. projects/<filename>)
      let logoId = null;

      if (formData.logoFiles.length > 0) {
        const logoIds = await uploadFiles(formData.logoFiles);

        logoId = logoIds[0];
      }

      // 上传图片库 -> 返回 storage ids 数组
      let galleryIds: string[] = [];

      if (formData.galleryFiles.length > 0) {
        galleryIds = await uploadFiles(formData.galleryFiles);
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
          // 传入 storage ids 而非公开 URL
          logoUrl: logoId,
          galleryUrls: galleryIds,
          tags: formData.tags,
          failureType: formData.failureType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccessToast(
          "Submission Success!",
          "Your shit project has been submitted successfully",
        );
        router.push(`/projects/${data.project.id}`);
      } else {
        handleApiError(
          { response: { status: 400, data: { message: data.errors?.[0] } } },
          data.errors?.[0] || "Submission failed",
        );
      }
    } catch (error) {
      handleApiError(error, "Submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
      <section className="text-center py-6 mb-8 border-b-2 border-foreground">
        <h2 className="text-4xl font-mono font-black mb-3 text-balance uppercase tracking-tighter">
          INIT_FAILURE_REPORT
        </h2>
        <p className="text-lg text-foreground/70 font-mono max-w-2xl mx-auto mb-6">
          {">"} Document your disaster.
          <br />
          {">"} Future generations will learn from your spaghetti.
        </p>
      </section>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Card
          className="border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          radius="none"
        >
          <CardHeader className="bg-content2 border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <div className="font-mono font-bold bg-primary text-black px-2">
                SECTION_01
              </div>
              <h2 className="text-xl font-mono font-bold uppercase">
                Metadata
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-6 p-6">
            <Input
              isRequired
              classNames={{
                inputWrapper:
                  "bg-background border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] data-[hover=true]:bg-background group-data-[focus=true]:bg-background",
                label: "font-mono font-bold uppercase",
              }}
              description={`${formData.title.length}/100 chars`}
              label="Project Name"
              maxLength={100}
              placeholder="PROJECT_X_FAILURE_EDITION"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            <Input
              isRequired
              classNames={{
                inputWrapper:
                  "bg-background border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] data-[hover=true]:bg-background group-data-[focus=true]:bg-background",
                label: "font-mono font-bold uppercase",
              }}
              description={`${formData.tagline.length}/60 chars`}
              label="One-line Description"
              maxLength={60}
              placeholder="It was supposed to be Facebook but for cats..."
              value={formData.tagline}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tagline: e.target.value }))
              }
            />

            <div className="space-y-2">
              <label
                className="text-sm font-mono font-bold uppercase"
                htmlFor="failureType"
              >
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
        <Card
          className="border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          radius="none"
        >
          <CardHeader className="bg-content2 border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <div className="font-mono font-bold bg-primary text-black px-2">
                SECTION_02
              </div>
              <h2 className="text-xl font-mono font-bold uppercase">
                Post_Mortem
              </h2>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <Textarea
              isRequired
              classNames={{
                inputWrapper:
                  "bg-background border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] data-[hover=true]:bg-background group-data-[focus=true]:bg-background",
                label: "font-mono font-bold uppercase",
              }}
              description={`Traceback of what went wrong. ${formData.confession.length}/2000`}
              label="Confession Log"
              maxLength={2000}
              minRows={10}
              placeholder="> Start log..."
              value={formData.confession}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, confession: e.target.value }))
              }
            />
          </CardBody>
        </Card>

        {/* Tags */}
        <Card
          className="border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          radius="none"
        >
          <CardHeader className="bg-content2 border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <div className="font-mono font-bold bg-primary text-black px-2">
                SECTION_03
              </div>
              <h2 className="text-xl font-mono font-bold uppercase">
                Keywords
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4 p-6">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                classNames={{
                  inputWrapper:
                    "bg-background border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] data-[hover=true]:bg-background group-data-[focus=true]:bg-background",
                  label: "font-mono font-bold uppercase",
                }}
                label="Add Tag"
                placeholder="TAG_NAME"
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
                className="mt-6 h-14 px-8 font-mono font-bold border-2 border-foreground bg-primary text-black"
                isDisabled={
                  !formData.currentTag.trim() || formData.tags.length >= 5
                }
                radius="none"
                type="button"
                onClick={handleAddTag}
              >
                ADD
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-4 border-2 border-dashed border-foreground/20">
              {formData.tags.length === 0 && (
                <span className="text-foreground/40 font-mono text-sm">
                  No tags selected
                </span>
              )}
              {formData.tags.map((tag) => (
                <Chip
                  key={tag}
                  className="border border-foreground bg-content2 font-mono rounded-none"
                  variant="bordered"
                  onClose={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-foreground-500 font-mono">
              BUFFER: {formData.tags.length}/5
            </p>
          </CardBody>
        </Card>

        {/* Links */}
        <Card
          className="border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          radius="none"
        >
          <CardHeader className="bg-content2 border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <div className="font-mono font-bold bg-primary text-black px-2">
                SECTION_04
              </div>
              <h2 className="text-xl font-mono font-bold uppercase">
                Reference_Pointer
              </h2>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <Input
              classNames={{
                inputWrapper:
                  "bg-background border-2 border-foreground rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] data-[hover=true]:bg-background group-data-[focus=true]:bg-background",
                label: "font-mono font-bold uppercase",
              }}
              label="Project URL"
              placeholder="https://"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
            />
          </CardBody>
        </Card>

        {/* Logo Upload */}
        <Card
          className="border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          radius="none"
        >
          <CardHeader className="bg-content2 border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <div className="font-mono font-bold bg-primary text-black px-2">
                ASSET_01
              </div>
              <h2 className="text-xl font-mono font-bold uppercase">
                Icon.ico
              </h2>
            </div>
          </CardHeader>
          <CardBody className="p-6">
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
        <Card
          className="border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
          radius="none"
        >
          <CardHeader className="bg-content2 border-b-2 border-foreground">
            <div className="flex items-center gap-2">
              <div className="font-mono font-bold bg-primary text-black px-2">
                ASSET_02
              </div>
              <h2 className="text-xl font-mono font-bold uppercase">
                Screenshots
              </h2>
            </div>
          </CardHeader>
          <CardBody className="p-6">
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
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end items-center">
            <Button
              className="w-full sm:w-auto font-mono uppercase border-2 border-foreground bg-transparent hover:bg-content2"
              radius="none"
              size="lg"
              variant="bordered"
              onPress={() => router.push("/")}
            >
              Abort
            </Button>
            <Button
              className="w-full sm:w-auto font-mono font-bold uppercase border-2 border-foreground bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              isDisabled={
                !formData.title || !formData.tagline || !formData.confession
              }
              isLoading={isLoading}
              radius="none"
              size="lg"
              type="submit"
            >
              {isLoading ? "EXECUTING..." : "COMMIT_FAILURE"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
