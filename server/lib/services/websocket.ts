import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import apiKeyAuthorization from '../middlewares/apiKey';
import { Server } from 'http';
import { Request, Response } from 'express';

interface WebSocketWithFlag extends WebSocket {
	isAlive?: boolean;
}

interface WssByPath {
	wss?: WebSocketServer;
	connections: WebSocketWithFlag[];
	children: Record<string, WssByPath>;
}

let initialized = false;

const wssByPaths: WssByPath = {
	connections: [],
	children: {}
};

const heartbeat = (wss: WssByPath) => {
	if (wss.children) {
		Object.keys(wss.children).forEach(p => {
			let i = 0;
			while (i < wss.children[p].connections.length) {
				const ws = wss.children[p].connections[i];
				if (ws.isAlive === false) {
					ws.terminate();
					wss.children[p].connections.splice(i, 1);
				} else {
					ws.isAlive = false;
					ping(ws);
					i++;
				}
			}
			heartbeat(wss.children[p]);
		});
	}
};

const ping = (ws: WebSocket) => {
	ws.send('==ping==');
}

const findWssByPath = (path: string) => {
	let currentPath = '';
	let currentWss = wssByPaths;
	path.split('/').forEach(p => {
		if (p) {
			currentPath += '/' + p;

			if (!currentWss.children || !currentWss.children[currentPath]) {
				console.log(`Cannot find wss for path ${currentPath}`);
				return null;
			}

			currentWss = currentWss.children[currentPath];
		}
	});

	return currentWss;
}

const broadcastMessageToAllChildren = (wsses: Record<string, WssByPath>, evtName: string, payload: string) => {
	if (wsses) {
		Object.keys(wsses).forEach(p => {
			wsses[p].connections?.forEach(ws => {
				ws.send(`["${evtName}",${payload}]`)
			});
			broadcastMessageToAllChildren(wsses[p].children, evtName, payload);
		});
	}
}

export const initWssConnection = (path: string) => {
	let currentPath = '';
	let currentWss = wssByPaths;

	path.split('/').forEach(p => {
		if (p) {
			currentPath += '/' + p;

			if (!currentWss.children[currentPath]) {
				const newWss: WssByPath = {
					wss: new WebSocketServer({ noServer: true }),
					connections: [],
					children: {}
				}
				currentWss.children[currentPath] = newWss;

				newWss.wss?.on('connection', (ws: WebSocketWithFlag) => {
					newWss.connections?.push(ws);

					ws.on('message', (message, isBinary) => {
						if (!isBinary && (message as Buffer).toString() === '==pong==') {
							ws.isAlive = true;
						}
					});

					ws.isAlive = true;
					ping(ws);

					ws.on('close', () => {
						ws.terminate();
						newWss.connections?.splice(newWss.connections?.indexOf(ws), 1);
					});
				});

				newWss.wss?.on('close', () => {
					newWss.connections?.forEach(ws => {
						ws.terminate();
					});
					newWss.connections = [];
				});
			}

			currentWss = currentWss.children[currentPath];
		}
	});
}



export const broadcastMessage = (path: string, evtName: string, payload: string) => {
	const wss = findWssByPath(path);

	if (wss) {
		wss.connections?.forEach(ws => {
			ws.send(`["${evtName}",${payload}]`);
		});

		broadcastMessageToAllChildren(wss.children, evtName, payload);
	}
}


export const init = (server: Server) => {
	if (!initialized) {
		initialized = true;

		server.on('upgrade', (request, socket, head) => {
			if (request.url?.startsWith('/socket.io')) {
				return;
			}

			if (!request.url?.startsWith('/websocket')) {
				socket.destroy();
				return;
			}

			apiKeyAuthorization({ ...request, ...parse(request.url, true) } as unknown as Request, null as unknown as Response, (err) => {
				if (err) {
				  socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
				  socket.destroy();
				  return;
				}

				const { pathname } = parse(request.url?.replace('/websocket', '') || '');
				const wss = findWssByPath(pathname);

				if (wss) {
					wss.wss?.handleUpgrade(request, socket, head, (ws) => {
						wss.wss?.emit('connection', ws, request);
					});
				} else {
					socket.destroy();
				}
			});
		});

		setInterval(() => {
			heartbeat(wssByPaths);
		}, 20000);
	}
};



