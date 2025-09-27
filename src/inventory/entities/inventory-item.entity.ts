import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('inventory_items')
@Index(['quantity']) // Only index non-unique columns
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  unitPrice: number;

  @Column({ unique: true, length: 100, nullable: true })
  sku: string;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @Column({ name: 'updated_by_id' })
  updatedById: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.createdItems, { eager: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedItems, { eager: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;
}
