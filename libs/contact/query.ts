const objQueries = {
  objGet: {
    strGetContactDetails: `
        SELECT 
        c.id AS "id",
        c.phone_number AS "phoneNumber",
        c.email AS "email",
        c.linked_id AS "linkedId",
        c.link_precedence AS "linkPrecedence",
        c.created_at AS "createdAt"
        FROM contact c
        LEFT JOIN contact S ON s.linked_id = c.id AND s.deleted_at IS NULL
--        WHERE c.deleted_at IS NULL AND (c.phone_number = $1 OR c.email = $2) 
WHERE c.deleted_at IS NULL AND s.deleted_at IS NULL AND
		
((c.phone_number = $1 OR c.email = $2) OR
  (s.phone_number = $1 OR s.email = $2)
) 
ORDER BY c.created_at DESC 
        `,
  },
  objCreate: {
    strCreateNewContact: ` 
        INSERT INTO contact(
            phone_number,
            email,
            link_precedence,
            linked_id
            )VALUES ($1,$2,$3,$4) RETURNING *
        
        `,
  },
  objUpdate: {
    strUpdatePrimary: ` 
    UPDATE contact 
    SET 
    link_precedence = $1,
    linked_id = $2
    WHERE id = $3
    `,
  },
};
export default objQueries;