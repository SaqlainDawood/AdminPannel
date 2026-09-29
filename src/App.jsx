import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <Router>
        <AppRoutes />
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
      />
    </>
  );
}

export default App;