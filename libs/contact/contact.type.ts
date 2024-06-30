
export type TobjContactParams = {
    "email"?: string,
    "phoneNumber"?: string | number;
};

export type TobjResponse = {
    "primaryContatctId": number,
    "emails": string[], // first element being email of primary contact
    "phoneNumbers": string[], // first element being phoneNumber of primary contact
    "secondaryContactIds": number[]; // Array of all Contact IDs that are "secondary Contact
};

export type TobjInsertRes = {
    rows: Array<{ id: number; }> | any[],
    rowCount: number;
};

export type TobjSelectContact = {
    "id": number,
    "phoneNumber": string,
    "email": string,
    "linkedId": number | null,
    "linkPrecedence": "secondary" | "primary";

};