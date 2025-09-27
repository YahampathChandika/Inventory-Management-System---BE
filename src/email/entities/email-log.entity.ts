import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('email_logs')
@Index(['status'])
@Index(['createdAt'])
@Index(['recipientEmail'])
export class EmailLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recipient_email', length: 255 })
  recipientEmail: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING,
  })
  status: EmailStatus;

  @Column({ name: 'sent_by_id' })
  sentById: number;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.sentEmails, { eager: true })
  @JoinColumn({ name: 'sent_by_id' })
  sentBy: User;
}
