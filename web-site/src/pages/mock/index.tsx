import React from "react";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import Mock from "@rr-utils/mock";
import MonacoEditor, { OnMount } from "@monaco-editor/react";

export default function () {
  const [code, setCode] = React.useState(
    `interface User {\n	name: string;\n	age: number;\n}`,
  );
  const [json, setJson] = React.useState(
    JSON.stringify({ name: "maeNx", age: 54106.47 }, null, 2),
  );
  const [name, setName] = React.useState("User");
  const handleEditorMount: OnMount = (editor, monaco) => {
    if (!monaco.languages.typescript) return;
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      esModuleInterop: true,
    });
  };
  const mock = React.useMemo(() => {
    return new Mock(code);
  }, [code]);

  const handleClick = () => {
    const mock = new Mock(code);
    const json = mock.generate(name);
    setJson(JSON.stringify(json, null, 2));
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setName(newValue);
  };

  return (
    <Layout title="Hello" description="Hello React Page">
      <div className={styles.container}>
        <MonacoEditor
          language={"typescript"}
          width={"50vw"}
          height={"60vh"}
          path="mock.tsx"
          onMount={handleEditorMount}
          value={code}
          onChange={setCode}
        />
        <MonacoEditor
          language={"json"}
          width={"50vw"}
          height={"60vh"}
          path="mock_json.tsx"
          value={json}
          onChange={setJson}
        />
      </div>
      <div>
        name: <input value={name} onChange={handleInputChange} type="text" />
        <button onClick={handleClick}>generate</button>
      </div>
    </Layout>
  );
}
