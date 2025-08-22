import React from 'react';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

const CreateCoursePage: React.FC = () => {
  return (
    <>
      <PageTitle>Создать курс</PageTitle>
      <div style={{ width: '100%', height: 'calc(100vh - 160px)' }}>
        <iframe
          title="H5P Builder"
          src="http://localhost:3001/studio/builder"
          style={{ border: 0, width: '100%', height: '100%' }}
          allow="clipboard-write *; clipboard-read *;"
        />
      </div>
    </>
  );
};

export default CreateCoursePage;
 