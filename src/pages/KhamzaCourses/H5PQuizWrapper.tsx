import React, { Suspense } from 'react';
import { Card, Alert, Spin } from 'antd';

const H5PQuizWrapper: React.FC = () => {
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const H5PQuizManager = React.lazy(() => 
    import('@app/Khamza_planB/H5PQuizManager').catch(() => {
      setHasError(true);
      setErrorMessage('Не удалось загрузить компонент H5P Quiz Manager');
      return { default: () => null };
    })
  );

  if (hasError) {
    return (
      <Card>
        <Alert
          message="Ошибка загрузки"
          description={errorMessage}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Suspense fallback={
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Загрузка H5P Quiz Manager...</p>
        </div>
      </Card>
    }>
      <H5PQuizManager />
    </Suspense>
  );
};

export default H5PQuizWrapper;
