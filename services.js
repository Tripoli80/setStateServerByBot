const axios = require("axios");
const { uuid } = require("uuidv4");
require("dotenv").config();

async function getToken() {
  const { grant_type, client_id, client_secret, username, password } =
    process.env;
  try {
    const data = new URLSearchParams();
    data.append("grant_type", grant_type);
    data.append("client_id", client_id);
    data.append("client_secret", client_secret);
    data.append("username", username);
    data.append("password", password);

    const response = await axios.post(
      "https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token",
      data
    );
    return response.data.access_token;
  } catch (error) {
    console.error(error);
  }
}
async function getInstance(ACCESS_TOKEN) {
  try {
    const url = "https://api.contabo.com/v1/compute/instances";
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "x-request-id": "51A87ECD-754E-4104-9C54-D01AD0F83406",
        "x-trace-id": "123213",
      },
    };

    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function stopInstance(ACCESS_TOKEN, instanceId) {
  try {
    const url = `https://api.contabo.com/v1/compute/instances/${instanceId}/actions/stop`;
    const config = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "x-request-id": uuid(),
        "x-trace-id": "123213",
      },
    };

    const response = await axios.post(url, {}, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function startInstance(ACCESS_TOKEN, instanceId) {
  const url = `https://api.contabo.com/v1/compute/instances/${instanceId}/actions/start`;
  const config = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "x-request-id": uuid(),
      "x-trace-id": "123213",
    },
  };

  try {
    const response = await axios.post(url, {}, config);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { getToken, getInstance, stopInstance, startInstance };
