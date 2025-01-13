import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { platform } from "@tauri-apps/plugin-os";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [rustVersion, setRustVersion] = useState("");
  const [isEnabledStatus, setIsEnabledStatus] = useState(false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  async function getRustVersion() {
    setRustVersion(await invoke("get_rust_version"));
  }

  async function checkAutostartStatus() {
    setIsEnabledStatus(await isEnabled());
    console.log("Autostart status:", isEnabledStatus);
  }

  useEffect(() => {
    getRustVersion();
  }, []);

  useEffect(() => {
    checkAutostartStatus();
  }, []);

  const openDialog = async () => {
    const currentPlatform = platform();
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
      sendNotification({
        title: "Tauri App",
        body: `You are running on ${currentPlatform}`,
      });
    }
  };

  const toggleAutostart = async () => {
    if (await isEnabled()) {
      await disable();
      console.log("Autostart disabled");
    } else {
      await enable();
      console.log("Autostart enabled");
    }
    checkAutostartStatus();
  };

  const resizeWindow = async () => {
    await invoke("resize_window", { width, height });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Tauri + React</h1>
      <p className="text-lg mb-4">Rust version: {rustVersion}</p>
      <div className="flex space-x-4 mb-4">
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img src="/vite.svg" className="w-16 h-16" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" rel="noopener noreferrer">
          <img src="/tauri.svg" className="w-16 h-16" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="w-16 h-16" alt="React logo" />
        </a>
      </div>

      <p className="text-center mb-4">
        Click on the Tauri, Vite, and React logos to learn more.
      </p>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={toggleAutostart}
          className={`px-4 py-2 rounded ${
            isEnabledStatus
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {isEnabledStatus ? "Disable" : "Enable"} Autostart
        </button>
        <button
          onClick={openDialog}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          What is my platform?
        </button>
      </div>

      <form
        className="flex flex-col items-center mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          resizeWindow();
        }}
      >
        <input
          type="text"
          placeholder="Enter a width..."
          className="border border-gray-300 rounded p-2 mb-2 w-1/2"
          onChange={(e) => setWidth(e.currentTarget.value)}
          value={width}
        />
        <input
          type="text"
          placeholder="Enter a height..."
          className="border border-gray-300 rounded p-2 mb-2 w-1/2"
          onChange={(e) => setHeight(e.currentTarget.value)}
          value={height}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Resize
        </button>
      </form>

      <form
        className="flex flex-col items-center"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          className="border border-gray-300 rounded p-2 mb-2"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Greet
        </button>
      </form>
      <p className="mt-4 text-lg">{greetMsg}</p>
    </main>
  );
}

export default App;
