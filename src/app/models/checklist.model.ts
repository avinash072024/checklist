export interface UserRef {
    _id: string;
    username: string;
    email: string;
}

export interface ListItem {
    _id?: string;
    text: string;
    completed?: boolean;
    completedBy?: string | UserRef | null;
    createdBy?: string | UserRef;
}

export interface CreateChecklistPayload {
    title: string;
    listItems?: ListItem[] | string[];
}

export interface Checklist extends CreateChecklistPayload {
    _id: string;
    listItems: ListItem[];
    createdBy: string | UserRef;
    isFreeze: boolean;
    createdAt?: string;
    updatedAt?: string;
}