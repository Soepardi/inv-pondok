export interface Institution {
  id: number;
  name: string;
  code: string;
}

export interface ItemForm {
  id?: number;
  item_code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  location: string;
  status: 'baik' | 'rusak' | 'diperbaiki';
  condition: 'tersedia' | 'dipinjam' | 'hilang';
  institution_id: number;
  photo: File | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Item extends Omit<ItemForm, 'photo'> {
  id: number;
  photo?: string; // path/url dari server
  institution?: Institution;
}
