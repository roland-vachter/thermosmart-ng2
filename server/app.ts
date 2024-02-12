import initExpress from "./express";
import * as socketIo from './lib/services/socketio';
import initDb from './lib/services/db';
import * as websocket from './lib/services/websocket';
import * as passportAuth from './lib/services/passportAuth';
import * as socketControllersFrontend from './lib/socketControllers/frontend';
import * as socketControllersSensor from './lib/socketControllers/sensor';
import { initSecurity } from "./lib/services/securityStatus";
import { initStatistics } from "./lib/services/statistics";

void (async () => {
  const server = initExpress();
  await initDb();
  socketIo.init(server);
  websocket.init(server);
  passportAuth.init();
  await socketControllersFrontend.init();
  await socketControllersSensor.init();
  void initStatistics();
  void initSecurity();

  process.on("SIGTERM", () => {
    // eslint-disable-next-line no-console
    console.log("SIGTERM signal received.");
    // eslint-disable-next-line no-console
    console.log("Closing Express Server");
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log("Express server closed.");
    });
  });
})();
