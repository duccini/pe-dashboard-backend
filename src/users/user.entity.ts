import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './roles.enum';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' }) // Garante que a data de criação seja gerada automaticamente
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' }) // Garante que a data de atualização seja gerada automaticamente
  updatedAt: Date;

  // Getter virtual para retornar o id como string
  get id(): string {
    return this._id ? this._id.toString() : '';
  }

  // Setter virtual para aceitar string e converter para ObjectId
  set id(value: string | ObjectId) {
    if (typeof value === 'string') {
      this._id = new ObjectId(value);
    } else {
      this._id = value;
    }
  }
}
