export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: string;
  photoUri?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export type CreateTransactionInput = Pick<
  Transaction,
  "amount" | "type" | "description" | "categoryId" | "photoUri" | "location"
>;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;
