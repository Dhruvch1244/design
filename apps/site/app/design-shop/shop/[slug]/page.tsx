import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/design-shop/product-detail";
import { getProduct, PRODUCTS, relatedProducts } from "@/lib/design-shop/catalog";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/design-shop/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: `${product.tagline} — ${product.description.slice(0, 140)}…`,
  };
}

export default async function ProductPage({ params }: PageProps<"/design-shop/shop/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return <ProductDetail product={product} related={relatedProducts(product, 3)} />;
}
