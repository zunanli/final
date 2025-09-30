import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../style.css';
import { Button } from "@/components/ui/button"

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((r) => r.json())
      .then((d) => setMsg(d.message))
      .catch(() => setMsg('api error'));
  }, []);

  return (
    <div>
      <p>Client script loaded.</p>
      <p>/api/hello: {msg}</p>
      <Button>DDDDDDEPLOY</Button>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}


