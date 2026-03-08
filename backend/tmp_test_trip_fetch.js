import axios from 'axios';

const TRIP_ID = 'b8ef25df-baac-4d41-aa10-8a37ddfc9cdf';
const URL = `http://localhost:3001/api/trips/${TRIP_ID}`;

async function testFetch() {
    try {
        console.log(`Fetching ${URL}...`);
        const response = await axios.get(URL);
        console.log('Success:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFetch();
