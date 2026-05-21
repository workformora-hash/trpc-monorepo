import { EventEmitter } from "events";

export const formEvents = new EventEmitter();
formEvents.setMaxListeners(100);
