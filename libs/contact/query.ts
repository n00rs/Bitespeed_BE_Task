const objQueries = {
    objGet: {
        strGetContactDetails: `
        SELECT 
        c.id AS "id",
        c.phone_number AS "phoneNumber",
        c.email AS "email",
        c.linked_id AS "linkedId",
        c.link_precedence AS "linkPrecedence",
        c.crea
        FROM contact c
        WHERE c.deleted_at IS NULL AND (c.phone_number = $1 OR c.email = $2) 
        `
    },
    objCreate: {
        strCreateNewContact: ` 
        INSERT INTO contact(
            phone_number,
            email,
            link_precedence,
            linked_id,
            )VALUES ($1,$2,$3,$4) RETURNING *
        
        `
    },
    objUpdate: {},
};
export default objQueries;