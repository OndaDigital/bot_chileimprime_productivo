require('dotenv').config();
const OpenAI = require('openai');

// gets API Key from environment variable OPENAI_API_KEY
const openai = new OpenAI();

const completion = async (dataIn = '') => {

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',  // Asegúrate de usar el modelo correcto aquí
        messages: [{ role: 'user', content: dataIn }],
    });
    
    return response.choices[0]?.message?.content;
}

module.exports = {
    completion: completion,
    // otraFuncion: otraFuncion
};
