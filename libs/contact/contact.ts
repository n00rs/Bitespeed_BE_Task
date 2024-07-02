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

  // array to hold params f
  let arrParams: string[] = [strPhoneNumber ?? null, strEmail ?? null];

  if (!strEmail && !strPhoneNumber)
    throw new Error("PLEASE_PROVIDE_AN_EMAIL_OR_PHONE_NUMBER");

  const objConnection = await createPgConnection();
  let objReturn: TobjResponse;
  try {
    await objConnection.query("BEGIN");
    // basic validations
    // getting contact data
    let strReplaceKey = "(c.phone_number = $1 OR c.email = $2)";
    if (!strEmail && strPhoneNumber) {
      strReplaceKey = "(c.phone_number = $1)";
      arrParams = [strPhoneNumber];
    }
    if (strEmail && !strPhoneNumber) {
      strReplaceKey = "(c.email = $1)";
      arrParams = [strEmail];
    }
    const strQuery = objQueries["objGet"]["strGetContactDetails"].replace(
      /{WHERE}/g,
      strReplaceKey
    );
    console.log(strQuery, arrParams);
    const { rows: arrContact }: { rows: TobjSelectContact[] } =
      await objConnection.query(strQuery, arrParams);

    // if no contact details exists in database insert new data
    if (!arrContact.length) {
      arrParams.push("primary", null);
      const { rows: arrReturnedId, rowCount: intInsertCount }: TobjInsertRes =
        await objConnection.query(
          objQueries["objCreate"]["strCreateNewContact"],
          arrParams
        );

      if (!intInsertCount) throw new Error("ERROR_WHILE_INSERTING_NEW_DATA");
      objReturn = {
        primaryContatctId: arrReturnedId?.[0]?.["id"],
        emails: [arrReturnedId?.[0]?.["email"]],
        phoneNumbers: [arrReturnedId?.[0]?.["phone_number"]],
        secondaryContactIds: [],
      };
    } else {
      const arrEmails: Array<string> = [];
      const arrPhone: Array<string> = [];
      let objPrimaryContact = null;
      const arrPrimaryContacts = [];
      let blnNewSecondaryContact = false;
      const arrSecondaryId = [];

      arrContact.forEach((objContact) => {
        // if both email and phone is not same then create an new secondary contact
        blnNewSecondaryContact =
          (objContact["phoneNumber"] != strPhoneNumber &&
            objContact.email == strEmail) ||
          (objContact["phoneNumber"] == strPhoneNumber &&
            objContact.email != strEmail);

        if (objContact["linkPrecedence"] === "secondary")
          arrSecondaryId.push(objContact["id"]);
        if (objContact["linkPrecedence"] === "primary") {
          objPrimaryContact = objContact;
          arrPrimaryContacts.push(objContact);
        } else {
          objContact["email"] && arrEmails.push(objContact["email"]);
          objContact["phoneNumber"] && arrPhone.push(objContact["phoneNumber"]);
        }
      });
      if (!objPrimaryContact) {
        objPrimaryContact = arrContact[0];
        arrSecondaryId.splice(0, 1);
      }
      if (arrPrimaryContacts.length > 1) {
        // const objNewSecondary =
        const arrParams = ["secondary"];

        if (
          new Date(arrPrimaryContacts[0]["createdAt"]) <
          new Date(arrPrimaryContacts[1]["createdAt"])
        ) {
          arrParams.push(
            arrPrimaryContacts[0]["id"],
            arrPrimaryContacts[1]["id"]
          );
          objPrimaryContact = arrPrimaryContacts[0];
          arrSecondaryId.push(arrPrimaryContacts[1]["id"]);

          arrPrimaryContacts[1]["email"] &&
            arrEmails.push(arrPrimaryContacts[1]["email"]);
          arrPrimaryContacts[1]["phoneNumber"] &&
            arrPhone.push(arrPrimaryContacts[1]["phoneNumber"]);
        } else {
          objPrimaryContact = arrPrimaryContacts[1];
          arrParams.push(
            arrPrimaryContacts[1]["id"],
            arrPrimaryContacts[0]["id"]
          );
          arrSecondaryId.push(arrPrimaryContacts[0]["id"]);
          arrPrimaryContacts[0]["email"] &&
            arrEmails.push(arrPrimaryContacts[0]["email"]);
          arrPrimaryContacts[0]["phoneNumber"] &&
            arrPhone.push(arrPrimaryContacts[0]["phoneNumber"]);
        }

        await objConnection.query(
          objQueries["objUpdate"]["strUpdatePrimary"],
          arrParams
        );
      }

      // add new secondary contact
      if (arrPrimaryContacts.length <= 1 && !blnNewSecondaryContact) {
        const { rows: arrReturned }: TobjInsertRes = await objConnection.query(
          objQueries["objCreate"]["strCreateNewContact"],
          [strPhoneNumber, strEmail, "secondary", objPrimaryContact["id"]]
        );

        arrReturned?.[0]?.["email"] &&
          arrEmails.push(arrReturned?.[0]?.["email"]);
        arrReturned?.[0]?.["phone_number"] &&
          arrPhone.push(arrReturned?.[0]?.["phone_number"]);
        arrSecondaryId.push(arrReturned?.[0]?.["id"]);
      }
      objPrimaryContact?.["email"] &&
        arrEmails.unshift(objPrimaryContact["email"]);
      objPrimaryContact?.["phoneNumber"] &&
        arrPhone.unshift(objPrimaryContact["phoneNumber"]);
      objReturn = {
        emails: [...new Set(arrEmails)],
        phoneNumbers: [...new Set(arrPhone)],
        primaryContatctId: objPrimaryContact["id"],
        secondaryContactIds: arrSecondaryId,
      };
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
