import * as WebSocket from "ws";
import connectionLogService from "./services/connectionlogservice";
import { ConnectionLog } from "Apptypes";
import { generateLogHash, getGeoInfoFromIp } from "./util/helpers";

interface QMsg {
  data: ConnectionLog;
  executor: Function;
}

class Queue {
  private messages: Array<QMsg> = new Array;
  private isRunning = false;

  private next() {
    if (this.messages.length === 0) {
      this.isRunning = false;
      return;
    }
    const tempMsg = this.messages.splice(0, 1)[0];
    tempMsg.executor(tempMsg.data, () => {
      this.next();
    });
  }

  private start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.next();
  }

  public push(msg: QMsg) {
    this.messages.push(msg);
    this.start();
  }

}


export default class WebSocketServer {
  private wss: WebSocket.Server;
  private queue: Queue;
  // private server: any;
  constructor(port: number) {
    this.wss = new WebSocket.Server({ port: port || 4444 });
    this.queue = new Queue;
  }

  private async onMsgHandler(ws: WebSocket, log: ConnectionLog, next: Function) {
    try {
      log.logDataHash = generateLogHash(log);
      const hasDuplicate = await connectionLogService.getPossibleDuplicate(log);
      if (hasDuplicate) {
        console.log("Ignored potential duplicate");
        return next();
      }

      log.peer_requester.geo_info = await getGeoInfoFromIp(log.peer_requester.ip);
      log.peer_responder.geo_info = await getGeoInfoFromIp(log.peer_responder.ip);

      await connectionLogService.insert(log);
      this.wss.clients.forEach(function each(client: any) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          log.createdAt = new Date();
          client.send(JSON.stringify(log));
        }
      });
      next();
    } catch (e) {
      console.log(e);
    }
  }

  start() {
    this.wss.on("connection", (ws: WebSocket) => {
      // send immediatly a feedback to the incoming connection
      ws.send("user connected");

      ws.on("error", function (e) {
        console.log(e);
      });

      // connection is up, let's add a simple simple event
      ws.on("message", async (message: string) => {
        // console.log(`Received -> ${message}`);

        // Todo: Update code if crate code gets updated.
        // Replacing chars to convert json string into json object.
        message = message.toString().replace("\\", "\\\\")
          .replace("\"{\"", "{\"")
          .replace("}}}}\"", "}}}}")
          .replace("}\"}", "}}");

        if (message.includes("peer_requester")) {
          try {
            // Extract msg data from the data received from websocket data
            const msgData = JSON.parse(message).msg;
            this.queue.push({
              data: msgData,
              executor: (data: ConnectionLog, next: Function) => {
                this.onMsgHandler(ws, data, next);
              }
            });
          } catch (e) {
            return console.error(e.message);
          }
        }
      });
    });
    this.wss.on("error", function (e) {
      console.log(e);
    });
  }
}
