// client/src/pages/product-details-route.tsx
import { useParams } from "wouter";
import ProductDetails from "./product-details";

export default function ProductDetailsRoute() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  return <ProductDetails id={id} />;
}
