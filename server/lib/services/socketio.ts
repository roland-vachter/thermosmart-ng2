import { Server } from "socket.io";
import { Server as HttpServer } from 'http';

export let socketIo: Server;

export const init = (httpServer: HttpServer) => {
	socketIo = new Server(httpServer);
};
