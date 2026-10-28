import React from 'react';
import { createRoot } from 'react-dom/client';
import FinAssistApp from './routes/index';
import './finassist.css';

const root = document.getElementById('root');
if (!root) throw new Error('Required #root element was not found');
createRoot(root).render(<React.StrictMode><FinAssistApp /></React.StrictMode>);
