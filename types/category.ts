export interface Category {
  id: string;
  name: string;
}

export type CreateCategoryInput = Pick<Category, "name">;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;
