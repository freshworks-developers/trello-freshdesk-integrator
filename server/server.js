'use strict';

/**
 * Get Trello Card data from the data storage
 *
 * @param {number} CardId - card id to be searched
 */
async function lookupTicketId(cardId) {
  let dbKey = String(`trelloCard:${cardId}`).substring(0, 30);
  return await $db.get(dbKey);
}

/**
 * Get Card comment data from the data storage
 *
 * @param {number} ActionId - Action id of the comment to be searched 
 */

async function lookupNoteId(actionId) {
  let dbKey = String(`commentCard:${actionId}`).substring(0, 30);
  return await $db.get(dbKey);
}

/**
 * Store card comment data in the data storage
 *
 * @param {Object} data - Note data to be stored
 */
async function setNoteId(data) {
  try {
    let dbKey = String(`commentCard:${data.actionId}`).substring(0, 30);
    await $db.set(dbKey, { note_data: data });
    console.info('A note is successfully created for this ticket');
  }
  catch (error) {
    console.error("Unable to persist data ");
    console.error(error);
  };
}

/**
 * Store webhook data in the data storage
 *
 * @param {Object} data - webhook data to be stored
 */
async function setWebhookId(data) {
  try {
    let dbKey = String(`trelloWebhook`).substring(0, 30);
    await $db.set(dbKey, { webhook_data: data });
    console.info('Successfully stored the webhook in the db');
    renderData();
  }
  catch (error) {
    console.error('Error: Failed to store the webhook the db');
    console.error(error);
    renderData({ message: 'The webhook registration failed' });
  };
}


/**
 * delete webhook data in the data storage
 */
async function removeWebhookId() {
  try {
    let dbKey = String(`trelloWebhook`).substring(0, 30);
    await $db.delete(dbKey);
    console.info("webhook is deleted successfully");
  }
  catch (error) {
    console.error('Failed to delete the webhook from db');
    console.error(error);
  };
}

/**
 * delete Card comment data from the data storage
 *
 * @param {number} ActionId - Action id of the comment to be searched 
 */

async function removeData(actionID) {
  let dbKey = String(`commentCard:${actionID}`).substring(0, 30);
  await $db.delete(dbKey);
  console.info("note for this ticket is deleted successfully");

}

exports = {
  // args['iparams'] will contain the installation parameter values.
  // args is a JSON block containing the payload information.

  getListSMI: async function (args) {
    try {
      let data = await $request.invokeTemplate("getListSMI", {
        iparam: args.iparams
      });
      let listData = JSON.parse(data.response);
      renderData(null, listData);
    }
    catch (error) {
      console.error("Error while attempting to fetch lists");
      console.error(error);
      renderData(error, null);
    }
  },

  getMemberSMI: async function (args) {
    try {
      let data = await $request.invokeTemplate("getMemberSMI", {
        iparam: args.iparams
      });
      let memberData = JSON.parse(data.response);
      renderData(null, memberData);
    }
    catch (error) {
      console.error("Error while attempting to fetch members");
      console.error(error);
      renderData(error, null);
    }
  },

  fetchCardSMI: async function (args) {
    try {
      let data = await $request.invokeTemplate("fetchCardSMI", {
        iparam: args.iparams,
        context: {cardID: args.cardID}
      });
      let cardData = JSON.parse(data.response);
      renderData(null, cardData);
    }
    catch (error) {
      console.error("Error while attempting to view Card");
      console.error(error);
      renderData(error, null);
    }
  },

  postCardSMI: async function (args) {
    try {
      let data = await $request.invokeTemplate("postCardSMI", {
        iparam: args.iparams,
        context: {
          idList: args.idList,
          idMembers: args.idMembers,
          name: args.name,
          desc: args.desc,
          due: args.due
        }
      });
      let cardData = JSON.parse(data.response);
      renderData(null, cardData);
    }
    catch (error) {
      console.error("Error while attempting to create Card");
      console.error(error);
      renderData(error, null);
    }
  },

  postLabelSMI: async function (args) {
    try {
      let data = await $request.invokeTemplate("postLabelSMI", {
        iparam: args.iparams,
        context: {
          cardId: args.cardId,
          name: args.name,
          color: args.color
        }
      });
      renderData(null, data);
    }
    catch (error) {
      console.error("Error while attempting to create label");
      console.error(error);
      renderData(error, null);
    }
  },

  deleteCardSMI: async function (args) {
    try {
      let data = await $request.invokeTemplate("deleteCardSMI", {
        iparam: args.iparams,
        context: {
          cardID: args.cardID
        }
      });
      renderData(null, data);
    }
    catch (error) {
      console.error("Error while attempting to delete card");
      console.error(error);
      renderData(error, null);
    }
  },

  onInstallHandler: async function (args) {
    try {
      const targetUrl = await generateTargetUrl();
      const desc = "fd trello integration webhook";
      const data = await $request.invokeTemplate("createWebhook", {
        iparam: args.iparams,
        context: {
          desc: desc,
          targetUrl: targetUrl
        }
      });
      let jsonData = JSON.parse(data.response);
      let webhookData = { webhookId: jsonData.id, url: jsonData.callbackURL };
      setWebhookId(webhookData);
    } catch (error) {
      console.error('Error: Failed to register the webhook for trello');
      console.error(error);
      renderData({ message: 'The webhook registration failed' });
    }
  },

  onUnInstallHandler: async function (args) {
    let dbkey = String(`trelloWebhook`).substring(0, 30);
    try {
      const data = await $db.get(dbkey);
      await $request.invokeTemplate("deleteWebhook", {
        iparam: args.iparams,
        context: {
          webhookId: data.webhook_data.webhookId
        }
      });
      console.info('Successfully deregistered the webhook');
      removeWebhookId();
      renderData();
    } catch (error) {
      console.error('Error: Failed to get the stored webhook URL from the db');
      console.error(error);
      renderData({ message: 'The webhook deregistration failed' });
    }
  },

  // payload is a JSON block containing the payload information.
  onExternalEventHandler: async function (payloadData) {
    let payload = payloadData.data;
    let link = `https://trello.com/c/${payload.action.data.card.shortLink}`;
    if (payload.action.type === 'commentCard') {
      try {
        const data = await lookupTicketId(payload.action.data.card.id);
        const body = `<p>username: ${payload.action.memberCreator.username}</p><p>comment: ${payload.action.data.text}</p><br><a href=${link} target="_blank" >view in trello</a>`;
        const response = await $request.invokeTemplate("addNote", {
          iparam: payloadData.iparams,
          context: {
            ticketID: data.card_data.ticketID,
          },
          body: JSON.stringify(body)
        });
        console.info('Successfully added note in the Freshdesk ticket');
        let noteData = { actionId: payload.action.id, noteId: JSON.parse(response.response).id };
        setNoteId(noteData);
      } catch (error) {
        console.error('Error: Failed to get card data. Unable to create note');
        console.error(error);
      }
    } else if (payload.action.type === 'updateComment') {
      try {
        const data = await lookupNoteId(payload.action.data.action.id);
        const body = `<p>username: ${payload.action.memberCreator.username}</p><p>comment: ${payload.action.data.action.text}</p><br><a href=${link} target="_blank" >view in trello</a>`;
        await $request.invokeTemplate("updateNote", {
          iparam: payloadData.iparams,
          context: {
            noteId: data.note_data.noteId
          },
          body: JSON.stringify(body)
        });
        console.info('Successfully updated note in the Freshdesk ticket');
      } catch (error) {
        console.error('Error: Failed to get note data. Unable to update note');
        console.error(error);
      }
    }else if (payload.action.type === 'deleteComment') {
      try {
        const data = await lookupNoteId(payload.action.data.action.id);
        await $request.invokeTemplate("deleteNote", {
          iparam: payloadData.iparams,
          context: {
            noteId: data.note_data.noteId
          }
        });
        console.info('Successfully deleted note in the Freshdesk ticket');
        removeData(payload.action.data.action.id);
      } catch (error) {
        console.error('Error: Failed to get note data. Unable to delete note');
        console.error(error);
      }
    } else {
      console.info("This action of the trello card is not defined in app's use case");
    }
  }
};

