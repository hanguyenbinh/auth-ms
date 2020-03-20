import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NestCloud } from '@nestcloud/core';

@Entity()
export class Manager {
    constructor(params: {
        email: string;
        password: string;
        phoneNumber: string;
        companyName: string;
    }) {
        if (params) {
            this.email = params.email;
            this.password = params.password;
            this.phoneNumber = params.phoneNumber;
            this.companyName = params.companyName;
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, unique: true })
    email: string;

    @Column('varchar', { length: 100, nullable: true })
    password: string | undefined;

    @Column('varchar', { length: 20, nullable: true })
    phoneNumber: string;

    @Column('varchar', { length: 100, nullable: true })
    companyName: string;

    @Column('varchar', { length: 100, nullable: true })
    facebookName: string;

    @Column('boolean', { default: false })
    isGoogleAccount: boolean;

    @Column('boolean', { default: false })
    isFacebookAccount: boolean;

    @Column('varchar', { length: 400, nullable: true})
    changePasswordHash: string;

    @Column('boolean', { default: false })
    isBanned: boolean;

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

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        this.password = await bcrypt.hash(
            this.password,
            NestCloud.global.boot.get('bcrypt.salt', 12),
        );
    }

    async comparePassword(attempt: string): Promise<boolean> {
        return await bcrypt.compare(attempt, this.password);
    }
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            phoneNumber: this.phoneNumber,
            companyName: this.companyName,
        };
    }
}
