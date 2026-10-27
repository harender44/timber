export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  wood: string;
  summary: string;
  description: string;
  images: string[];
};

export type InquiryLine = {
  sku: string;
  name: string;
  quantity: number;
  notes: string;
};

export type Inquiry = {
  id: number;
  name: string;
  mobile: string;
  address: string;
  pincode: string;
  company: string;
  notes: string;
  items: InquiryLine[];
  status: string;
  created_at: string;
};
