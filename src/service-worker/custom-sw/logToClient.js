export const logToClient = (message) => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "SW_LOG",
        message,
      });
    });
  });
};
