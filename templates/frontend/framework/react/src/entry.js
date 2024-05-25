"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./App"));
const rootElement = document.getElementById("root");
const root = (0, client_1.createRoot)(rootElement);
root.render(<react_1.StrictMode>
		<App_1.default />
	</react_1.StrictMode>);
