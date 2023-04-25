import PdfViewerComponent from "./components/PdfViewerComponent";
import "./App.css";

function App() {
  const document = "another-example.pdf" // Replace with vista pdf

  return (
    <div className="App">
      <div className="App-viewer">
        <PdfViewerComponent document={document} />
      </div>
    </div>
  );
}

export default App;
