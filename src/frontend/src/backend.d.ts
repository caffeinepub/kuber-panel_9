import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CommissionHistory {
    fundType: FundType;
    timestamp: Time;
    amount: bigint;
}
export interface BankAccount {
    status: AccountStatus;
    ifscCode: string;
    mobileNumber: string;
    bankName: string;
    accountType: string;
    upiId: string;
    accountNumber: string;
    accountHolder: string;
}
export type Time = bigint;
export interface UserProfile {
    commissionBalance: bigint;
    userId: string;
    withdrawalRequests: Array<CommissionWithdrawal>;
    isActive: boolean;
    email: string;
    commissionHistory: Array<CommissionHistory>;
    banks: Array<BankAccount>;
    passwordHash: string;
    registeredAt: Time;
    activatedFunds: Array<FundToggle>;
}
export interface Transaction {
    transactionType: TransactionType;
    userId: string;
    fundType: FundType;
    amount: bigint;
    datetime: Time;
    transactionId: string;
}
export interface FundActivation {
    usedByUserId?: string;
    code: string;
    createdAt: Time;
    isUsed: boolean;
    fundType: FundType;
}
export interface FundToggle {
    isActive: boolean;
    fundType: FundType;
}
export interface CommissionWithdrawal {
    id: string;
    status: CommissionStatus;
    method: CommissionMethod;
    userId: string;
    approvedAt?: Time;
    createdAt: Time;
    amount: bigint;
}
export interface SimpleUser {
    email: string;
    passwordHash: string;
    activatedFunds: Array<string>;
    registeredAt: Time;
}
export interface SimpleCode {
    code: string;
    fundType: string;
    isUsed: boolean;
    usedBy: string;
    createdAt: Time;
}
export enum AccountStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum CommissionMethod {
    upi = "upi",
    usdt = "usdt",
    bankTransfer = "bankTransfer"
}
export enum CommissionStatus {
    pending = "pending",
    approved = "approved"
}
export enum FundType {
    mix = "mix",
    gaming = "gaming",
    stock = "stock",
    political = "political"
}
export enum TransactionType {
    credit = "credit",
    debit = "debit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    activateFund(userId: string, fundType: FundType): Promise<boolean>;
    activateFundsBatch(codes: Array<[string, FundActivation]>): Promise<void>;
    addBankAccount(userId: string, account: BankAccount): Promise<void>;
    addBankAccountWithFunds(userId: string, account: BankAccount, selectedFunds: Array<FundType>, isActive: boolean): Promise<void>;
    addCommissionEntry(userId: string, fundType: FundType, amount: bigint): Promise<boolean>;
    addSupportLink(key: string, link: string): Promise<void>;
    addTransaction(transactionId: string, userId: string, fundType: FundType, amount: bigint, transactionType: TransactionType): Promise<boolean>;
    approveWithdrawal(userId: string, withdrawalId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deactivateFund(userId: string, fundType: FundType): Promise<boolean>;
    deleteUser(userId: string): Promise<void>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentUser(userId: string): Promise<UserProfile | null>;
    getFundActivationCodes(): Promise<Array<FundActivation>>;
    getNonAdminUser(userId: string): Promise<UserProfile | null>;
    getSupportLink(key: string): Promise<string | null>;
    getTransactions(userId: string): Promise<Array<Transaction>>;
    getUserProfile(userPrincipal: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    register(email: string, passwordHash: string): Promise<boolean>;
    requestWithdrawal(userId: string, method: CommissionMethod, amount: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    showToast(_message: string): Promise<void>;
    updateBankAccountStatus(userId: string, accountIndex: bigint, status: AccountStatus): Promise<void>;
    useActivationCode(code: string): Promise<boolean>;
    // Simple cross-device auth (no Principal required)
    simpleRegister(email: string, passwordHash: string): Promise<string>;
    simpleLogin(email: string, passwordHash: string): Promise<boolean>;
    adminSaveActivationCode(adminPassHash: string, code: string, fundType: string): Promise<boolean>;
    adminGetActivationCodes(adminPassHash: string): Promise<Array<SimpleCode>>;
    adminDeleteActivationCode(adminPassHash: string, code: string): Promise<boolean>;
    simpleUseCode(email: string, code: string): Promise<string>;
    getSimpleActivatedFunds(email: string): Promise<Array<string>>;
}
