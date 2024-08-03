const axios = require('axios');


const CONTACT_SERVICE_URL = process.env.CONTACT_SERVICE_URL;

async function getPersonInfo(personId) {
    try {
        const response = await axios.get(`${CONTACT_SERVICE_URL}/${personId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching person info for ID ${personId}:`, error.message);
        throw new Error(`Failed to fetch person info for ID ${personId}`);
    }
}

module.exports = {
    getPersonInfo,
};
