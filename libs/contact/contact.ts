import {
  TobjContactParams,
  TobjInsertRes,
  TobjResponse,
  TobjSelectContact,
} from "./contact.type";
import { createPgConnection } from "../../db/postgres.config";
import objQueries from "./query";
export default identityReconciliation;

async function identityReconciliation({
  email = "",
  phoneNumber,
}: TobjContactParams): Promise<TobjResponse> {
  const strEmail = email?.trim();
  const strPhoneNumber = phoneNumber?.toString().trim();

  // array to hold params for await objConnection.query
  const arrParams: string[] = [strPhoneNumber, strEmail];
  // // to keep track of params
  // let intIndex = 1;
  // // replace string to replace {WHERE} in await objConnection.query
  // let strReplaceKey = '';
  // if (strEmail) {
  //     strReplaceKey += `AND c.email = $${intIndex++}`;
  //     arrParams.push(strEmail);
  // }
  // if(strPhoneNumber){
  //     strReplaceKey += `AND c.email = $${intIndex++}`;
  //     arrParams.push(strPhoneNumber);
  // }
  // creating postgres connection
  if (!strEmail && !strPhoneNumber)
    throw new Error("PLEASE_PROVIDE_AN_EMAIL_OR_PHONE_NUMBER");
  const objConnection = await createPgConnection();
  let objReturn: TobjResponse = {
    emails: [],
    phoneNumbers: [],
    primaryContatctId: 0,
    secondaryContactIds: [],
  };
  try {
    await objConnection.query("BEGIN");
    // basic validations
    // getting contact data
    const objData = await objConnection.query("SELECT * FROM contact");
    const { rows: arrContact }: { rows: TobjSelectContact[] | any[] } =
      await objConnection.query(
        objQueries["objGet"]["strGetContactDetails"],
        arrParams
      );
    console.log({ arrContact });

    // if no contact details exists in database insert new data
    if (!arrContact.length) {
      arrParams.push("primary", null);
      const { rows: arrReturnedId, rowCount: intInsertCount }: TobjInsertRes =
        await objConnection.query(
          objQueries["objCreate"]["strCreateNewContact"],
          arrParams
        );
      console.log({ arrReturnedId, intInsertCount });

      if (!intInsertCount) throw new Error("ERROR_WHILE_INSERTING_NEW_DATA");
      objReturn = {
        primaryContatctId: arrReturnedId?.[0]?.["id"],
        emails: [arrReturnedId?.[0]?.["email"]],
        phoneNumbers: [arrReturnedId?.[0]?.["phone_number"]],
        secondaryContactIds: [],
      };
    } else {
      const setEmails = new Set();
      const setPhone = new Set();
      let objPrimaryContact = null;
      const arrPrimaryContacts = [];
      let blnNewSecondaryContact = false;
      const arrSecondaryId = [];

      arrContact.forEach((objContact) => {
        // if both email and phone is not same then create an new secondary contact
        if (
          !(
            objContact["email"] === strEmail &&
            objContact["phoneNumber"] === strPhoneNumber
          )
        )
          blnNewSecondaryContact = true;

        if (objContact["linkPrecedence"] === "secondary")
          arrSecondaryId.push(objContact["id"]);
        if (objContact["linkPrecedence"] === "primary") {
          objPrimaryContact = objContact;
          arrPrimaryContacts.push(objContact);
        }
        objContact["email"] && setEmails.add(objContact["email"]);
        objContact["phoneNumber"] && setPhone.add(objContact["phoneNumber"]);
      });
      // add new secondary contact
      if (blnNewSecondaryContact) {
        const { rows: arrReturned, rowCount: intInsertCount }: TobjInsertRes =
          await objConnection.query(
            objQueries["objCreate"]["strCreateNewContact"],
            [strPhoneNumber, strEmail, "secondary", objPrimaryContact["id"]]
          );

        setEmails.add(arrReturned?.[0]?.["email"]);
        setPhone.add(arrReturned?.[0]?.["phoneNumber"]);
        arrSecondaryId.push(arrReturned?.[0]?.["id"]);
      }

      if (arrPrimaryContacts.length>1) {
        
        
      }
    }
    await objConnection.query("COMMIT");
    return objReturn;
  } catch (err) {
    await objConnection.query("ROLLBACK");
    throw new Error(err);
  } finally {
    await objConnection?.end();
  }
}
