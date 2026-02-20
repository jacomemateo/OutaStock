import "./App.css";
import "./styles/Global.css";
import { Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import DashBoard from "./components/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoadingScreen />} />
      <Route path="/dashboard" element={<DashBoard />} />
    </Routes>
  );
}

export default App;
