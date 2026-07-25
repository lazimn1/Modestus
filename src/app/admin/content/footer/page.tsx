"use client";

import ContentEditorShell, {
  FieldLabel,
  FieldInput,
  FieldTextarea,
} from "@/components/admin/ContentEditorShell";

export default function FooterEditor() {
  return (
    <ContentEditorShell
      contentKey="footer"
      title="Footer Section"
      description="Edit the footer brand description and social media links."
    >
      {({ data, setData }) => (
        <div className="space-y-4">
          <div>
            <FieldLabel>Brand Description Text</FieldLabel>
            <FieldTextarea
              value={data.description}
              onChange={(v) => setData({ ...data, description: v })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Instagram URL</FieldLabel>
              <FieldInput
                value={data.instagram}
                onChange={(v) => setData({ ...data, instagram: v })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <FieldLabel>Twitter / X URL</FieldLabel>
              <FieldInput
                value={data.twitter}
                onChange={(v) => setData({ ...data, twitter: v })}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
        </div>
      )}
    </ContentEditorShell>
  );
}
