import React from 'react';
import {
  createAmplifyAuthAdapter,
  createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';
import '@aws-amplify/ui-react-storage/styles.css';
import './App.css';

import config from '../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { Authenticator, Button, Flex, Link, StepperField, Text  } from '@aws-amplify/ui-react';
import { generateUrlHandler } from './generateUrl';

Amplify.configure(config);

const { StorageBrowser,useAction, useView } = createStorageBrowser({
  config: createAmplifyAuthAdapter(),
  actions: {
  custom: {
    generateUrl: {
      actionListItem: {
        icon: 'download',
        label: 'Generate Download Links',
        disable: (selected) => !selected?.length,
      },
      handler: generateUrlHandler,
      viewName: 'GenerateUrlView',
    },
  },
},
});

const GenerateUrlView = () => {
  const [duration, setDuration] = React.useState(60);

  const { onActionExit, fileDataItems } = useView('LocationDetail');

  const items = React.useMemo(
    () =>
      !fileDataItems
        ? []
        : fileDataItems.map((item) => ({ ...item, duration })),
    [fileDataItems, duration]
  );

  const [
    // Execution status and result of each task. The status includes  'CANCELED', 'FAILED', 'COMPLETE', 'OVERWRITE_PREVENTED', 'QUEUED', 'PENDING'.
    { tasks },
    // Start executing the action against the provided `items`.
    handleGenerate,
  ] = useAction(
    // Name of the action.
    'generateUrl',
    // List of action inputs.
    { items }
  );

  return (
    <Flex direction="column">
      <Button onClick={onActionExit}>Exit</Button>
      <StepperField
        label="Duration (minutes)"
        step={15}
        value={duration}
        min={15}
        max={300}
        onStepChange={setDuration}
      />
      <Button onClick={() => handleGenerate()}>Start</Button>
      {!tasks
        ? null
        : tasks.map(({ data, status, value }) => {
            return (
              <Flex direction="row" key={data.fileKey}>
                <Text>{data.fileKey}</Text>
                {value?.link ? <Link href={value.link}>link</Link> : null}
                <Text>{status}</Text>
              </Flex>
            );
          })}
    </Flex>
  );
};

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <div className="header">
            <h1>{`Hello ${user?.username}`}</h1>
            <Button onClick={signOut}>Sign out</Button>
          </div>
          <StorageBrowser views={{ GenerateUrlView }} />
        </>
      )}
    </Authenticator>
  );
}

export default App;
