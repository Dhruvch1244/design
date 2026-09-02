import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/design-shop/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "A demonstration checkout. No payment step exists and nothing is submitted.",
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
