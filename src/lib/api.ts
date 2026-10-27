import type { Inquiry, Product } from "./types";

const base = "/timber-api";

async function readError(res: Response) {
  try {
    const data = (await res.json()) as { detail?: string };
    return data.detail || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${base}/products`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${base}/products/${id}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function submitInquiry(body: {
  name: string;
  mobile: string;
  address: string;
  pincode: string;
  company: string;
  notes: string;
  items: { sku: string; name: string; quantity: number; notes: string }[];
}): Promise<{ id: number }> {
  const res = await fetch(`${base}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function adminLogin(password: string): Promise<string> {
  const res = await fetch(`${base}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function fetchInquiries(token: string): Promise<Inquiry[]> {
  const res = await fetch(`${base}/inquiries`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function setInquiryStatus(token: string, id: number, status: string) {
  const res = await fetch(`${base}/inquiries/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function createProduct(
  token: string,
  body: Omit<Product, "id">,
): Promise<Product> {
  const res = await fetch(`${base}/products`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function removeProduct(token: string, id: number) {
  const res = await fetch(`${base}/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await readError(res));
}
