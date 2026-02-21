import "./App.css";
import "./styles/Global.css";
import { Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import Template from "./components/Template";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoadingScreen />} />
      {/* The /* tells the router: "Let Template handle any sub-paths after /dashboard" */}
      <Route path="/dashboard/*" element={<Template />} />
    </Routes>
  );
}

export default App;
