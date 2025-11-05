
import { useAuth0 } from '@auth0/auth0-react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useRef, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import {
  fetchChart,
  fetchChatDialog,
  fetchFlowsTable,
  fetchQueryStatus,
  fetchRetirementInputs,
  sendMessage
} from './api';
import Banner from './components/Banner';
import ChatWindow from './components/ChatWindow';
import PollingProgressBar from './components/PollingProgressBar';
import ResultsWindow from './components/ResultsWindow';
import Plans from './pages/Plans';
import Settings from './pages/Settings';
import theme from './theme';


function parseDialogToMessages(dialogText) {
  // Supports multiline dialog blocks with [USER]: and [ASSISTANT]: markers
  if (!dialogText) return [];
  const messages = [];
  let currentSender = null;
  let currentText = [];
  const flush = () => {
    if (currentSender && currentText.length > 0) {
      messages.push({ sender: currentSender, text: currentText.join('\n').trim() });
    }
    currentSender = null;
    currentText = [];
  };
  dialogText.split(/\r?\n/).forEach(line => {
    const userMatch = line.match(/^\[?USER\]?:?/i);
    const assistantMatch = line.match(/^\[?ASSISTANT\]?:?/i);
    if (userMatch) {
      flush();
      currentSender = 'user';
      currentText.push(line.replace(/^\[?USER\]?:?/i, '').trim());
    } else if (assistantMatch) {
      flush();
      currentSender = 'agent';
      currentText.push(line.replace(/^\[?ASSISTANT\]?:?/i, '').trim());
    } else {
      if (currentSender) {
        currentText.push(line);
      }
    }
  });
  flush();
  return messages;
}

function MainChat() {
  const { getAccessTokenSilently } = useAuth0();
  const [messages, setMessages] = useState([
    { sender: 'agent', text: 'Welcome to LeisurePlan.App! How can I help you?' },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [queryId, setQueryId] = useState(null);
  const [results, setResults] = useState({ images: [], tables: [] });
  const [dialog, setDialog] = useState('');
  const [retInputs, setRetInputs] = useState(null);
  const [flowsUrl, setFlowsUrl] = useState(null);
  const [balancesUrl, setBalancesUrl] = useState(null);
  const [queryStatus, setQueryStatus] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [maxPolls] = useState(300);
  const pollRef = useRef();
  const isNewQueryRef = useRef(false);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // Send message and start polling for status
  const handleSend = async (text) => {
    setMessages((msgs) => [...msgs, { sender: 'user', text }]);
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await sendMessage(text, sessionId, token);
      setSessionId(res.chatSessionId);
      setQueryId(res.chatQueryId);
      setSelectedQueryId(res.chatQueryId); // Auto-select the new query
      isNewQueryRef.current = true; // Mark this as a new query (not a historical click)
      setMessages((msgs) => [...msgs, { sender: 'agent', text: res.reply || 'Message sent. Waiting for results...', queryId: res.chatQueryId }]);
      pollQueryStatus(res.chatSessionId, res.chatQueryId);
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Error: ' + e.message }]);
    } finally {
      setLoading(false);
    }
  };

  // Poll for query status and load results when done
  const pollQueryStatus = async (sessId, qId) => {
    setQueryStatus('Working');
    setPollCount(0);
    const poll = async () => {
      setPollCount(prev => prev + 1);
      const currentPoll = pollCount + 1;
      try {
        const token = await getAccessTokenSilently();
        const status = await fetchQueryStatus(sessId, qId, token);
        setQueryStatus(status);
        if (status === 'Working' || status === 'Preprocessing') {
          // Update dialog while working
          try {
            const dialogText = await fetchChatDialog(sessId, token);
            setDialog(dialogText);
          } catch (err) {
            // Ignore dialog fetch errors while working
          }
          if (currentPoll < maxPolls) setTimeout(poll, 1000);
        } else if (status === 'Done') {
          await loadResults(sessId, qId);
        } else if (status === 'Failed') {
          setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Query failed.' }]);
        } else if (status === 'Timeout') {
          setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Query timed out, try again.' }]);
        }
      } catch (e) {
        if (currentPoll < maxPolls) setTimeout(poll, 1000);
      }
    };
    pollRef.current = poll;
    poll();
  };

  // Load all results (dialog, model inputs, charts)
  const loadResults = async (sessId, qId) => {
    try {
      const token = await getAccessTokenSilently();

      // Dialog
      const dialogText = await fetchChatDialog(sessId, token);
      setDialog(dialogText);

      // Parse dialog and update the last assistant message with actual response
      const parsedMessages = parseDialogToMessages(dialogText);

      if (parsedMessages.length > 0) {
        // Find the last assistant message in parsed dialog
        const lastAssistantMessage = parsedMessages.filter(m => m.sender === 'agent').pop();
        if (lastAssistantMessage) {
          // Update messages: replace the last agent message with the actual response
          setMessages((msgs) => {
            const newMsgs = [...msgs];
            // Find last agent message index
            for (let i = newMsgs.length - 1; i >= 0; i--) {
              if (newMsgs[i].sender === 'agent' && newMsgs[i].queryId === qId) {
                newMsgs[i] = { ...newMsgs[i], text: lastAssistantMessage.text };
                break;
              }
            }
            return newMsgs;
          });
          // Only scroll if this is a NEW query (not a historical click)
          if (isNewQueryRef.current) {
            setShouldScrollToBottom(true);
          }
        }
      }

      // Model Inputs
      try {
        const inputs = await fetchRetirementInputs(sessId, qId, token);
        setRetInputs(inputs);
      } catch (err) {
        // Ignore input fetch errors
      }
      // Charts
      try {
        const flowsBlob = await fetchChart(sessId, qId, 'Flows', token);
        const flowsObjectUrl = URL.createObjectURL(flowsBlob);
        setFlowsUrl(flowsObjectUrl);
      } catch (err) {
        setFlowsUrl(null);
      }
      try {
        const balancesBlob = await fetchChart(sessId, qId, 'Balances', token);
        const balancesObjectUrl = URL.createObjectURL(balancesBlob);
        setBalancesUrl(balancesObjectUrl);
      } catch (err) {
        setBalancesUrl(null);
      }
      // Optionally update messages/results
      setResults((r) => ({ ...r }));
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'agent', text: 'Error loading results: ' + e.message }]);
    }
  };

  // Handler for clicking on a query ID
  const handleQueryIdClick = async (clickedQueryId) => {
    setSelectedQueryId(clickedQueryId);
    isNewQueryRef.current = false; // This is a historical click, not a new query

    // Clear existing results first to force re-render
    setRetInputs(null);
    setFlowsUrl(null);
    setBalancesUrl(null);

    // Load results for the selected query
    if (sessionId) {
      await loadResults(sessionId, clickedQueryId);
    }
  };

  // Handler for clicking on Monthly Details link
  const handleDetailsClick = async (detailsLink) => {
    try {
      const token = await getAccessTokenSilently();
      const html = await fetchFlowsTable(sessionId, selectedQueryId, token);

      // Open HTML in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (e) {
      console.error('Failed to load monthly details:', e);
      alert('Failed to load monthly details: ' + e.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Column 1: Chat */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        <PollingProgressBar pollCount={pollCount} maxPolls={maxPolls} loading={queryStatus === 'Working'} />
        <ChatWindow
          messages={messages}
          onSend={handleSend}
          loading={loading}
          onQueryIdClick={handleQueryIdClick}
          selectedQueryId={selectedQueryId}
          shouldScrollToBottom={shouldScrollToBottom}
          onScrollComplete={() => setShouldScrollToBottom(false)}
          sessionId={sessionId}
        />
      </Box>

      {/* Column 2: Results */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: 2,
        backgroundColor: '#fafafa'
      }}>
        <ResultsWindow
          images={[
            flowsUrl ? { src: flowsUrl, alt: 'Flows Chart', detailsLink: sessionId && selectedQueryId ? `/api/Chat/FlowsTable?sessionId=${sessionId}&queryId=${selectedQueryId}` : null } : null,
            balancesUrl ? { src: balancesUrl, alt: 'Balances Chart', detailsLink: sessionId && selectedQueryId ? `/api/Chat/FlowsTable?sessionId=${sessionId}&queryId=${selectedQueryId}` : null } : null,
          ].filter(Boolean)}
          tables={retInputs ? [
            {
              title: 'Retiree Personal Data',
              headers: ['Field', 'Value'],
              rows: retInputs.retirementPlanningSimulationInputs?.retireePersonalData ? Object.entries(retInputs.retirementPlanningSimulationInputs.retireePersonalData) : [],
              sideBySide: true,
              rowGroup: 0
            },
            {
              title: 'Starting Account Balances',
              headers: ['Account Type', 'Balance', 'Date'],
              rows: (retInputs.retirementPlanningSimulationInputs?.accounts || []).map(a => [a.accountType, a.balance, a.date]),
              sideBySide: true,
              rowGroup: 0
            },
            {
              title: 'Simulation Settings and Assumptions',
              headers: ['Setting', 'Value'],
              rows: retInputs.simulationSettingsAndAssumptionsDto ? Object.entries(retInputs.simulationSettingsAndAssumptionsDto) : [],
              sideBySide: true,
              rowGroup: 1
            },
            {
              title: 'Investor Assumptions',
              headers: ['Setting', 'Value'],
              rows: retInputs.retirementPlanningSimulationInputs?.investorAssumptions ? Object.entries(retInputs.retirementPlanningSimulationInputs.investorAssumptions) : [],
              sideBySide: true,
              rowGroup: 1
            },
          ] : []}
          queryId={selectedQueryId || queryId}
          onDetailsClick={handleDetailsClick}
        />
      </Box>
    </Box>
  );
}

function App() {
  console.debug('[App] launched');
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Banner />
          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <Routes>
              <Route path="/plans" element={<Plans />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<MainChat />} />
            </Routes>
          </Box>
          <Box sx={{
            borderTop: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            padding: '8px 16px',
            fontSize: '0.75rem',
            color: '#666',
            textAlign: 'left',
            lineHeight: 1.4
          }}>
            <strong>Disclaimer:</strong> The information and calculations provided on this website are for educational purposes only and are not intended as financial, investment, tax, or legal advice. Individual circumstances vary, and you should consult with a qualified financial advisor, tax professional, or attorney before making any decisions based on the information provided.
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
