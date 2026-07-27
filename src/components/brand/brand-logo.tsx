import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
  surface = "adaptive",
}: {
  className?: string;
  priority?: boolean;
  surface?: "adaptive" | "dark" | "light";
}) {
  const shared = cn("h-full w-full object-cover", className);

  if (surface === "dark") {
    return <Image src="/brand/atiy-logo-white.png" alt="ATIY" width={1536} height={1024} priority={priority} className={shared} />;
  }
  if (surface === "light") {
    return <Image src="/brand/atiy-logo-primary.png" alt="ATIY" width={1536} height={1024} priority={priority} className={shared} />;
  }

  return (
    <>
      <Image src="/brand/atiy-logo-primary.png" alt="ATIY" width={1536} height={1024} priority={priority} className={cn(shared, "dark:hidden")} />
      <Image src="/brand/atiy-logo-white.png" alt="ATIY" width={1536} height={1024} priority={priority} className={cn(shared, "hidden dark:block")} />
    </>
  );
}

export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/atiy-isotipo.png"
      alt="Isotipo de ATIY"
      width={1254}
      height={1254}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
