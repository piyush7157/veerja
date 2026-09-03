import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Hello World Page" },
      {
        name: "description",
        content: "A simple hello world page built with TanStack Start.",
      },
      { property: "og:title", content: "Hello World Page" },
      {
        property: "og:description",
        content: "A simple hello world page built with TanStack Start.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-4xl font-bold text-foreground">Hello World</h1>
    </main>
  );
}
