const fetch = require("node-fetch");
const API_CHATWOOD = process.env.API_CHATWOOD;
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const INBOX_ID = process.env.INBOX_ID;


const headers = {
    "api_access_token": API_ACCESS_TOKEN,
    "Content-Type": "application/json"
};

const sendMessageChatWood = async (msg = "", message_type = "") => {
   
    const body = JSON.stringify({
        content: msg,
        message_type: message_type,
        private: true,
        content_attributes: {}
    });

    const requestOptions = {
        method: "POST",
        headers: headers,
        body: body
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/${ACCOUNT_ID}/conversations/1/messages`,
        requestOptions
    );
    const data = await dataRaw.json();
    return data;
};


const createContact = async (phone_number, name, email ) => {
    const body = JSON.stringify({
        inbox_id: INBOX_ID,
        name,
        email,
        phone_number
    });

    const requestOptions = {
        method: "POST",
        headers,
        body
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/${ACCOUNT_ID}/contacts`,
        requestOptions
    );
    const data = await dataRaw.json();

    if (dataRaw.status === 200) {  // Asumiendo que un status de 200 significa éxito
        return data.payload.contact.id;  // Devuelve el ID del nuevo contacto
    } else if (data.message && data.message.includes("Email has already been taken")) {
        return 0;  // Devuelve 0 si el contacto ya existe
    } else {
        throw new Error(`Unexpected error: ${data.message || "Unknown error"}`);
    }
};


const searchContact = async (query) => {
    const requestOptions = {
        method: "GET",
        headers
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/${ACCOUNT_ID}/contacts/search?q=${query}`,
        requestOptions
    );
    const data = await dataRaw.json();

    if (data.meta && data.meta.count > 0) {
        return data.payload[0].id;  // Devuelve el ID del primer contacto que coincida
    } else {
        return 0;  // Devuelve 0 si no se encuentra ningún contacto
    }
};


const createConversation = async (source_id, inbox_id, contact_id, status = 'open', assignee_id, team_id, additional_attributes = {}, custom_attributes = {}) => {
    const body = JSON.stringify({
        source_id,
        inbox_id,
        contact_id,
        additional_attributes,
        custom_attributes,
        status,
        assignee_id,
        team_id
    });

    const requestOptions = {
        method: 'POST',
        headers,
        body
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/${ACCOUNT_ID}/conversations`,
        requestOptions
    );
    
    const data = await dataRaw.json();

    if (dataRaw.status !== 200) {
        throw new Error('Error al crear la conversación');
    }

    return data.id; // Devuelve el ID de la conversación creada
};



const sendMessage = async (account_id, conversation_id, content, message_type = "outgoing", private = false, content_type = "text", content_attributes = {}) => {
    const body = JSON.stringify({
        content,
        message_type,
        private,
        content_type,
        content_attributes
    });

    const requestOptions = {
        method: "POST",
        headers,
        body
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/${account_id}/conversations/${conversation_id}/messages`,
        requestOptions
    );
    const data = await dataRaw.json();
    return data;
};




const listAgents = async () => {
    const requestOptions = {
        method: "GET",
        headers
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/${ACCOUNT_ID}/agents`,
        requestOptions
    );

    if (dataRaw.status !== 200) {
        throw new Error("Failed to fetch agents");
    }

    const data = await dataRaw.json();

    // Lista de agentes y administradores con sus IDs
    const agentList = data.map(agent => ({ id: agent.id, name: agent.name, role: agent.role }));

    return agentList;
};

const listTeams = async () => {
    const requestOptions = {
        method: "GET",
        headers
    };

    const dataRaw = await fetch(
        `${API_CHATWOOD}/api/v1/accounts/${ACCOUNT_ID}/teams`,
        requestOptions
    );

    if (dataRaw.status !== 200) {
        throw new Error("Failed to fetch teams");
    }

    const data = await dataRaw.json();
    console.log(data);
    // Lista de todos los equipos con sus IDs y nombres
    const teamList = data.map(team => ({ id: team.id, name: team.name }));

    return teamList;
};



module.exports = { sendMessageChatWood, createContact, searchContact, listAgents, listTeams, createConversation, sendMessage };
