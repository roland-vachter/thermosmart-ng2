const WebSocketServer = require('ws').WebSocketServer;
const parseUrl = require('url').parse;
const apiKeyAuthorization = require('../middlewares/apiKey');

let initialized = false;

exports.initWssConnection = (path) => {
	let currentPath = '';
	let currentWss = wssByPaths;

	path.split('/').forEach(p => {
		if (p) {
			currentPath += '/' + p;

			if (!currentWss.children[currentPath]) {
				const newWss = {
					wss: new WebSocketServer({ noServer: true }),
					connections: [],
					children: {}
				}
				currentWss.children[currentPath] = newWss;

				newWss.wss.on('connection', (ws) => {
					newWss.connections.push(ws);

					ws.on('message', message => {
						if (Buffer.from(message).toString() === '==pong==') {
							ws.isAlive = true;
						}
					});

					ws.isAlive = true;
					ping(ws);

					ws.on('close', () => {
						ws.terminate();
						newWss.connections.splice(newWss.connections.indexOf(ws), 1);
					});
				});

				newWss.wss.on('close', () => {
					newWss.connections.forEach(ws => {
						ws.terminate();
					});
					newWss.connections = [];
				});
			}

			currentWss = currentWss.children[currentPath];
		}
	});
}

const findWssByPath = (path) => {
	let currentPath = '';
	let currentWss  = wssByPaths;
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

const broadcastMessageToAllChildren = (wsses) => {
	if (wsses) {
		Object.keys(wsses).forEach(p => {
			wsses[p].connections.forEach(ws => {
				ws.send(`["${evtName}",${payload}]`)
			});
			broadcastMessageToAllChildren(wsses[p].children);
		});
	}
}

exports.broadcastMessage = (path, evtName, payload) => {
	const wss = findWssByPath(path);

	if (wss) {
		wss.connections.forEach(ws => {
			ws.send(`["${evtName}",${payload}]`);
		});

		broadcastMessageToAllChildren(wss.children);
	}
}


const wssByPaths = {
	children: {}
};


exports.init = function (server) {
	if (!initialized) {
		initialized = true;

		server.on('upgrade', (request, socket, head) => {
			if (request.url.startsWith('/socket.io')) {
				return;
			}

			if (!request.url.startsWith('/websocket')) {
				socket.destroy();
				return;
			}

			apiKeyAuthorization({ ...request, ...parseUrl(request.url, true) }, null, (err) => {
				if (err) {
				  socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
				  socket.destroy();
				  return;
				}

				const { pathname } = parseUrl(request.url.replace('/websocket', ''));
				const wss = findWssByPath(pathname);

				if (wss) {
					wss.wss.handleUpgrade(request, socket, head, function done(ws) {
						wss.wss.emit('connection', ws, request);
					});
				} else {
					socket.destroy();
				}
			});
		});
	}
};


const heartbeat = (wss) => {
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

setInterval(() => {
	heartbeat(wssByPaths);
}, 20000);

const ping = (ws) => {
	ws.send('==ping==');
}
