import React from "react";
import Router from "./Router";
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8082/api"
});

function App() {
  return (
    <>
      <Router />
    </>
  );
}

export default App;
