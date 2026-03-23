"use client";

import { useEffect, useState, type ComponentType } from "react";

const FILE_URL = "/assets/legal/MariNation_Predicting_Prohibitions_Template.pdf";

const MAX_PAGE_WIDTH = 596;
const MIN_PAGE_WIDTH = 320;

export function DocsPdfViewer() {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(MAX_PAGE_WIDTH);
  const [pdfComponents, setPdfComponents] = useState<{
    Document: ComponentType<Record<string, unknown>>;
    Page: ComponentType<Record<string, unknown>>;
  } | null>(null);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    let mounted = true;

    // Import react-pdf client-side only to avoid server prerender crashes (DOMMatrix).
    import("react-pdf").then((mod) => {
      if (!mounted) return;
      mod.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      setPdfComponents({ Document: mod.Document, Page: mod.Page });
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const available = Math.floor(window.innerWidth - 64);
      const next = Math.min(MAX_PAGE_WIDTH, Math.max(MIN_PAGE_WIDTH, available));
      setPageWidth(next);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!pdfComponents) return null;

  return (
    <div className="w-full min-h-[90vh] max-w-[1176px] mx-auto px-2 flex items-center justify-center">
      <pdfComponents.Document file={FILE_URL} onLoadSuccess={onLoadSuccess}>
        {Array.from({ length: numPages }, (_, i) => (
          <pdfComponents.Page
            key={i}
            pageNumber={i + 1}
            width={pageWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ))}
      </pdfComponents.Document>
    </div>
  );
}

