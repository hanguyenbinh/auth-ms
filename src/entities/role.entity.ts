import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Role {
    constructor(params: {
        roleName: string;
    }) {
        if (params) {
            this.roleName = params.roleName;
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, unique: true })
    roleName: string;

    @CreateDateColumn({ type: 'timestamp' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    public updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    public deletedAt: Date;

    @Column('varchar', { length: 36, nullable: true })
    public createdBy: string | undefined;
    @Column('varchar', { length: 36, nullable: true })
    public updatedBy: string | undefined;
    @Column('varchar', { length: 36, nullable: true })
    public deletedBy: string | undefined;

    toJSON() {
        return {
            id: this.id,
            roleName: this.roleName,
        };
    }
}
