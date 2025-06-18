
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import { getWorkspaceIdAndApiKey } from '@/components/ChatWidget/utils/storage';
import { useEffect, useState } from 'react';

const Index = () => {
  // Check if workspace Id and ApiKey is there in Localstorage
  const { apiKey, workspaceId } = getWorkspaceIdAndApiKey();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [workspaceIdInput, setWorkspaceIdInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const setApiKey = (apiKey: string) => {
    // Add regex for uuid check
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(apiKey)) {
      alert('Invalid Api Key');
      return;
    }
    localStorage.setItem('pullse_api_key', apiKey);
  }

  const setWorkspaceId = (workspaceId: string) => {
    // Add regex for uuid check
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(workspaceId)) {
      alert('Invalid Workspace Id');
      return;
    }
    localStorage.setItem('pullse_workspace_id', workspaceId);
  }

  useEffect(() => {
    if (apiKey && workspaceId) {
      const url = `http://localhost:4000/api/widgets/getWidgetConfig/${apiKey}?workspace_id=${workspaceId}`;
      const body = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }).then((response) => {
        if (response.status >= 400) {
          alert('Invalid Api Key or Workspace Id');
          // Clear the localstorage
          localStorage.removeItem('pullse_api_key');
          localStorage.removeItem('pullse_workspace_id');
          window.location.reload();
        } else {
          setIsSuccess(true);
        }
      }).catch((error) => {
        console.error(error);
      });
    }
  }, [apiKey, workspaceId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-purple-50 text-center">
      <div className="max-w-2xl px-6">
        <h1 className="text-5xl font-bold mb-4 text-vivid-purple">
          Pullse Chat Widget Development Preview
        </h1>

        {
          (!apiKey || !workspaceId) && (
            <div>
              <p className="text-xl text-gray-600 mb-8">
                Api Key and Workspace Id not present
              </p>
              <input type="text" placeholder="Api Key" className="w-full p-2 border border-gray-300 rounded-md" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} />
              <input type="text" placeholder="Workspace Id" className="w-full p-2 border border-gray-300 rounded-md" value={workspaceIdInput} onChange={(e) => setWorkspaceIdInput(e.target.value)} />

              <button className="w-full p-2 border border-gray-300 rounded-md" onClick={() => {
                setApiKey(apiKeyInput);
                setWorkspaceId(workspaceIdInput);
                window.location.reload();
              }}>
                Save
              </button>
            </div>
          )
        }
        {
          (apiKey && workspaceId && isSuccess) && <ChatWidget />
        }
      </div>
    </div>
  );
};

export default Index;
