"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted hover:text-text"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
      </button>
    </div>
  );
}

export { PasswordInput };
