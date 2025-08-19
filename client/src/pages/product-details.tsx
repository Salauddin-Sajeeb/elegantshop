import { useEffect, useState } from "react";

type Props = { id: string };

export default function ProductDetails({ id }: Props) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProduct(data);
      } catch (e: any) {
        setError(e.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!product) return <div className="p-8">Not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full h-96 bg-white rounded-xl overflow-hidden flex items-center justify-center">
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-4">{product.description}</p>
          <div className="text-2xl font-bold mb-6">{product.price}</div>
          {/* TODO: add to cart, rating, etc. */}
        </div>
      </div>
    </div>
  );
}
