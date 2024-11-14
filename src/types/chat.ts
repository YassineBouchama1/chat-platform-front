


export enum StatusUser {
    OFFLINE = 'OFFLINE',
    ONLINE = 'ONLINE',
    BANNED = 'BANNED',
}
export interface Member {
    _id: string;
    username: string;
    avatar: string;
    email: string;
    status: StatusUser
}

export interface Chat {
    _id: string;
    type: 'PUBLIC' | 'PRIVATE';
    isPrivate: boolean;
    isSafeMode: boolean;
    name: string;
    owner?: string;
    members: Member[];
    moderators: Member[];
    bannedWords: string[];
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;

    lastMessage?: string;
}


export interface NewChatData {
    type?: 'PUBLIC' | 'PRIVATE';
    isPrivate?: boolean;
    isSafeMode?: boolean;
    name?: string;
    owner?: string;
    members?: Member[];
    moderators?: Member[];
    bannedWords?: string[];
    isGroup?: boolean;
}

export interface UpdateChatData extends Partial<NewChatData> {

    id: string
}


export type ChatResponse = Chat[];



