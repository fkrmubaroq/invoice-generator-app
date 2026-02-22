import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  children: React.ReactNode;
  containerId?: string;
};

export default function Portal({
  children,
  containerId = "portal-root",
}: PortalProps) {
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current) {
    elRef.current = document.createElement("div");
  }

  useEffect(() => {
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }

    const el = elRef.current!;
    container.appendChild(el);

    return () => {
      container?.removeChild(el);
    };
  }, [containerId]);

  return createPortal(children, elRef.current);
}
