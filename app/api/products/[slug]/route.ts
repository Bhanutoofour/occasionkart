import { getProductBySlug } from "@/lib/server/catalog";

export const runtime = "nodejs";

type ProductRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: ProductRouteContext) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({ data: product });
}
