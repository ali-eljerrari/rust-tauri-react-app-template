import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
// import { ask } from "@tauri-apps/plugin-dialog";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
// when using `"withGlobalTauri": true`, you may use
// const { enable, isEnabled, disable } = window.__TAURI__.autostart;

import { platform } from "@tauri-apps/plugin-os";
// when using `"withGlobalTauri": true`, you may use

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
// when using `"withGlobalTauri": true`, you may use
// const { isPermissionGranted, requestPermission, sendNotification, } = window.__TAURI__.notification;

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [rustVersion, setRustVersion] = useState("");
  const [isEnabledStatus, setIsEnabledStatus] = useState(false);
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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

    // Do you have permission to send a notification?
    let permissionGranted = await isPermissionGranted();

    // If not we need to request it
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    // Once permission has been granted we can send the notification
    if (permissionGranted) {
      sendNotification({
        title: "Tauri App",
        body: `You are running on ${currentPlatform}`,
      });
    }

    // const answer = await ask(currentPlatform, {
    //   title: "Tauri App",
    //   kind: "warning",
    // });
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

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>
      <p>Rust version: {rustVersion}</p>
      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div>
        {/* <button onClick={openDialog}>Click Me</button> */}
        <button onClick={toggleAutostart}>
          {isEnabledStatus ? "Disable" : "Enable"} Autostart
        </button>
        <button onClick={openDialog}>What is my platform?</button>
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
