import { Home } from "./pages/Home";
import { UnitProvider } from "./context/UnitContext";

function App() {
  return (
    <UnitProvider>
      <Home />
    </UnitProvider>
  );
}

export default App;