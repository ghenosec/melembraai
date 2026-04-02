import { AbacatePay } from "@abacatepay/sdk";

const abacate = AbacatePay({
  secret: process.env.ABACATEPAY_API_KEY!,
});

export { abacate };