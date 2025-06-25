export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SYe4KR3Cc2nbir',
    priceId: 'price_1RdWmNKsSe9AMVPFcox1OLHf',
    name: 'n8n MasterClass - Creating Agents and Automations',
    description: 'Master workflow automation from beginner to advanced user. Build powerful agents and connect your entire tech stack.',
    mode: 'payment',
    price: 297.00,
    currency: 'usd'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};