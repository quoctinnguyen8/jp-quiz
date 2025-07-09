export default {
  async get(url, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const resp = await fetch(`${url}?${queryString}`, {
        method: "GET",
        // mode: "no-cors",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain",
        },
      });
      const data = await resp.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },
  async post(url, body = {}) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      return data;
    } catch (error) {
      console.error("Error posting data:", error);
      throw error;
    }
  },
};
