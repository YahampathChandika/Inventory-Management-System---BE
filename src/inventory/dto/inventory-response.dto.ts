export class InventoryResponseDto {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  sku: string;
  createdBy: {
    id: number;
    username: string;
  };
  updatedBy: {
    id: number;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
