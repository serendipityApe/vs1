import { Button } from "@heroui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-mono">
      <div className="border-2 border-foreground p-8 bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <h1 className="text-4xl md:text-6xl font-black uppercase mb-8 tracking-tighter">
          THE_MANIFESTO.md
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none font-mono">
          <p className="text-xl font-bold mb-4 border-l-4 border-primary pl-4">
            {">"} We believe that success is boring. Failure is where the data
            lives.
          </p>

          <h2 className="uppercase font-bold mt-8 text-2xl">1. THE MISSION</h2>
          <p>
            GitHub is full of polished resumes. &quot;Vibe Shit&quot; is the
            trash bin behind the restaurant where the real cooking happens. We
            are here to celebrate the segfaults, the infinite loops, and the
            projects that looked great in the README but crashed on `npm start`.
          </p>

          <h2 className="uppercase font-bold mt-8 text-2xl">2. THE RULES</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>NO SHAME:</strong> Post your worst code. We&apos;ve all
              been there.
            </li>
            <li>
              <strong>NO BULLSHIT:</strong> Don&apos;t sugarcoat it. Tell us
              exactly why it sucks.
            </li>
            <li>
              <strong>JUST VIBES:</strong> If it compiles, it ships. If it
              doesn&apos;t compile, ship the error log.
            </li>
          </ul>

          <h2 className="uppercase font-bold mt-8 text-2xl">
            3. SYSTEM_STATUS
          </h2>
          <div className="bg-content2 p-4 border border-foreground text-sm">
            <p>KERNEL: Vibe_Shit_OS v1.0</p>
            <p>UPTIME: Forever</p>
            <p>STATUS: CRASHING_GRACEFULLY</p>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <Button
            as={Link}
            className="font-bold uppercase border-2 border-foreground bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 transition-all"
            href="/submit"
            radius="none"
            size="lg"
          >
            JOIN_THE_MOVEMENT
          </Button>
          <Button
            as={Link}
            className="font-bold uppercase border-2 border-foreground"
            href="/"
            radius="none"
            size="lg"
            variant="bordered"
          >
            RETURN_HOME
          </Button>
        </div>
      </div>
    </div>
  );
}
