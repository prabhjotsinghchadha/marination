"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Configure pdf.js worker for react-pdf.
// This resolves to the worker shipped by `pdfjs-dist` in node_modules.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const FILE_URL = "/assets/legal/MariNation_Terms_of_Use.pdf";

const MAX_PAGE_WIDTH = 596;
const MIN_PAGE_WIDTH = 320;

export function TermsOfUsePdfViewer() {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageWidth, setPageWidth] = useState<number>(MAX_PAGE_WIDTH);

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const update = () => {
      // Leave a bit of breathing room for side paddings.
      const available = Math.floor(window.innerWidth - 64);
      const next = Math.min(MAX_PAGE_WIDTH, Math.max(MIN_PAGE_WIDTH, available));
      setPageWidth(next);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full min-h-[90vh] max-w-[1176px] mx-auto px-2 flex items-center justify-center">
      <Document file={FILE_URL} onLoadSuccess={onLoadSuccess}>
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={pageWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}

