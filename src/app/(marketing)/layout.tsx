import { MainLayout } from "@/components/layout/main-layout";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/organization-json-ld";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <ServiceWorkerRegistrar />
      {children}
    </>
  );
}
