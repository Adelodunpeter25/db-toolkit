import React from 'react';
import { useParams } from 'react-router-dom';

function QueryPage() {
  const { connectionId } = useParams();

  return (
    <div className="query-page">
      <h2>Query Editor</h2>
      <p>Connection ID: {connectionId}</p>
    </div>
  );
}

export default QueryPage;
