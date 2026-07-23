import type { Metadata } from "next";
import CollectionBuilder from "@/components/CollectionBuilder";

export const metadata: Metadata = {
  title: "Collections | Modestus",
  description: "Explore Modestus collections and curate your modest fashion looks.",
};

export default function CollectionsPage() {
  return (
    <main className="pt-20 min-h-screen bg-pureblack">
      <CollectionBuilder />
    </main>
  );
}
