interface User {
    id: number;
    username: string;
}

let currentUser: User | null = null;
const subscribers: Array<(user: User | null) => void> = [];

export function getCurrentUser(): User | null {
    return currentUser;
}

export function setCurrentUser(user: User | null): void {
    currentUser = user;
    subscribers.forEach(callback => callback(currentUser));
}

export function subscribe(callback: (user: User | null) => void): () => void {
    subscribers.push(callback);
    return () => { 
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    };
}