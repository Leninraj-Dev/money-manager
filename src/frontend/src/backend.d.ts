import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FinancialSummary {
    totalIncome: bigint;
    totalExpenses: bigint;
    netBalance: bigint;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: number;
    transactionType: string;
    owner: Principal;
    date: Time;
    note: string;
    category: string;
    amount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTransaction(amount: bigint, transactionType: string, category: string, note: string, date: Time): Promise<number>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTransaction(id: number): Promise<void>;
    editTransaction(id: number, amount: bigint, transactionType: string, category: string, note: string, date: Time): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<string>>;
    getFinancialSummary(): Promise<FinancialSummary>;
    getTransaction(id: number): Promise<Transaction>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listTransactions(): Promise<Array<Transaction>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
