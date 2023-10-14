const API_CHATWOOD = "https://app.chatwoot.com";
const sendMessageChatWood = async (msg = "", message_type = "") => {
    var myHeaders = new Headers();
    myHeaders.append("api_access_token", "9Wy2ciqDwE7nbWtQTqUwZ6N1");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        content: msg,
        message_type: message_type,  // "incoming",
        private: true,
        content_attributes: {},
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/88127/conversations/1/messages`,
         requestOptions
         );
    const data = await dataRaw.json();
    return data;
};

module.exports = { sendMessageChatWood };
